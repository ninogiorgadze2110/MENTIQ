using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Competition.Dtos;

// ---- All-time grade leaderboard (practice points) ----

public sealed record LeaderboardEntry
{
    public int Rank { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public int TotalScore { get; init; }
    public int Sessions { get; init; }
    public bool IsCurrentUser { get; init; }
}

public sealed record LeaderboardResponse
{
    public int Grade { get; init; }
    public int Participants { get; init; }
    public int MyRank { get; init; }
    public int MyScore { get; init; }
    public IReadOnlyList<LeaderboardEntry> Entries { get; init; } = System.Array.Empty<LeaderboardEntry>();
}

// ---- Time-boxed competitions ----

public sealed record CreateCompetitionRequest
{
    [Required, MaxLength(128)]
    public string Title { get; init; } = string.Empty;

    /// <summary>Grade 1–12; 0 means "use my grade".</summary>
    [Range(0, 12)]
    public int Grade { get; init; }

    [Range(1, 168)]
    public int DurationHours { get; init; } = 12;

    [Range(5, 100)]
    public int QuestionCount { get; init; } = 20;
}

public sealed record SubmitEntryRequest
{
    public int Score { get; init; }
    public int CorrectCount { get; init; }
    public int TotalQuestions { get; init; }

    [Range(0, 100)]
    public int Accuracy { get; init; }

    public int DurationSeconds { get; init; }
}

public sealed record CompetitionDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public int Grade { get; init; }
    public int QuestionCount { get; init; }
    public DateTime StartsAtUtc { get; init; }
    public DateTime EndsAtUtc { get; init; }
    /// <summary>"active", "upcoming" or "ended".</summary>
    public string Status { get; init; } = "active";
    public int Participants { get; init; }
    public bool Played { get; init; }
    public int MyScore { get; init; }
    public string CreatedByName { get; init; } = string.Empty;
}

public sealed record CompetitionEntryDto
{
    public int Rank { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public int Score { get; init; }
    public int Accuracy { get; init; }
    public bool IsCurrentUser { get; init; }
}

public sealed record CompetitionDetailDto
{
    public CompetitionDto Competition { get; init; } = new();
    public IReadOnlyList<CompetitionEntryDto> Entries { get; init; } = System.Array.Empty<CompetitionEntryDto>();
}
