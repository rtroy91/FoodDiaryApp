using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Middleware;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                "Not Found",
                "The requested resource was not found."),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "You are not authorized to perform this action."),
            InvalidOperationException ex when ex.Message.Contains("already registered", StringComparison.OrdinalIgnoreCase) =>
                (StatusCodes.Status409Conflict, "Conflict", "Email already registered."),
            InvalidOperationException => (
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "The request could not be processed."),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "Internal Server Error")
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled API exception");
        else
            logger.LogWarning(exception, "Handled API exception: {Title}", title);

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        }, cancellationToken);

        return true;
    }
}
