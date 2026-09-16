using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// One user's result in a given day's Daily Challenge — a 1-minute mixed-difficulty
/// drill for their grade. The challenge itself is not persisted (it is deterministic
/// per (date, grade)); only the results are stored, forming the daily leaderboard.
/// The challenge day rolls over at 06:00 Tbilisi time (see the service).
/// </summary>
public class DailyChallengeEntry : BaseEntity
{
    /// <summary>The challenge day key (date at 00:00 UTC). Rolls at 06:00 Tbilisi.</summary>
    public DateTime ChallengeDate { get; set; }

    /// <summary>Grade / class this entry competes in (1–12).</summary>
    public int Grade { get; set; }

    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    public int Score { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int Accuracy { get; set; }
    public int DurationSeconds { get; set; }

    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}
