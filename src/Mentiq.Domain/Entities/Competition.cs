using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A time-boxed competition for a given grade. Participants play a mixed quiz
/// of that grade's operations while the window is open; their scores form the
/// competition leaderboard.
/// </summary>
public class Competition : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    /// <summary>Grade / class this competition is for (1–12).</summary>
    public int Grade { get; set; }

    public int QuestionCount { get; set; } = 20;

    /// <summary>Duration of a single participant's timed attempt, in seconds.</summary>
    public int QuizSeconds { get; set; } = 120;

    public DateTime StartsAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime EndsAtUtc { get; set; }

    public Guid CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
}

/// <summary>One participant's result in a competition (one attempt per user).</summary>
public class CompetitionEntry : BaseEntity
{
    public Guid CompetitionId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    public int Score { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int Accuracy { get; set; }
    public int DurationSeconds { get; set; }

    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}
