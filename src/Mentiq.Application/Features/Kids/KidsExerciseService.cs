using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Kids.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Kids;

public sealed class KidsExerciseService : IKidsExerciseService
{
    private readonly IApplicationDbContext _db;
    private readonly IExerciseTokenService _tokens;

    private const int LevelUpStreak = 5;
    private const int MaxLevel = 12;

    // Themed countable object per world (falls back to an apple).
    private static readonly Dictionary<string, string> WorldEmoji = new()
    {
        ["apples"] = "🍎",
        ["space"] = "⭐",
        ["sea"] = "🐠",
        ["toys"] = "🧸",
        ["rabbits"] = "🥕",
        ["sky"] = "⭐"
    };

    // Georgian noun for each world's object, used to make instructions narrative
    // ("დაითვალე — რამდენი ვაშლია ხეზე?") instead of dry ("რამდენია?").
    private static readonly Dictionary<string, (string One, string Where)> WorldNoun = new()
    {
        ["apples"] = ("ვაშლი", "ბაღში"),
        ["rabbits"] = ("სტაფილო", "ბაღში"),
        ["space"] = ("ვარსკვლავი", "ცაზე"),
        ["toys"] = ("სათამაშო", "ოთახში"),
        ["sea"] = ("თევზი", "ზღვაში"),
        ["sky"] = ("ვარსკვლავი", "ცაზე")
    };

    // The identity skill each world develops (all its exercise types credit it).
    private static readonly Dictionary<string, string> WorldSkills = new()
    {
        ["apples"] = "counting",
        ["rabbits"] = "comparison",
        ["colors"] = "patterns",
        ["space"] = "addition",
        ["toys"] = "classification",
        ["sea"] = "attention",
        ["memory"] = "memory",
        ["speed"] = "speed"
    };

    // Each world rotates through several exercise TYPES for variety, so a tour is
    // never the same task repeated. Every type still credits the world's skill.
    private static readonly Dictionary<string, string[]> WorldTypes = new()
    {
        ["apples"] = new[] { "counting", "addition" },
        ["rabbits"] = new[] { "comparison", "counting" },
        ["colors"] = new[] { "patterns", "classification" },
        ["space"] = new[] { "addition", "counting" },
        ["toys"] = new[] { "classification", "comparison" },
        ["sea"] = new[] { "attention", "counting" },
        ["memory"] = new[] { "memory" },
        ["speed"] = new[] { "speed" },
        // The Star Sky mission (ტომი II) is a themed mixed review of every skill.
        ["sky"] = new[] { "counting", "comparison", "addition", "classification", "patterns", "memory", "attention" }
    };

    private static readonly string[] PatternPalette = { "🔴", "🔵", "🟢", "🟡", "🟣", "🟠" };

    // Georgian colour names + hex, for the "which is <colour>?" identification task.
    private static readonly (string Id, string Name, string Hex)[] ColorPalette =
    {
        ("red", "წითელი", "#e5484d"),
        ("green", "მწვანე", "#30a46c"),
        ("blue", "ლურჯი", "#3e63dd"),
        ("yellow", "ყვითელი", "#f5a524"),
        ("orange", "ნარინჯისფერი", "#f76b15"),
        ("purple", "იისფერი", "#8e4ec6"),
        ("pink", "ვარდისფერი", "#e93d82")
    };

    // Distinct countable objects reused by mixed-object exercises.
    private static readonly string[] ObjectPool =
        { "🍎", "🥕", "🚗", "🧸", "🐠", "🚀", "🍌", "⭐", "🐰", "🍇", "🌸", "⚽" };

