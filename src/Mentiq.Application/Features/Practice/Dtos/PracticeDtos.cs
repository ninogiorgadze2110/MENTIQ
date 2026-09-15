using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Practice.Dtos;

public sealed record SavePracticeSessionRequest
{
    [Required, MaxLength(128)]
    public string Title { get; init; } = string.Empty;

    [MaxLength(16)]
    public string Mode { get; init; } = "count";

    public int TotalQuestions { get; init; }
    public int CorrectCount { get; init; }
    public int WrongCount { get; init; }
    public int Score { get; init; }
    public int LongestStreak { get; init; }

    [Range(0, 100)]
    public int Accuracy { get; init; }

    public double AvgSeconds { get; init; }
    public int DurationSeconds { get; init; }
    public DateTime StartedAtUtc { get; init; }
}

public sealed record RecentSessionDto
{
    public string Title { get; init; } = string.Empty;
    public int Accuracy { get; init; }
    public int Score { get; init; }
    public int CorrectCount { get; init; }
    public int TotalQuestions { get; init; }
    public DateTime CompletedAtUtc { get; init; }
}

public sealed record ProgressResponse
{
    /// <summary>Consecutive calendar days with at least one session.</summary>
    public int DayStreak { get; init; }

    public int TotalSessions { get; init; }
    public int TotalQuestions { get; init; }
    public int AvgAccuracy { get; init; }
    public double AvgSeconds { get; init; }
    public int BestStreak { get; init; }

    /// <summary>Session counts for the last 7 days, oldest → newest.</summary>
    public int[] WeeklyActivity { get; init; } = new int[7];

    /// <summary>Accuracy of the most recent sessions, oldest → newest (for a sparkline).</summary>
    public int[] AccuracyTrend { get; init; } = System.Array.Empty<int>();

    /// <summary>Average seconds/question of the most recent sessions, oldest → newest.</summary>
    public double[] SecondsTrend { get; init; } = System.Array.Empty<double>();

    public IReadOnlyList<RecentSessionDto> RecentSessions { get; init; } = System.Array.Empty<RecentSessionDto>();
}
