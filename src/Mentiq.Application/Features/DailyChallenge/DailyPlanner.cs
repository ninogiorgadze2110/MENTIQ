namespace Mentiq.Application.Features.DailyChallenge;

/// <summary>
/// Builds the day's challenge plan from a user's belt progression — pure and
/// deterministic given its inputs (the challenge date drives the weekly
/// "challenge day" and the review rotation), so it is fully unit-testable.
///
/// Rule: most of the drill (<see cref="FocusWeightPercent"/>%) targets the user's
/// weakest unlocked skill; the rest (<see cref="ReviewWeightPercent"/>%) reviews
/// levels already passed. Once a week it becomes a "challenge day" one belt above
/// the focus skill's current belt. The plan also carries a short Georgian reason
/// ("დღეს ვარჯიშობ გაყოფაზე — აქ ყველაზე ნელი ხარ").
/// </summary>
public static class DailyPlanner
{
    public const int FocusWeightPercent = 60;
    public const int ReviewWeightPercent = 40;
    private const int MaxReviewSegments = 3;

    /// <summary>Why a skill is the focus — also selects the reason wording.</summary>
    public enum Weakness
    {
        None,     // already strong (maintenance)
        NoData,   // little or no practice yet
        Accuracy, // most mistakes here
        Speed     // slowest here
    }

    /// <summary>A skill's current state, enough to rank weakness and pick levels.</summary>
    public sealed record SkillState(
        string Skill,
        string Name,
        int BeltIndex,
        bool Unlocked,
        int AccuracyPercent,
        int MedianTimeMs,
        int AnswersCount);

    /// <summary>One weighted slice of the drill: a skill at a difficulty (1–6).</summary>
    public sealed record PlanSegment(string Skill, int Difficulty, int WeightPercent);

    public sealed record DailyPlan(
        string FocusSkill,
        string FocusSkillName,
        int FocusDifficulty,
        Weakness FocusWeakness,
        string Reason,
        bool IsChallengeDay,
        IReadOnlyList<PlanSegment> Segments);

    /// <summary>Weekly challenge day — deterministic from the challenge date.</summary>
    public static bool ChallengeDay(DateTime challengeDate) => challengeDate.DayOfWeek == DayOfWeek.Sunday;

