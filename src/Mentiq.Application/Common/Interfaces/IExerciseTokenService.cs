namespace Mentiq.Application.Common.Interfaces;

/// <summary>
/// Signs and verifies exercise tokens. The correct answer travels to the client
/// only inside a signed, opaque token, so the client can never read or forge it;
/// on submit the server verifies the signature and grades the answer itself.
/// </summary>
public interface IExerciseTokenService
{
    string Issue(ExerciseTokenPayload payload);

    /// <summary>Returns the payload if the token is authentic and unexpired; otherwise null.</summary>
    ExerciseTokenPayload? Verify(string token);
}

public sealed record ExerciseTokenPayload
{
    public string Eid { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Skill { get; init; } = string.Empty;
    public string? World { get; init; }
    public int Difficulty { get; init; }
    public string Answer { get; init; } = string.Empty;
    public long ExpUnix { get; init; }
}
