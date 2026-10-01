using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A weekly, per-grade, per-tier competitive league. Everyone of that grade and
/// tier who practises during the week competes in the same league; at week end
/// the top share is promoted a tier and the bottom share relegated.
/// </summary>
public class League : BaseEntity
{
    /// <summary>Grade / class this league is for (1–12).</summary>
    public int Grade { get; set; }

    /// <summary>Tier index: 0 = bronze, 1 = silver, 2 = gold, 3 = diamond.</summary>
    public int Tier { get; set; }

    /// <summary>UTC instant the league week starts (Monday 06:00 Tbilisi).</summary>
    public DateTime WeekStartUtc { get; set; }

    /// <summary>UTC instant the league week ends (next Monday 06:00 Tbilisi).</summary>
    public DateTime WeekEndUtc { get; set; }

    /// <summary>Set once the week has been resolved (promotions/relegations applied).</summary>
    public bool Closed { get; set; }
}

/// <summary>One member's running points in a weekly league.</summary>
public class LeagueEntry : BaseEntity
{
    public Guid LeagueId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    public int Points { get; set; }
}

/// <summary>
/// A user's current league tier, carried from week to week by promotions and
/// relegations. Defaults to bronze (0) for a new competitor.
/// </summary>
public class UserLeagueStanding : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Current tier index: 0 = bronze … 3 = diamond.</summary>
    public int Tier { get; set; }
}