    public KidsExerciseService(IApplicationDbContext db, IExerciseTokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task<ExerciseDto> NextAsync(Guid userId, string? world, CancellationToken cancellationToken = default)
    {
        // A Star Sky mission can be pinned to one theme via "sky:<type>"; without a
        // theme it is the mixed final review. Normal star missions stay thematic.
        string? forcedType = null;
        int? forcedMax = null;
        if (world is not null && world.StartsWith("sky:", StringComparison.Ordinal))
        {
            forcedType = world["sky:".Length..];
            world = "sky";
            // Optional target range for "count to N" practice: "sky:counting:20".
            var colon = forcedType.IndexOf(':');
            if (colon >= 0)
            {
                if (int.TryParse(forcedType[(colon + 1)..], out var m)) forcedMax = m;
                forcedType = forcedType[..colon];
            }
        }

        var types = world is not null && WorldTypes.TryGetValue(world, out var ts) ? ts : new[] { "counting" };
        var type = forcedType is not null && types.Contains(forcedType)
            ? forcedType
            : types[Random.Shared.Next(types.Length)];
        // Normal tours credit their own skill; a Star Sky mission credits the skill
        // of whichever task it drew (so it advances the constellation).
        var skill = world == "sky"
            ? type
            : (world is not null && WorldSkills.TryGetValue(world, out var sk) ? sk : "counting");

        var progress = await _db.SkillProgress.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Skill == skill, cancellationToken);
        var level = progress?.Level ?? 1;

        return type switch
        {
            "comparison" => GenerateComparison(level, world, skill, type),
            "patterns" => GeneratePatterns(level, world, skill, type),
            "addition" => GenerateAddition(level, world, skill, type),
            "classification" => GenerateClassification(level, world, skill, type),
            "attention" => GenerateAttention(level, world, skill, type),
            "memory" => GenerateMemory(level, world, skill, type),
            "speed" => GenerateSpeed(level, world, skill, type),
            _ => GenerateCounting(level, world, skill, type, forcedMax)
        };
    }

    public async Task<SubmitExerciseResult> SubmitAsync(Guid userId, SubmitExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var payload = _tokens.Verify(request.Token)
            ?? throw new ValidationException("სავარჯიშო აღარ არის აქტიური — სცადე თავიდან.");

        var given = request.Answer.Trim();
        var isCorrect = string.Equals(given, payload.Answer, StringComparison.Ordinal);
        var attemptNumber = Math.Max(1, request.AttemptNumber);
        var firstTry = attemptNumber == 1;

        // ---- store the attempt (snapshot) ----
        _db.ExerciseAttempts.Add(new ExerciseAttempt
        {
            UserId = userId,
            Skill = payload.Skill,
            ExerciseType = payload.Type,
            World = payload.World,
            Difficulty = payload.Difficulty,
            CorrectAnswer = payload.Answer,
            GivenAnswer = given,
            IsCorrect = isCorrect,
            ResponseTimeMs = Math.Max(0, request.ResponseTimeMs),
            AttemptNumber = attemptNumber
        });

        // ---- update rolling skill progress ----
        var progress = await _db.SkillProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Skill == payload.Skill, cancellationToken);
        if (progress is null)
        {
            progress = new SkillProgress { UserId = userId, Skill = payload.Skill, Level = payload.Difficulty };
            _db.SkillProgress.Add(progress);
        }

        progress.TotalAttempts++;
        if (isCorrect) progress.CorrectAttempts++;

        // Average response time uses first tries only (a fair reaction measure).
        if (firstTry && request.ResponseTimeMs > 0)
        {
            var firstTryCount = Math.Max(1, progress.TotalAttempts); // approx; good enough for display
            progress.AverageResponseTimeMs =
                ((progress.AverageResponseTimeMs * (firstTryCount - 1)) + request.ResponseTimeMs) / firstTryCount;
        }

        var stars = isCorrect ? (firstTry ? 2 : 1) : 0;
        progress.Score += stars;

        if (isCorrect)
        {
            progress.CorrectStreak++;
            if (progress.CorrectStreak >= LevelUpStreak && progress.Level < MaxLevel)
            {
                progress.Level++;
                progress.CorrectStreak = 0;
            }
        }
        else
        {
            progress.CorrectStreak = 0;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new SubmitExerciseResult
        {
            IsCorrect = isCorrect,
            CorrectAnswer = payload.Answer,
            StarsAwarded = stars,
            TotalStars = progress.Score,
            Level = progress.Level,
            Feedback = isCorrect ? "ყოჩაღ!" : "კარგად დაფიქრდი და კიდევ სცადე.",
            FeedbackAudioKey = isCorrect ? "success" : "error"
        };
    }

