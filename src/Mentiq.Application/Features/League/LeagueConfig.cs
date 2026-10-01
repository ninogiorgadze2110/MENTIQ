namespace Mentiq.Application.Features.League;

/// <summary>
/// Single source of truth for the weekly league ladder: the tiers, the
/// promotion/relegation shares, and the Monday-06:00-Tbilisi week boundary.
/// </summary>
public static class LeagueConfig
{
    // Tbilisi is a fixed UTC+4 offset (no DST); the league week rolls at 06:00
    // Tbilisi each Monday — the same cutoff the daily challenge uses.
    private static readonly TimeSpan TbilisiOffset = TimeSpan.FromHours(4);
    private const int CutoffHour = 6;

    public const int MinTier = 0;
    public const int MaxTier = 3; // bronze(0) … diamond(3)

    /// <summary>Share (%) of a league promoted to the next tier at week end.</summary>
    public const int PromotePercent = 20;

    /// <summary>Share (%) of a league relegated to the previous tier at week end.</summary>
    public const int RelegatePercent = 20;

    public static readonly IReadOnlyList<TierDef> Tiers = new[]
    {
        new TierDef("bronze",   "ბრინჯაო",  0),
        new TierDef("silver",   "ვერცხლი",  1),
        new TierDef("gold",     "ოქრო",     2),
        new TierDef("diamond",  "ბრილიანტი", 3)
    };

    public static TierDef Tier(int index) => Tiers[Math.Clamp(index, MinTier, MaxTier)];

    /// <summary>UTC instant the league week containing <paramref name="nowUtc"/> starts (Monday 06:00 Tbilisi).</summary>
    public static DateTime WeekStartUtc(DateTime nowUtc)
    {
        // Shift so a "day" rolls at 06:00 Tbilisi, then walk back to Monday.
        var shifted = nowUtc.Add(TbilisiOffset).AddHours(-CutoffHour);
        var day = shifted.Date;
        var mondayOffset = ((int)day.DayOfWeek + 6) % 7; // Monday = 0 … Sunday = 6
        var monday = day.AddDays(-mondayOffset);
        // Back to the real UTC instant of that Monday 06:00 Tbilisi.
        var startUtc = monday.AddHours(CutoffHour).Add(-TbilisiOffset);
        return DateTime.SpecifyKind(startUtc, DateTimeKind.Utc);
    }

    /// <summary>UTC instant the given week ends (the next Monday 06:00 Tbilisi).</summary>
    public static DateTime WeekEndUtc(DateTime weekStartUtc) => weekStartUtc.AddDays(7);
}

/// <summary>One league tier: stable id, Georgian name and index.</summary>
public sealed record TierDef(string Id, string Name, int Index);
