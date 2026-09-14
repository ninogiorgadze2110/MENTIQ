namespace Mentiq.Application.Common.Exceptions;

/// <summary>
/// Base type for domain/application errors that map to a well-known
/// HTTP status code by the API exception-handling middleware.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message)
    {
    }
}

/// <summary>Maps to HTTP 422 Unprocessable Entity.</summary>
public sealed class ValidationException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }
}

/// <summary>Maps to HTTP 404 Not Found.</summary>
public sealed class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>Maps to HTTP 409 Conflict.</summary>
public sealed class ConflictException : AppException
{
    public ConflictException(string message) : base(message)
    {
    }
}

/// <summary>Maps to HTTP 401 Unauthorized.</summary>
public sealed class UnauthorizedException : AppException
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}

/// <summary>Maps to HTTP 403 Forbidden.</summary>
public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
