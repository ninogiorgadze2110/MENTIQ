using Mentiq.Application.Features.DailyChallenge;
using Xunit;

namespace Mentiq.Tests;

public class DailyPlannerTests
{
    // Mirror ProgressionConfig's belts: white..black.
    private static readonly int[] Diff = { 1, 2, 3, 4, 6 };
    private static readonly int[] Target = { 9, 8, 6, 5, 4 };
    private const int Max = 4;
    private const int Req = 90;

    // 2026-10-05 is a Monday (non-challenge); 2026-10-04 is a Sunday (challenge day).
    private static readonly DateTime Monday = new(2026, 10, 5);
    private static readonly DateTime Sunday = new(2026, 10, 4);

    private static DailyPlanner.SkillState S(
        string key, string name, int belt, int acc, int medianMs, int answers = 20, bool unlocked = true)
        => new(key, name, belt, unlocked, acc, medianMs, answers);

    private static DailyPlanner.DailyPlan Build(DateTime date, params DailyPlanner.SkillState[] skills)
        => DailyPlanner.Build(skills, Diff, Target, Max, Req, date);

    [Fact]
    public void ChallengeDay_is_sunday_only()
    {
        Assert.True(DailyPlanner.ChallengeDay(Sunday));
        Assert.False(DailyPlanner.ChallengeDay(Monday));
    }

    [Fact]
    public void Picks_the_slowest_skill_and_says_so()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 1, acc: 95, medianMs: 4000),
            S("mul", "გამრავლება", belt: 1, acc: 95, medianMs: 13000)); // slow (target 8s)

        Assert.Equal("mul", plan.FocusSkill);
        Assert.Equal(DailyPlanner.Weakness.Speed, plan.FocusWeakness);
        Assert.Contains("ნელი", plan.Reason);
        Assert.Contains("გამრავლება", plan.Reason);
    }

    [Fact]
    public void Picks_the_least_accurate_skill_and_says_so()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 1, acc: 70, medianMs: 4000),   // most mistakes
            S("mul", "გამრავლება", belt: 1, acc: 95, medianMs: 4000));

        Assert.Equal("add", plan.FocusSkill);
        Assert.Equal(DailyPlanner.Weakness.Accuracy, plan.FocusWeakness);
        Assert.Contains("შეცდომა", plan.Reason);
    }

    [Fact]
    public void Unpractised_skill_is_prioritised()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 0, acc: 0, medianMs: 0, answers: 0),       // no data
            S("sub", "გამოკლება", belt: 0, acc: 95, medianMs: 3000, answers: 20));

        Assert.Equal("add", plan.FocusSkill);
        Assert.Equal(DailyPlanner.Weakness.NoData, plan.FocusWeakness);
        Assert.Contains("გივარჯიშია", plan.Reason);
    }

    [Fact]
    public void Weights_are_sixty_forty_when_there_are_passed_levels()
    {
        var plan = Build(Monday,
            S("mul", "გამრავლება", belt: 2, acc: 60, medianMs: 9000), // weak → focus
            S("add", "შეკრება", belt: 2, acc: 99, medianMs: 3000));

        Assert.Equal("mul", plan.FocusSkill);
        var focus = plan.Segments[0];
        Assert.Equal("mul", focus.Skill);
        Assert.Equal(DailyPlanner.FocusWeightPercent, focus.WeightPercent);
        Assert.Equal(100, plan.Segments.Sum(s => s.WeightPercent));
        Assert.Equal(DailyPlanner.ReviewWeightPercent, plan.Segments.Skip(1).Sum(s => s.WeightPercent));
        Assert.True(plan.Segments.Count - 1 <= 3); // at most 3 review slices
    }

    [Fact]
    public void No_passed_levels_means_a_single_focus_segment()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 0, acc: 50, medianMs: 12000),
            S("sub", "გამოკლება", belt: 0, acc: 95, medianMs: 3000));

        Assert.Single(plan.Segments);
        Assert.Equal("add", plan.Segments[0].Skill);
        Assert.Equal(100, plan.Segments[0].WeightPercent);
    }

    [Fact]
    public void Review_segments_come_only_from_passed_levels()
    {
        var plan = Build(Monday,
            S("mul", "გამრავლება", belt: 3, acc: 55, medianMs: 9000)); // focus at belt 3 (difficulty 4)

        Assert.Equal(Diff[3], plan.Segments[0].Difficulty); // focus = current belt difficulty (4)
        var review = plan.Segments.Skip(1).ToList();
        Assert.NotEmpty(review);
        // Passed belts are 0,1,2 → difficulties 1,2,3; never the current/higher one.
        Assert.All(review, s => Assert.Contains(s.Difficulty, new[] { Diff[0], Diff[1], Diff[2] }));
    }

    [Fact]
    public void Challenge_day_raises_the_focus_one_level()
    {
        var weak = S("add", "შეკრება", belt: 1, acc: 50, medianMs: 12000);
        var normal = Build(Monday, weak);
        var challenge = Build(Sunday, weak);

        Assert.False(normal.IsChallengeDay);
        Assert.True(challenge.IsChallengeDay);
        Assert.Equal(Diff[1], normal.FocusDifficulty);       // belt 1 → difficulty 2
        Assert.Equal(Diff[2], challenge.FocusDifficulty);    // +1 belt → difficulty 3
        Assert.Contains("გამოწვევის დღე", challenge.Reason);
    }

    [Fact]
    public void Challenge_day_focus_is_capped_at_the_top_belt()
    {
        var plan = Build(Sunday, S("add", "შეკრება", belt: Max, acc: 50, medianMs: 12000));
        Assert.Equal(Diff[Max], plan.FocusDifficulty); // cannot exceed the black belt
    }

    [Fact]
    public void Locked_skills_are_never_chosen()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 1, acc: 60, medianMs: 9000, unlocked: true),
            S("chain", "ჯაჭვი", belt: 0, acc: 0, medianMs: 99000, answers: 0, unlocked: false)); // worst, but locked

        Assert.Equal("add", plan.FocusSkill);
        Assert.DoesNotContain(plan.Segments, s => s.Skill == "chain");
    }

    [Fact]
    public void All_strong_falls_back_to_maintenance_on_lowest_growable_skill()
    {
        var plan = Build(Monday,
            S("add", "შეკრება", belt: 1, acc: 100, medianMs: 2000),
            S("sub", "გამოკლება", belt: 2, acc: 100, medianMs: 2000));

        Assert.Equal(DailyPlanner.Weakness.None, plan.FocusWeakness);
        Assert.Equal("add", plan.FocusSkill); // lowest belt, still room to grow
        Assert.Contains("ვიმეორებ", plan.Reason);
    }

    [Fact]
    public void Is_deterministic_for_the_same_inputs()
    {
        var skills = new[]
        {
            S("mul", "გამრავლება", belt: 2, acc: 60, medianMs: 9000),
            S("add", "შეკრება", belt: 2, acc: 99, medianMs: 3000)
        };
        var a = DailyPlanner.Build(skills, Diff, Target, Max, Req, Monday);
        var b = DailyPlanner.Build(skills, Diff, Target, Max, Req, Monday);

        Assert.Equal(a.FocusSkill, b.FocusSkill);
        Assert.Equal(a.Reason, b.Reason);
        Assert.True(a.Segments.SequenceEqual(b.Segments));
    }
}