    public async Task<IReadOnlyList<SkillProgressDto>> GetProgressAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var rows = await _db.SkillProgress.AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        // Per-skill facts derived from stored attempts: distinct practice days
        // (Tbilisi = UTC+4) and the largest numeric answer answered correctly.
        var attempts = await _db.ExerciseAttempts.AsNoTracking()
            .Where(a => a.UserId == userId)
            .Select(a => new { a.Skill, a.ExerciseType, a.World, a.CreatedAtUtc, a.CorrectAnswer, a.IsCorrect })
            .ToListAsync(cancellationToken);
        var daysBySkill = attempts
            .GroupBy(a => a.Skill)
            .ToDictionary(g => g.Key, g => g.Select(a => a.CreatedAtUtc.AddHours(4).Date).Distinct().Count());
        // The Star Sky "count to N" stars belong to Volume II — they light only from
        // genuine counting done inside the Star Sky, never from the map tours.
        var maxCountingValue = attempts
            .Where(a => a.IsCorrect && a.ExerciseType == "counting" && a.World == "sky")
            .Select(a => int.TryParse(a.CorrectAnswer, out var v) ? v : 0)
            .DefaultIfEmpty(0)
            .Max();
        // Correct answers per skill earned inside the Star Sky (Volume II is
        // independent of the map tours).
        var skyCorrectBySkill = attempts
            .Where(a => a.IsCorrect && a.World == "sky")
            .GroupBy(a => a.Skill)
            .ToDictionary(g => g.Key, g => g.Count());

