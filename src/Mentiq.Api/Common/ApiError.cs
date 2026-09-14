namespace Mentiq.Api.Common;

/// <summary>
/// Consistent error payload returned for every non-success API response so the
/// Angular client can handle errors uniformly. Internal exception details are
/// never included.
/// </summary>
public sealed class ApiError
{
    public int Status { get; init; }

    public string Message { get; init; } = string.Empty;

    public string? TraceId { get; init; }

    /// <summary>Field-level validation errors, when applicable.</summary>
    public IDictionary<string, string[]>? Errors { get; init; }
}
