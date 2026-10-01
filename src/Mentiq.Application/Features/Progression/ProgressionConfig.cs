namespace Mentiq.Application.Features.Progression;

/// <summary>
/// THE single source of truth for the belt progression: skills, the five belts,
/// their difficulty / target time / linked tricks, prerequisites and the mastery
/// thresholds. Nothing about progression is hard-coded elsewhere — logic reads
/// everything from here, and the API serves this same config to the client.
/// </summary>
public static class ProgressionConfig
{
    // ---- Mastery thresholds (config, not scattered constants) ----

    /// <summary>How many of the most recent answers a belt is judged on.</summary>
    public const int MasteryWindow = 20;

    /// <summary>Minimum accuracy (%) over the window to pass a belt.</summary>
    public const int MinAccuracyPercent = 90;

    /// <summary>At most one belt may be earned per result submission (session).</summary>
    public const int MaxPromotionsPerSession = 1;

    public const int MaxBeltIndex = 4; // white(0) … black(4)

    // ---- The belt ladder ----

    public static readonly IReadOnlyList<BeltDef> Belts = new[]
    {
        new BeltDef("white",  "თეთრი",   0, Difficulty: 1, TargetSeconds: 9),
        new BeltDef("yellow", "ყვითელი", 1, Difficulty: 2, TargetSeconds: 8),
        new BeltDef("green",  "მწვანე",  2, Difficulty: 3, TargetSeconds: 6),
        new BeltDef("blue",   "ლურჯი",   3, Difficulty: 4, TargetSeconds: 5),
        new BeltDef("black",  "შავი",    4, Difficulty: 6, TargetSeconds: 4)
    };

    // ---- Skills, their prerequisites and belt-linked tricks (learn lesson ids) ----

    public static readonly IReadOnlyList<SkillDef> Skills = new[]
    {
        new SkillDef("add", "შეკრება", Requires: null, LessonsByBelt: new[]
        {
            new[] { "round-up" },      // white
            new[] { "left-to-right" }, // yellow
            new[] { "add9" },          // green
            Array.Empty<string>(),     // blue
            Array.Empty<string>()      // black
        }),
        new SkillDef("sub", "გამოკლება", Requires: null, LessonsByBelt: new[]
        {
            Array.Empty<string>(),
            new[] { "sub-round" },
            new[] { "halving" },
            Array.Empty<string>(),
            Array.Empty<string>()
        }),
        new SkillDef("cmp", "შედარება", Requires: null, LessonsByBelt: EmptyLadder()),
        new SkillDef("miss", "გამოტოვებული", Requires: new Prerequisite("add", 1), LessonsByBelt: EmptyLadder()),
        new SkillDef("mul", "გამრავლება", Requires: new Prerequisite("add", 2), LessonsByBelt: new[]
        {
            new[] { "mul5" },         // white
            new[] { "mul11" },        // yellow
            new[] { "mul9-fingers" }, // green
            new[] { "sq5" },          // blue
            Array.Empty<string>()     // black
        }),
        // Division opens after multiplication's yellow belt (spec example).
        new SkillDef("div", "გაყოფა", Requires: new Prerequisite("mul", 1), LessonsByBelt: new[]
        {
            Array.Empty<string>(),
            new[] { "halving" },
            Array.Empty<string>(),
            Array.Empty<string>(),
            Array.Empty<string>()
        }),
        new SkillDef("chain", "ჯაჭვი", Requires: new Prerequisite("mul", 2), LessonsByBelt: new[]
        {
            Array.Empty<string>(),
            new[] { "left-to-right" },
            new[] { "pct10" },
            new[] { "pct15" },
            Array.Empty<string>()
        })
    };

    public static BeltDef Belt(int index) => Belts[Math.Clamp(index, 0, MaxBeltIndex)];

    public static SkillDef? Skill(string key) =>
        Skills.FirstOrDefault(s => string.Equals(s.Key, key, StringComparison.OrdinalIgnoreCase));

    public static bool IsSkill(string key) => Skill(key) is not null;

    private static IReadOnlyList<IReadOnlyList<string>> EmptyLadder() =>
        new IReadOnlyList<string>[] { Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>() };
}

/// <summary>One belt step: id, Georgian name, generation difficulty (1–6) and the
/// target seconds-per-question used by the mastery rule.</summary>
public sealed record BeltDef(string Id, string Name, int Index, int Difficulty, int TargetSeconds);

/// <summary>A gate: this belt of another skill must be reached first.</summary>
public sealed record Prerequisite(string Skill, int BeltIndex);

/// <summary>A trainable skill, its unlock gate and the tricks tied to each belt.</summary>
public sealed record SkillDef(
    string Key,
    string Name,
    Prerequisite? Requires,
    IReadOnlyList<IReadOnlyList<string>> LessonsByBelt);
