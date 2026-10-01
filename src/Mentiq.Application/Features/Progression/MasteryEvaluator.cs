namespace Mentiq.Application.Features.Progression;

/// <summary>One recorded answer: whether it was correct and how long it took.</summary>
public sealed record AnswerRecord(bool Correct, int TimeMs);

/// <summary>A read-only view of how close a skill is to the next belt.</summary>
public sealed record MasterySnapshot(
    int AccuracyPercent,
    int MedianTimeMs,
    int AnswersCount,
    int WindowSize,
    int TargetSeconds,
    bool Ready);

/// <summary>
/// Pure, side-effect-free mastery rules. A belt is passed when, over the last
/// <see cref="ProgressionConfig.MasteryWindow"/> answers, accuracy is at least
/// <see cref="ProgressionConfig.MinAccuracyPercent"/>% AND the median time per
/// answer is within the current belt's target. All thresholds come from
/// <see cref="ProgressionConfig"/>. Kept free of EF/DB so it is unit-testable.
/// </summary>
public static class MasteryEvaluator
{
    /// <summary>The most recent `window` answers (or all, if fewer).</summary>
    public static IReadOnlyList<AnswerRecord> Window(IReadOnlyList<AnswerRecord> answers)
    {
        var n = ProgressionConfig.MasteryWindow;
        return answers.Count <= n ? answers : answers.Skip(answers.Count - n).ToList();
    }

    /// <summary>Whether the user at <paramref name="currentBelt"/> has earned the next belt.</summary>
    public static bool ShouldPromote(IReadOnlyList<AnswerRecord> answers, int currentBelt)
    {
        if (currentBelt >= ProgressionConfig.MaxBeltIndex)
        {
            return false; // already at the top belt
        }

        // Not enough evidence yet.
        if (answers.Count < ProgressionConfig.MasteryWindow)
        {
            return false;
        }

        var window = Window(answers);
        var accuracy = AccuracyPercent(window);
        if (accuracy < ProgressionConfig.MinAccuracyPercent)
        {
            return false;
        }

        var targetMs = ProgressionConfig.Belt(currentBelt).TargetSeconds * 1000;
        return MedianTimeMs(window) <= targetMs;
    }

    /// <summary>
    /// Applies one session's worth of history. Promotes AT MOST ONE belt (so two
    /// levels can never be gained in a single session); on promotion the window is
    /// reset, because the next belt must be earned fresh at its harder target.
    /// Returns the resulting belt, the history to keep, and whether a promotion
    /// happened.
    /// </summary>
    public static (int Belt, IReadOnlyList<AnswerRecord> Recent, bool Promoted) Advance(
        IReadOnlyList<AnswerRecord> answers, int currentBelt)
    {
        if (ShouldPromote(answers, currentBelt))
        {
            return (currentBelt + 1, Array.Empty<AnswerRecord>(), true);
        }

        return (currentBelt, Window(answers), false);
    }

    /// <summary>Display snapshot for the current window against a belt's target.</summary>
    public static MasterySnapshot Snapshot(IReadOnlyList<AnswerRecord> answers, int currentBelt)
    {
        var window = Window(answers);
        return new MasterySnapshot(
            AccuracyPercent: window.Count == 0 ? 0 : AccuracyPercent(window),
            MedianTimeMs: window.Count == 0 ? 0 : MedianTimeMs(window),
            AnswersCount: window.Count,
            WindowSize: ProgressionConfig.MasteryWindow,
            TargetSeconds: ProgressionConfig.Belt(currentBelt).TargetSeconds,
            Ready: ShouldPromote(answers, currentBelt));
    }

    private static int AccuracyPercent(IReadOnlyList<AnswerRecord> window)
        => (int)Math.Round(100.0 * window.Count(a => a.Correct) / window.Count);

    private static int MedianTimeMs(IReadOnlyList<AnswerRecord> window)
    {
        var sorted = window.Select(a => a.TimeMs).OrderBy(t => t).ToList();
        var mid = sorted.Count / 2;
        return sorted.Count % 2 == 1
            ? sorted[mid]
            : (int)Math.Round((sorted[mid - 1] + sorted[mid]) / 2.0);
    }
}
