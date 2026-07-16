namespace FoodDiary.Api.Interfaces;

public interface IEmailService
{
    bool IsConfigured { get; }
    Task SendPasswordResetEmailAsync(string toEmail, string resetUrl, CancellationToken cancellationToken);
}
