using System.Text.Json;
using Mentiq.Api.Common;
using Mentiq.Application.Common.Exceptions;

namespace Mentiq.Api.Middleware;

/// <summary>
/// Centralized exception handling: converts known application exceptions into
/// consistent <see cref="ApiError"/> responses and hides internal details for
/// unexpected errors.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        var (status, message, errors) = Map(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception processing {Path}", context.Request.Path);
        }
        else
        {
            _logger.LogWarning("Handled {Type} on {Path}: {Message}",
                exception.GetType().Name, context.Request.Path, exception.Message);
        }

        var payload = new ApiError
        {
            Status = status,
            Message = message,
            TraceId = context.TraceIdentifier,
            Errors = errors
        };

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";

        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, options));
    }

    private (int Status, string Message, IDictionary<string, string[]>? Errors) Map(Exception exception)
    {
        return exception switch
        {
            ValidationException v => (
                StatusCodes.Status422UnprocessableEntity,
                v.Message,
                v.Errors.Count > 0 ? new Dictionary<string, string[]>(v.Errors) : null),
            NotFoundException => (StatusCodes.Status404NotFound, exception.Message, null),
            ConflictException => (StatusCodes.Status409Conflict, exception.Message, null),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, exception.Message, null),
            ForbiddenException => (StatusCodes.Status403Forbidden, exception.Message, null),
            _ => (
                StatusCodes.Status500InternalServerError,
                _environment.IsDevelopment() ? exception.Message : "An unexpected error occurred.",
                null)
        };
    }
}
