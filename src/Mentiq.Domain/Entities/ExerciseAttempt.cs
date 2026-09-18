using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// One answer a child gave to a generated Kids exercise. Stored for the parent
/// dashboard and progression. The correct answer is captured too so accuracy and
/// difficulty can be analysed later without re-deriving the exercise.
/// </summary>
public class ExerciseAttempt : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Cognitive skill, e.g. "counting", "comparison".</summary>
    public string Skill { get; set; } = string.Empty;

    /// <summary>Exercise type, e.g. "counting".</summary>
    public string ExerciseType { get; set; } = string.Empty;

    /// <summary>World the exercise belonged to (e.g. "apples"). Optional.</summary>
    public string? World { get; set; }

    public int Difficulty { get; set; }

    public string CorrectAnswer { get; set; } = string.Empty;
    public string GivenAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }

    /// <summary>Time from showing the exercise to answering, in milliseconds.</summary>
    public int ResponseTimeMs { get; set; }

    /// <summary>1 for first try, 2 for the retry after a wrong answer, etc.</summary>
    public int AttemptNumber { get; set; } = 1;
}
