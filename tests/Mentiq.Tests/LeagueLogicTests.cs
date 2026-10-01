using Mentiq.Application.Features.League;
using Xunit;

namespace Mentiq.Tests;

public class LeagueScoringTests
{
    [Fact]
    public void No_correct_answers_scores_zero()
        => Assert.Equal(0, LeagueScoring.SessionPoints(0, 3));

    [Fact]
    public void At_reference_speed_each_correct_is_base_points()
        => Assert.Equal(10 * LeagueScoring.BasePerCorrect, LeagueScoring.SessionPoints(10, 5)); // mult 1.0

    [Fact]
    public void Fast_answers_earn_the_capped_double_multiplier()
        => Assert.Equal(10 * LeagueScoring.BasePerCorrect * 2, LeagueScoring.SessionPoints(10, 1)); // mult capped 2.0

    [Fact]
    public void Slow_answers_earn_the_floored_half_multiplier()
        => Assert.Equal((int)System.Math.Round(10 * LeagueScoring.BasePerCorrect * 0.5), LeagueScoring.SessionPoints(10, 10));

    [Fact]
    public void Speed_multiplier_is_clamped()
    {
        Assert.Equal(2.0, LeagueScoring.SpeedMultiplier(0.5)); // very fast → capped
        Assert.Equal(0.5, LeagueScoring.SpeedMultiplier(100)); // very slow → floored
    }
}

public class LeagueClosingTests
{
    private static LeagueClosing.Member M(int points) => new(Guid.NewGuid(), points);

    [Fact]
    public void Empty_league_has_no_moves()
        => Assert.Empty(LeagueClosing.Resolve(Array.Empty<LeagueClosing.Member>(), tier: 1));

    [Fact]
    public void Bronze_promotes_top_but_never_relegates()
    {
        var members = Enumerable.Range(0, 10).Select(i => M(100 - i)).ToList();
        var moves = LeagueClosing.Resolve(members, tier: LeagueConfig.MinTier);

        Assert.Equal(2, moves.Count);                       // top 20% of 10
        Assert.All(moves, m => Assert.Equal(1, m.NewTier));  // all promoted to silver
    }

    [Fact]
    public void Diamond_relegates_bottom_but_never_promotes()
    {
        var members = Enumerable.Range(0, 10).Select(i => M(100 - i)).ToList();
        var moves = LeagueClosing.Resolve(members, tier: LeagueConfig.MaxTier);

        Assert.Equal(2, moves.Count);                       // bottom 20%
        Assert.All(moves, m => Assert.Equal(LeagueConfig.MaxTier - 1, m.NewTier));
    }

    [Fact]
    public void Middle_tier_moves_both_ends()
    {
        var members = Enumerable.Range(0, 10).Select(i => M(100 - i)).ToList();
        var moves = LeagueClosing.Resolve(members, tier: 2);

        Assert.Equal(2, moves.Count(m => m.NewTier == 3)); // top up to diamond
        Assert.Equal(2, moves.Count(m => m.NewTier == 1)); // bottom down to silver
    }

    [Fact]
    public void Highest_points_are_promoted()
    {
        var top = new LeagueClosing.Member(Guid.NewGuid(), 500);
        var rest = Enumerable.Range(0, 9).Select(i => M(10 - i)).ToList();
        var members = rest.Append(top).ToList(); // top added last to prove it's ranked by points

        var moves = LeagueClosing.Resolve(members, tier: 1);
        Assert.Contains(moves, m => m.UserId == top.UserId && m.NewTier == 2);
    }

    [Fact]
    public void Ties_are_broken_stably_by_order()
    {
        var a = new LeagueClosing.Member(Guid.NewGuid(), 50);
        var b = new LeagueClosing.Member(Guid.NewGuid(), 50);
        // Only one promoted (top 20% of 5 = 1); the earlier-listed member wins the tie.
        var members = new List<LeagueClosing.Member> { a, b, M(5), M(4), M(3) };
        var moves = LeagueClosing.Resolve(members, tier: 1);
        Assert.Contains(moves, m => m.UserId == a.UserId && m.NewTier == 2);
        Assert.DoesNotContain(moves, m => m.UserId == b.UserId);
    }

    [Fact]
    public void Small_league_under_the_share_moves_nobody()
    {
        var moves = LeagueClosing.Resolve(new[] { M(3), M(2), M(1) }, tier: 1); // 3*20/100 = 0
        Assert.Empty(moves);
    }

    [Fact]
    public void Overlapping_shares_do_not_double_count()
    {
        // Extreme config: everyone would both promote and relegate — relegation yields.
        var members = new[] { M(2), M(1) };
        var moves = LeagueClosing.Resolve(members, tier: 2, promotePercent: 100, relegatePercent: 100);
        Assert.Equal(2, moves.Count);
        Assert.All(moves, m => Assert.Equal(3, m.NewTier)); // all promoted, none relegated
    }
}

public class LeagueWeekBoundaryTests
{
    private static DateTime Utc(int y, int mo, int d, int h, int mi) => new(y, mo, d, h, mi, 0, DateTimeKind.Utc);

    [Fact]
    public void Week_starts_monday_06_tbilisi_which_is_02_utc()
    {
        var start = LeagueConfig.WeekStartUtc(Utc(2026, 10, 7, 12, 0)); // a Wednesday
        Assert.Equal(Utc(2026, 10, 5, 2, 0), start);                    // Monday 02:00 UTC = 06:00 Tbilisi
        Assert.Equal(Utc(2026, 10, 12, 2, 0), LeagueConfig.WeekEndUtc(start));
    }

    [Fact]
    public void Before_monday_cutoff_still_belongs_to_the_previous_week()
    {
        var start = LeagueConfig.WeekStartUtc(Utc(2026, 10, 5, 1, 0)); // Mon 05:00 Tbilisi, before cutoff
        Assert.Equal(Utc(2026, 9, 28, 2, 0), start);
    }

    [Fact]
    public void At_monday_cutoff_a_new_week_begins()
    {
        var start = LeagueConfig.WeekStartUtc(Utc(2026, 10, 5, 2, 0)); // exactly 06:00 Tbilisi Monday
        Assert.Equal(Utc(2026, 10, 5, 2, 0), start);
    }
}