    public static DailyPlan Build(
        IReadOnlyList<SkillState> skills,
        IReadOnlyList<int> beltDifficulties,
        IReadOnlyList<int> beltTargetSeconds,
        int maxBeltIndex,
        int requiredAccuracy,
        DateTime challengeDate)
    {
        var pool = skills.Where(s => s.Unlocked).ToList();
        if (pool.Count == 0)
        {
            pool = skills.ToList();
        }
        if (pool.Count == 0)
        {
            // Nothing to plan — return an empty, safe plan.
            return new DailyPlan(string.Empty, string.Empty, beltDifficulties.Count > 0 ? beltDifficulties[0] : 1,
                Weakness.None, "დღეს ვარჯიშობ შერეულ მაგალითებზე.", ChallengeDay(challengeDate), Array.Empty<PlanSegment>());
        }

        int TargetMs(int beltIndex) => Clamp(beltTargetSeconds, beltIndex) * 1000;
        int Difficulty(int beltIndex) => Clamp(beltDifficulties, beltIndex);

        (double Score, Weakness Factor) Weak(SkillState s)
        {
            if (s.AnswersCount == 0)
            {
                return (requiredAccuracy, Weakness.NoData);
            }
            var accGap = Math.Max(0, requiredAccuracy - s.AccuracyPercent);
            var targetMs = TargetMs(s.BeltIndex);
            var speedPct = targetMs > 0 && s.MedianTimeMs > targetMs
                ? (s.MedianTimeMs / (double)targetMs - 1.0) * 100.0
                : 0.0;
            if (accGap == 0 && speedPct == 0)
            {
                return (0, Weakness.None);
            }
            return (accGap + speedPct, accGap >= speedPct ? Weakness.Accuracy : Weakness.Speed);
        }

        // Rank by weakness desc, then lower belt (more fundamental), then input order.
        var ranked = pool
            .Select((s, i) => (State: s, Index: i, Weak: Weak(s)))
            .OrderByDescending(x => x.Weak.Score)
            .ThenBy(x => x.State.BeltIndex)
            .ThenBy(x => x.Index)
            .ToList();

        var top = ranked[0];
        SkillState focus;
        Weakness factor;
        if (top.Weak.Score > 0)
        {
            focus = top.State;
            factor = top.Weak.Factor;
        }
        else
        {
            // Everyone is strong: keep progressing the lowest not-yet-maxed skill.
            var grow = ranked.Where(x => x.State.BeltIndex < maxBeltIndex)
                .OrderBy(x => x.State.BeltIndex).ThenBy(x => x.Index).FirstOrDefault();
            focus = (grow.State ?? top.State);
            factor = Weakness.None;
        }

        var isChallenge = ChallengeDay(challengeDate);
        var effectiveBelt = isChallenge ? Math.Min(focus.BeltIndex + 1, maxBeltIndex) : focus.BeltIndex;
        var focusDifficulty = Difficulty(effectiveBelt);

        // Review pool: every (skill, difficulty) pair for belts already passed.
        var passed = pool
            .SelectMany(s => Enumerable.Range(0, Math.Max(0, s.BeltIndex))
                .Select(b => new PlanSegment(s.Skill, Difficulty(b), 0)))
            .GroupBy(p => (p.Skill, p.Difficulty))
            .Select(g => g.First())
            .ToList();

        var segments = new List<PlanSegment>();
        if (passed.Count == 0)
        {
            // No passed levels yet — the whole drill is the focus skill.
            segments.Add(new PlanSegment(focus.Skill, focusDifficulty, 100));
        }
        else
        {
            segments.Add(new PlanSegment(focus.Skill, focusDifficulty, FocusWeightPercent));
            var pick = Rotate(passed, challengeDate.DayOfYear, Math.Min(MaxReviewSegments, passed.Count));
            var per = ReviewWeightPercent / pick.Count;
            var rem = ReviewWeightPercent - per * pick.Count;
            for (var i = 0; i < pick.Count; i++)
            {
                segments.Add(pick[i] with { WeightPercent = per + (i < rem ? 1 : 0) });
            }
        }

        var reason = BuildReason(focus.Name, factor, isChallenge);
        return new DailyPlan(focus.Skill, focus.Name, focusDifficulty, factor, reason, isChallenge, segments);
    }

    private static string BuildReason(string name, Weakness factor, bool isChallenge)
    {
        if (isChallenge)
        {
            return $"გამოწვევის დღე! დღეს {name}ზე ერთი დონით მაღლა ვვარჯიშობ — სცადე უფრო რთული.";
        }
        return factor switch
        {
            Weakness.Accuracy => $"დღეს ვარჯიშობ {name}ზე — აქ ყველაზე მეტი შეცდომა გაქვს.",
            Weakness.Speed => $"დღეს ვარჯიშობ {name}ზე — აქ ყველაზე ნელი ხარ.",
            Weakness.NoData => $"დღეს ვარჯიშობ {name}ზე — აქ ჯერ ცოტა გივარჯიშია.",
            _ => $"დღეს ვიმეორებ {name}ზე — ფორმის შესანარჩუნებლად."
        };
    }

    /// <summary>Deterministically take `count` items starting at a rotating offset.</summary>
    private static List<PlanSegment> Rotate(List<PlanSegment> items, int offset, int count)
    {
        var n = items.Count;
        var start = ((offset % n) + n) % n;
        return Enumerable.Range(0, count).Select(i => items[(start + i) % n]).ToList();
    }

    private static int Clamp(IReadOnlyList<int> list, int index)
    {
        if (list.Count == 0) return 0;
        return list[Math.Clamp(index, 0, list.Count - 1)];
    }
}
