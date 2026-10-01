using Mentiq.Application.Features.Progression;
using Xunit;

namespace Mentiq.Tests;

public class MasteryEvaluatorTests
{
    private const int Window = ProgressionConfig.MasteryWindow; // 20

    // Target seconds for the white belt (belt 0), used to build fast/slow answers.
    private static int WhiteTargetMs => ProgressionConfig.Belt(0).TargetSeconds * 1000;

    private static List<AnswerRecord> Answers(int count, bool correct, int timeMs)
        => Enumerable.Range(0, count).Select(_ => new AnswerRecord(correct, timeMs)).ToList();

    // ---- threshold: needs a full window ----

    [Fact]
    public void FewerThanWindow_answers_never_promotes()
    {
        var answers = Answers(Window - 1, correct: true, timeMs: 1000); // perfect & fast
        Assert.False(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    [Fact]
    public void ExactlyWindow_perfect_and_fast_promotes()
    {
        var answers = Answers(Window, correct: true, timeMs: WhiteTargetMs - 500);
        Assert.True(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    // ---- threshold: accuracy ≥ 90% ----

    [Fact]
    public void AccuracyBelowThreshold_does_not_promote()
    {
        // 17/20 = 85% (< 90%), all fast.
        var answers = Answers(17, true, 1000).Concat(Answers(3, false, 1000)).ToList();
        Assert.False(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    [Fact]
    public void AccuracyExactlyNinety_with_fast_times_promotes()
    {
        // 18/20 = 90%, fast.
        var answers = Answers(18, true, 1000).Concat(Answers(2, false, 1000)).ToList();
        Assert.True(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    // ---- threshold: median time ≤ target ----

    [Fact]
    public void MedianTimeAboveTarget_does_not_promote()
    {
        var answers = Answers(Window, true, WhiteTargetMs + 2000); // accurate but slow
        Assert.False(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    [Fact]
    public void MedianAtTarget_promotes_even_with_a_few_slow_outliers()
    {
        // 15 fast + 5 slow → median still fast (≤ target), accuracy 100%.
        var answers = Answers(15, true, 1000).Concat(Answers(5, true, WhiteTargetMs + 5000)).ToList();
        Assert.True(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    // ---- only the most recent window counts ----

    [Fact]
    public void OnlyLastWindow_is_considered()
    {
        // Old 20 are bad+slow, newest 20 are perfect+fast → should promote.
        var old = Answers(Window, false, WhiteTargetMs + 9000);
        var fresh = Answers(Window, true, 1000);
        var answers = old.Concat(fresh).ToList();
        Assert.True(MasteryEvaluator.ShouldPromote(answers, currentBelt: 0));
    }

    // ---- top belt cannot be promoted further ----

    [Fact]
    public void BlackBelt_never_promotes()
    {
        var answers = Answers(Window, true, 500);
        Assert.False(MasteryEvaluator.ShouldPromote(answers, ProgressionConfig.MaxBeltIndex));
    }

    // ---- Advance: at most one belt per session (no double promotion) ----

    [Fact]
    public void Advance_promotes_at_most_one_belt_per_session()
    {
        // Enough perfect, fast answers for several belts at once.
        var answers = Answers(Window * 3, true, 500);
        var (belt, recent, promoted) = MasteryEvaluator.Advance(answers, currentBelt: 0);

        Assert.True(promoted);
        Assert.Equal(1, belt);                 // only +1, never +2 in one call
        Assert.Empty(recent);                  // window reset after promotion
    }

    [Fact]
    public void Advance_without_qualifying_history_keeps_belt_and_trims_window()
    {
        var answers = Answers(Window + 5, true, WhiteTargetMs + 3000); // accurate but slow
        var (belt, recent, promoted) = MasteryEvaluator.Advance(answers, currentBelt: 1);

        Assert.False(promoted);
        Assert.Equal(1, belt);
        Assert.Equal(Window, recent.Count);    // trimmed to the window size
    }

    [Fact]
    public void Advance_twice_in_one_session_cannot_skip_two_belts()
    {
        // Simulate a single submission applied once: feed a huge perfect batch.
        var batch = Answers(Window * 4, true, 500);
        var (beltAfterFirst, recentAfterFirst, _) = MasteryEvaluator.Advance(batch, currentBelt: 0);

        // The reset window means an immediate re-evaluation cannot promote again.
        var (beltAfterSecond, _, promotedAgain) = MasteryEvaluator.Advance(recentAfterFirst, beltAfterFirst);

        Assert.Equal(1, beltAfterFirst);
        Assert.Equal(1, beltAfterSecond);
        Assert.False(promotedAgain);
    }

    // ---- snapshot reflects the window ----

    [Fact]
    public void Snapshot_reports_accuracy_median_and_readiness()
    {
        var answers = Answers(Window, true, 1000);
        var snap = MasteryEvaluator.Snapshot(answers, currentBelt: 0);

        Assert.Equal(100, snap.AccuracyPercent);
        Assert.Equal(1000, snap.MedianTimeMs);
        Assert.Equal(Window, snap.AnswersCount);
        Assert.Equal(ProgressionConfig.Belt(0).TargetSeconds, snap.TargetSeconds);
        Assert.True(snap.Ready);
    }
}
