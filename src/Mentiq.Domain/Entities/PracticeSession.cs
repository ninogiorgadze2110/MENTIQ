using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A completed practice/quiz session, stored so a user's progress (streaks,
/// averages, activity) can be computed over time.
/// </summary>
public class PracticeSession : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Human label, e.g. "გამრავლება · კლასი 4" or a trick name.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>"count" or "time".</summary>
    public string Mode { get; set; } = "count";

    public int TotalQuestions { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int Score { get; set; }
    public int LongestStreak { get; set; }

    /// <summary>Accuracy percentage 0–100.</summary>
    public int Accuracy { get; set; }

    /// <summary>Average seconds per question.</summary>
    public double AvgSeconds { get; set; }

    /// <summary>Total elapsed seconds for the session.</summary>
    public int DurationSeconds { get; set; }

    public DateTime StartedAtUtc { get; set; }
    public DateTime CompletedAtUtc { get; set; } = DateTime.UtcNow;
}
