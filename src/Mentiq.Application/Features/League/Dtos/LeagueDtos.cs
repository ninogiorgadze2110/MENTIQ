namespace Mentiq.Application.Features.League.Dtos;

/// <summary>One row of a league's standings.</summary>
public sealed record LeagueRankRow
{
    public int Rank { get; init; }
    public Guid UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public int Points { get; init; }
    public bool IsMe { get; init; }
    /// <summary>"up" (promotion zone), "down" (relegation zone) or "stay".</summary>
    public string Zone { get; init; } = "stay";
}

/// <summary>The signed-in user's current weekly league.</summary>
public sealed record MyLeagueResponse
{
    public int Grade { get; init; }
    public int TierIndex { get; init; }
    public string TierId { get; init; } = string.Empty;
    public string TierName { get; init; } = string.Empty;

    public DateTime WeekStartUtc { get; init; }
    public DateTime WeekEndUtc { get; init; }

    public int? MyRank { get; init; }
    public int MyPoints { get; init; }
    public int ParticipantCount { get; init; }

    /// <summary>How many top ranks are promoted / bottom ranks relegated this week.</summary>
    public int PromoteCount { get; init; }
    public int RelegateCount { get; init; }

    public IReadOnlyList<LeagueRankRow> Entries { get; init; } = Array.Empty<LeagueRankRow>();
}

public sealed record SubmitLeagueSessionRequest
{
    public int Correct { get; init; }
    public double AvgSeconds { get; init; }
}
