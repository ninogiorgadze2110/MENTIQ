namespace Mentiq.Application.Features.League;

/// <summary>
/// Resolves a finished league week: ranks members by points and decides who
/// moves tier. Top <see cref="LeagueConfig.PromotePercent"/>% go up, bottom
/// <see cref="LeagueConfig.RelegatePercent"/>% go down (no promotion out of the
/// top tier, no relegation out of the bottom). Pure and testable.
/// </summary>
public static class LeagueClosing
{
    public sealed record Member(Guid UserId, int Points);

    public sealed record Move(Guid UserId, int NewTier);

    public static IReadOnlyList<Move> Resolve(
        IReadOnlyList<Member> members,
        int tier,
        int promotePercent = LeagueConfig.PromotePercent,
        int relegatePercent = LeagueConfig.RelegatePercent,
        int maxTier = LeagueConfig.MaxTier,
        int minTier = LeagueConfig.MinTier)
    {
        var ranked = members
            .Select((m, i) => (m, i))
            .OrderByDescending(x => x.m.Points)
            .ThenBy(x => x.i) // stable: earlier members win ties
            .Select(x => x.m)
            .ToList();

        var n = ranked.Count;
        if (n == 0) return Array.Empty<Move>();

        var promote = tier >= maxTier ? 0 : n * promotePercent / 100;
        var relegate = tier <= minTier ? 0 : n * relegatePercent / 100;
        // Never let the two zones overlap in a small league.
        if (promote + relegate > n)
        {
            relegate = Math.Max(0, n - promote);
        }

        var moves = new List<Move>();
        for (var i = 0; i < n; i++)
        {
            int newTier;
            if (i < promote)
            {
                newTier = tier + 1;
            }
            else if (i >= n - relegate)
            {
                newTier = tier - 1;
            }
            else
            {
                continue; // stays in the same tier
            }
            moves.Add(new Move(ranked[i].UserId, newTier));
        }
        return moves;
    }
}
