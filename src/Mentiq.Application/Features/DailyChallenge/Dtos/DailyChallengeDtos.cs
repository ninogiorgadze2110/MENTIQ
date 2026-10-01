namespace Mentiq.Application.Features.DailyChallenge.Dtos;

/// <summary>The current day's challenge for the signed-in user's grade.</summary>
public sealed record DailyChallengeDto
{
    /// <summary>Challenge day key (UTC date). Rolls at 06:00 Tbilisi time.</summary>
    public DateTime Date { get; init; }

    public int Grade { get; init; }

    /// <summary>Duration of the timed drill, in seconds (always 60 for the daily challenge).</summary>
    public int QuizSeconds { get; init; } = 60;

    public bool Completed { get; init; }
    public int? MyScore { get; init; }
    public int? MyRank { get; init; }
    public int ParticipantCount { get; init; }

    /// <summary>UTC instant the challenge resets to a new one (next 06:00 Tbilisi).</summary>
    public DateTime ResetsAtUtc { get; init; }

    // ---- Progression-driven plan (see DailyPlanner) ----

    /// <summary>The skill the day focuses on (the user's weakest), e.g. "div".</summary>
    public string FocusSkill { get; init; } = string.Empty;

    /// <summary>Its Georgian name, e.g. "გაყოფა".</summary>
    public string FocusSkillName { get; init; } = string.Empty;

    /// <summary>Why today targets this skill, e.g. "დღეს ვარჯიშობ გაყოფაზე — აქ ყველაზე ნელი ხარ".</summary>
    public string Reason { get; init; } = string.Empty;

    /// <summary>Weekly "challenge day" — the focus is raised one belt.</summary>
    public bool IsChallengeDay { get; init; }

    /// <summary>Weighted skill/difficulty slices the drill is generated from.</summary>
    public IReadOnlyList<DailyPlanSegmentDto> Plan { get; init; } = Array.Empty<DailyPlanSegmentDto>();
}

/// <summary>One weighted slice of the daily drill: a skill at a difficulty (1–6).</summary>
public sealed record DailyPlanSegmentDto
{
    public string Skill { get; init; } = string.Empty;
    public int Difficulty { get; init; }
    public int WeightPercent { get; init; }
}

public sealed record SubmitDailyChallengeRequest
{
    public int Score { get; init; }
    public int CorrectCount { get; init; }
    public int TotalQuestions { get; init; }
    public int Accuracy { get; init; }
    public int DurationSeconds { get; init; }
}

public sealed record DailyChallengeRankRow
{
    public int Rank { get; init; }
    public Guid UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public int Score { get; init; }
    public int CorrectCount { get; init; }
    public int Accuracy { get; init; }
    public int DurationSeconds { get; init; }
    public bool IsMe { get; init; }
}

public sealed record DailyChallengeLeaderboardResponse
{
    public DateTime Date { get; init; }
    public int Grade { get; init; }
    public IReadOnlyList<DailyChallengeRankRow> Entries { get; init; } = Array.Empty<DailyChallengeRankRow>();
    public int? MyRank { get; init; }
    public int? MyScore { get; init; }
    public int ParticipantCount { get; init; }
    public DateTime ResetsAtUtc { get; init; }
}
