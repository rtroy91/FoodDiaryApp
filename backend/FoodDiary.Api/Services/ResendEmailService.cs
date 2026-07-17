using System.Net.Http.Headers;
using System.Net.Http.Json;
using FoodDiary.Api.Interfaces;

namespace FoodDiary.Api.Services;

public sealed class ResendEmailService(HttpClient httpClient, IConfiguration config) : IEmailService
{
    public bool IsConfigured => !string.IsNullOrWhiteSpace(config["Resend:ApiKey"] ?? config["RESEND_API_KEY"]);

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetUrl, CancellationToken cancellationToken)
    {
        var apiKey = config["Resend:ApiKey"] ?? config["RESEND_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Resend API key is not configured.");
        }

        var fromEmail = config["Resend:FromEmail"] ?? config["RESEND_FROM_EMAIL"] ?? "DiarEat Support <onboarding@resend.dev>";
        var subject = "Reset your DiarEat Account Password";
        var html = $"""
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1C1107">
              <h1 style="margin:0 0 12px">Reset your password</h1>
              <p>We received a request to reset your DiarEat Account Password.</p>
              <p><a href="{resetUrl}" style="display:inline-block;background:#B83224;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Reset password</a></p>
              <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
            </div>
            """;

        var payload = new
        {
            from = fromEmail,
            to = new[] { toEmail },
            subject,
            html,
            text = $"Reset your DiarEat password: {resetUrl}\n\nThis link expires in 30 minutes."
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Resend could not send the password reset email. {body}");
        }
    }
}