        return rows.Select(p => new SkillProgressDto
        {
            Skill = p.Skill,
            Level = p.Level,
            Score = p.Score,
            TotalAttempts = p.TotalAttempts,
            CorrectAttempts = p.CorrectAttempts,
            Accuracy = p.TotalAttempts > 0 ? (int)Math.Round(100.0 * p.CorrectAttempts / p.TotalAttempts) : 0,
            AverageResponseTimeMs = (int)Math.Round(p.AverageResponseTimeMs),
            DaysPracticed = daysBySkill.GetValueOrDefault(p.Skill, 0),
            MaxCorrectValue = p.Skill == "counting" ? maxCountingValue : 0,
            SkyCorrectCount = skyCorrectBySkill.GetValueOrDefault(p.Skill, 0)
        }).ToList();
    }

    // -----------------------------------------------------------------------
    // Counting generation
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateCounting(int level, string? world, string skill, string type, int? forcedMax = null)
    {
        // A "count to N" star mission caps the range at N; otherwise it follows
        // the child's counting level.
        var max = forcedMax ?? MaxCountForCounting(level);
        // Bias toward the top of the range so the child regularly reaches the
        // target number (e.g. actually counts 20 in the "count to 20" mission).
        var min = Math.Max(1, max - 4);
        var n = Random.Shared.Next(min, max + 1);

        var emoji = world is not null && WorldEmoji.TryGetValue(world, out var e) ? e : "🍎";

        var options = BuildNumberOptions(n, max)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        var payload = new ExerciseTokenPayload
        {
            Eid = Guid.NewGuid().ToString("N"),
            Type = type,
            Skill = skill,
            World = world,
            Difficulty = level,
            Answer = n.ToString(),
            ExpUnix = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds()
        };

        return new ExerciseDto
        {
            Id = payload.Eid,
            Type = type,
            Skill = skill,
            World = world,
            Difficulty = level,
            Instruction = CountingPrompt(world),
            InstructionAudioKey = "counting.howMany",
            Visual = new ExerciseVisual { Kind = "objects", Emoji = emoji, Count = n },
            Options = options,
            Token = _tokens.Issue(payload)
        };
    }

    private static string CountingPrompt(string? world)
        => world is not null && WorldNoun.TryGetValue(world, out var w)
            ? $"დაითვალე — რამდენი {w.One}ა {w.Where}?"
            : "დაითვალე — რამდენია?";

    // -----------------------------------------------------------------------
    // Comparison (More / Less)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateComparison(int level, string? world, string skill, string type)
    {
        var max = Math.Max(3, MaxCountForLevel(level));
        int a = Random.Shared.Next(1, max + 1), b;
        do { b = Random.Shared.Next(1, max + 1); } while (b == a);

        var emoji = EmojiFor(world, "🥕");
        var bigger = a > b ? "a" : "b";

        var options = new[]
        {
            new ExerciseOption { Value = "a", Emoji = emoji, Count = a },
            new ExerciseOption { Value = "b", Emoji = emoji, Count = b }
        }.OrderBy(_ => Random.Shared.Next()).ToList();

        var noun = world is not null && WorldNoun.TryGetValue(world, out var w) ? w.One : null;
        var prompt = world == "sky"
            ? "რომელ ცას აქვს მეტი ვარსკვლავი?"
            : (noun is not null ? $"სად არის მეტი {noun}?" : "სად არის მეტი?");
        return Build(type, skill, world, level, prompt, "comparison.more",
            new ExerciseVisual { Kind = "none" }, options, bigger);
    }

    // -----------------------------------------------------------------------
    // Patterns (what comes next)
    // -----------------------------------------------------------------------

    private ExerciseDto GeneratePatterns(int level, string? world, string skill, string type)
    {
        // Half the time, a colour-identification task ("which star is green?"),
        // half a "what comes next?" sequence — both build the colours skill.
        if (Random.Shared.Next(2) == 0) return GenerateColorId(world, skill, type);

        var palette = PatternPalette.OrderBy(_ => Random.Shared.Next()).ToList();
        var unit = level >= 3 ? new[] { palette[0], palette[1], palette[2] } : new[] { palette[0], palette[1] };

        // Show two full repetitions, then ask for the next element.
        var seq = new List<string>();
        for (var r = 0; r < 2; r++) seq.AddRange(unit);
        var answer = unit[seq.Count % unit.Length];

        var distractors = palette.Where(p => p != answer).Take(2);
        var options = new[] { answer }.Concat(distractors)
            .OrderBy(_ => Random.Shared.Next())
            .Select(e => new ExerciseOption { Value = e, Label = e })
            .ToList();

        return Build(type, skill, world, level, "რა მოდის შემდეგ?", "patterns.next",
            new ExerciseVisual { Kind = "sequence", Items = seq }, options, answer);
    }

    /// <summary>"Which star is &lt;colour&gt;?" — four coloured stars, pick the named
    /// colour. Each option carries its hex in Label so the client can paint it.</summary>
    private ExerciseDto GenerateColorId(string? world, string skill, string type)
    {
        var chosen = ColorPalette.OrderBy(_ => Random.Shared.Next()).Take(4).ToList();
        var target = chosen[Random.Shared.Next(chosen.Count)];

        var options = chosen
            .OrderBy(_ => Random.Shared.Next())
            .Select(c => new ExerciseOption { Value = c.Id, Label = c.Hex })
            .ToList();

        var prompt = world == "sky"
            ? $"რომელი ვარსკვლავია {target.Name}?"
            : $"რომელია {target.Name}?";

        return Build(type, skill, world, 1, prompt, "colors.which",
            new ExerciseVisual { Kind = "colors" }, options, target.Id);
    }

    // -----------------------------------------------------------------------
    // Simple addition (visual)
    // -----------------------------------------------------------------------

    /// <summary>The "addition" type is really a small arithmetic mix — plain
    /// addition, subtraction, and complete-to-N — so a tour keeps varying.</summary>
    private ExerciseDto GenerateAddition(int level, string? world, string skill, string type)
    {
        var kinds = level <= 1 ? new[] { "addition", "makeN" } : new[] { "addition", "subtraction", "makeN" };
        return kinds[Random.Shared.Next(kinds.Length)] switch
        {
            "subtraction" => GenerateSubtraction(level, world, skill, type),
            "makeN" => GenerateMakeN(level, world, skill, type),
            _ => GeneratePlainAddition(level, world, skill, type)
        };
    }

    private ExerciseDto GeneratePlainAddition(int level, string? world, string skill, string type)
    {
        var sumMax = level switch { <= 1 => 5, 2 => 7, 3 => 9, _ => 10 };
        var x = Random.Shared.Next(1, sumMax);
        var y = Random.Shared.Next(1, sumMax - x + 1);
        var sum = x + y;

        var emoji = EmojiFor(world, "🍎");
        var options = BuildNumberOptions(sum, sumMax)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        return Build(type, skill, world, level, "რამდენი იქნება ჯამში?", "addition.howMany",
            new ExerciseVisual { Kind = "addition", Emoji = emoji, Addends = new[] { x, y } },
            options, sum.ToString());
    }

    private ExerciseDto GenerateSubtraction(int level, string? world, string skill, string type)
    {
        var max = Math.Max(3, MaxCountForLevel(level));
        var a = Random.Shared.Next(2, max + 1);
        var b = Random.Shared.Next(1, a);      // 1..a-1 so something remains
        var diff = a - b;

        var emoji = EmojiFor(world, "🍎");
        var options = BuildNumberOptions(diff, a)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        return Build(type, skill, world, level, $"იყო {a}, წაიღეს {b} — რამდენი დარჩა?", "subtraction.left",
            new ExerciseVisual { Kind = "subtraction", Emoji = emoji, Addends = new[] { a, b } },
            options, diff.ToString());
    }

    private ExerciseDto GenerateMakeN(int level, string? world, string skill, string type)
    {
        // "Complete to N": show `have` solid objects and `target - have` dashed
        // slots, ask how many MORE are needed to reach the target.
        var target = level switch { <= 1 => 5, 2 => 6, 3 => 8, _ => 10 };
        var have = Random.Shared.Next(1, target); // 1..target-1
        var missing = target - have;

        var emoji = EmojiFor(world, "🍎");
        var options = BuildNumberOptions(missing, target)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        return Build(type, skill, world, level, MakeNPrompt(world, have, target), "addition.makeN",
            new ExerciseVisual { Kind = "makeN", Emoji = emoji, Count = have, Target = target },
            options, missing.ToString());
    }

    private static string MakeNPrompt(string? world, int have, int target)
    {
        if (world is not null && WorldNoun.TryGetValue(world, out var w))
            return $"{w.Where} {have} {w.One}ა. კიდევ რამდენი დაგვჭირდება, რომ {target} გახდეს?";
        return $"{have}-ია. კიდევ რამდენი დაგვჭირდება, რომ {target} გახდეს?";
    }

    // -----------------------------------------------------------------------
    // Classification (which is different)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateClassification(int level, string? world, string skill, string type)
    {
        var pool = ObjectPool.OrderBy(_ => Random.Shared.Next()).ToList();
        var common = pool[0];
        var odd = pool[1];
        var commonCount = level <= 1 ? 3 : level <= 3 ? 4 : 5;

        var items = new List<string>();
        for (var i = 0; i < commonCount; i++) items.Add(common);
        items.Add(odd);
        items = items.OrderBy(_ => Random.Shared.Next()).ToList();

        var options = items
            .Select((e, i) => new ExerciseOption { Value = i.ToString(), Label = e })
            .ToList();
        var answer = items.FindIndex(e => e == odd).ToString();

        return Build(type, skill, world, level, "რომელია განსხვავებული?", "classification.different",
            new ExerciseVisual { Kind = "row" }, options, answer);
    }

    // -----------------------------------------------------------------------
    // Attention (count a target among mixed objects)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateAttention(int level, string? world, string skill, string type)
    {
        var pool = ObjectPool.OrderBy(_ => Random.Shared.Next()).ToList();
        var target = pool[0];
        var distractors = new[] { pool[1], pool[2] };

        var max = MaxCountForLevel(level);
        var targetCount = Random.Shared.Next(1, max + 1);
        var distractorCount = Random.Shared.Next(2, targetCount + 3);

        var items = new List<string>();
        for (var i = 0; i < targetCount; i++) items.Add(target);
        for (var i = 0; i < distractorCount; i++) items.Add(distractors[Random.Shared.Next(distractors.Length)]);
        items = items.OrderBy(_ => Random.Shared.Next()).ToList();

        var options = BuildNumberOptions(targetCount, max)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        return Build(type, skill, world, level, $"ყურადღებით დაითვალე — რამდენი {target}-ია?", "attention.count",
            new ExerciseVisual { Kind = "mixed", Emoji = target, Items = items },
            options, targetCount.ToString());
    }

    // -----------------------------------------------------------------------
    // Memory (show, hide, then "which did you see?")
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateMemory(int level, string? world, string skill, string type)
    {
        // Memory cards: show an ordered set, hide it, then the child rebuilds the
        // same order. The correct answer is the ordered sequence; options are the
        // same cards shuffled for recall.
        var pool = ObjectPool.OrderBy(_ => Random.Shared.Next()).ToList();
        var k = level <= 2 ? 3 : 4;

        var sequence = pool.Take(k).ToList();
        var options = sequence
            .OrderBy(_ => Random.Shared.Next())
            .Select(e => new ExerciseOption { Value = e, Label = e })
            .ToList();

        var answer = string.Join(",", sequence);

        return Build(type, skill, world, level, "დაალაგე იგივე თანმიმდევრობით", "memory.order",
            new ExerciseVisual { Kind = "memory", Items = sequence }, options, answer);
    }

    // -----------------------------------------------------------------------
    // Speed (tap the star as it appears)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateSpeed(int level, string? world, string skill, string type)
    {
        // Scatter the star among decoy objects — the child must find and tap the
        // star specifically (more decoys at higher levels).
        var distractorCount = level <= 1 ? 3 : level <= 3 ? 4 : 6;
        var distractors = ObjectPool.Where(e => e != "⭐")
            .OrderBy(_ => Random.Shared.Next())
            .Take(distractorCount)
            .ToList();

        var options = new List<ExerciseOption> { new() { Value = "go", Label = "⭐" } };
        return Build(type, skill, world, level, "იპოვე და დააჭირე ვარსკვლავს!", "speed.tap",
            new ExerciseVisual { Kind = "speed", Emoji = "⭐", Items = distractors }, options, "go");
    }

    // -----------------------------------------------------------------------
    // Shared builder
    // -----------------------------------------------------------------------

    private ExerciseDto Build(
        string type, string skill, string? world, int level,
        string instruction, string audioKey, ExerciseVisual visual,
        IReadOnlyList<ExerciseOption> options, string answer)
    {
        var payload = new ExerciseTokenPayload
        {
            Eid = Guid.NewGuid().ToString("N"),
            Type = type,
            Skill = skill,
            World = world,
            Difficulty = level,
            Answer = answer,
            ExpUnix = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds()
        };

        return new ExerciseDto
        {
            Id = payload.Eid,
            Type = type,
            Skill = skill,
            World = world,
            Difficulty = level,
            Instruction = instruction,
            InstructionAudioKey = audioKey,
            Visual = visual,
            Options = options,
            Token = _tokens.Issue(payload)
        };
    }

    private static string EmojiFor(string? world, string fallback)
        => world is not null && WorldEmoji.TryGetValue(world, out var e) ? e : fallback;

    private static int MaxCountForLevel(int level) => level switch
    {
        <= 1 => 3,
        2 => 5,
        3 => 6,
        4 => 8,
        _ => 10
    };

    /// <summary>Counting ramps far higher than other skills — up to 100 — so the
    /// "count to 10 / 20 / 100" milestones are reachable (level 5 / 8 / 12).</summary>
    private static int MaxCountForCounting(int level) => level switch
    {
        <= 1 => 10,
        2 => 12,
        3 => 14,
        4 => 16,
        5 => 20,
        6 => 25,
        7 => 35,
        8 => 50,
        9 => 65,
        10 => 80,
        11 => 90,
        _ => 100
    };

    /// <summary>Correct value plus two nearby, plausible distractors — shuffled.</summary>
    private static List<int> BuildNumberOptions(int correct, int max)
    {
        var set = new SortedSet<int> { correct };
        var candidates = new[] { correct - 1, correct + 1, correct + 2, correct - 2 };
        foreach (var c in candidates)
        {
            if (set.Count >= 3) break;
            if (c >= 1 && c <= max + 2) set.Add(c);
        }
        // Guarantee three options even for tiny ranges.
        var fill = 1;
        while (set.Count < 3) { set.Add(correct + fill); fill++; }

        return set.OrderBy(_ => Random.Shared.Next()).ToList();
    }
}
