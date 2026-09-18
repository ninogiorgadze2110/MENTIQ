using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A child's rolling progress in one cognitive skill. Drives adaptive difficulty
/// (the generator reads <see cref="Level"/>) and feeds the parent dashboard.
/// One row per (user, skill).
/// </summary>
public class SkillProgress : BaseEntity
{
    public Guid UserId { get; set; }

    public string Skill { get; set; } = string.Empty;

    /// <summary>Current difficulty level (starts at 1).</summary>
    public int Level { get; set; } = 1;

    /// <summary>Accumulated stars/points.</summary>
    public int Score { get; set; }

    public int TotalAttempts { get; set; }
    public int CorrectAttempts { get; set; }

    /// <summary>Running average of first-try response time, in milliseconds.</summary>
    public double AverageResponseTimeMs { get; set; }

    /// <summary>Consecutive correct first-tries — used to raise the level gently.</summary>
    public int CorrectStreak { get; set; }
}
