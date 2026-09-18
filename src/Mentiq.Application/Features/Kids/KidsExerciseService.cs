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
        ["space"] = "🚀",
        ["sea"] = "🐠",
        ["toys"] = "🧸",
        ["rabbits"] = "🥕"
    };

    // Which (skill, exercise type) each world runs. Worlds without an implemented
    // type fall back to counting; more are enabled as types are added.
    private static readonly Dictionary<string, (string Skill, string Type)> WorldSkill = new()
    {
        ["apples"] = ("counting", "counting"),
        ["rabbits"] = ("comparison", "comparison"),
        ["colors"] = ("patterns", "patterns"),
        ["space"] = ("addition", "addition"),
        ["toys"] = ("classification", "classification"),
        ["sea"] = ("attention", "attention"),
        ["memory"] = ("memory", "memory"),
        ["speed"] = ("speed", "speed")
    };

    private static readonly string[] PatternPalette = { "🔴", "🔵", "🟢", "🟡", "🟣", "🟠" };

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
        var (skill, type) = world is not null && WorldSkill.TryGetValue(world, out var ws)
            ? ws
            : ("counting", "counting");

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
            _ => GenerateCounting(level, world, skill, type)
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

        return rows.Select(p => new SkillProgressDto
        {
            Skill = p.Skill,
            Level = p.Level,
            Score = p.Score,
            TotalAttempts = p.TotalAttempts,
            CorrectAttempts = p.CorrectAttempts,
            Accuracy = p.TotalAttempts > 0 ? (int)Math.Round(100.0 * p.CorrectAttempts / p.TotalAttempts) : 0,
            AverageResponseTimeMs = (int)Math.Round(p.AverageResponseTimeMs)
        }).ToList();
    }

    // -----------------------------------------------------------------------
    // Counting generation
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateCounting(int level, string? world, string skill, string type)
    {
        var max = MaxCountForLevel(level);
        var n = Random.Shared.Next(1, max + 1);

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
            Instruction = "რამდენია?",
            InstructionAudioKey = "counting.howMany",
            Visual = new ExerciseVisual { Kind = "objects", Emoji = emoji, Count = n },
            Options = options,
            Token = _tokens.Issue(payload)
        };
    }

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

        return Build(type, skill, world, level, "სად არის მეტი?", "comparison.more",
            new ExerciseVisual { Kind = "none" }, options, bigger);
    }

    // -----------------------------------------------------------------------
    // Patterns (what comes next)
    // -----------------------------------------------------------------------

    private ExerciseDto GeneratePatterns(int level, string? world, string skill, string type)
    {
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

    // -----------------------------------------------------------------------
    // Simple addition (visual)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateAddition(int level, string? world, string skill, string type)
    {
        var sumMax = level switch { <= 1 => 5, 2 => 6, 3 => 8, _ => 10 };
        var x = Random.Shared.Next(1, sumMax);
        var y = Random.Shared.Next(1, sumMax - x + 1);
        var sum = x + y;

        var emoji = EmojiFor(world, "🍎");
        var options = BuildNumberOptions(sum, sumMax)
            .Select(v => new ExerciseOption { Value = v.ToString(), Label = v.ToString() })
            .ToList();

        return Build(type, skill, world, level, "რამდენი იქნება?", "addition.howMany",
            new ExerciseVisual { Kind = "addition", Emoji = emoji, Addends = new[] { x, y } },
            options, sum.ToString());
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

        return Build(type, skill, world, level, $"რამდენი {target}-ია?", "attention.count",
            new ExerciseVisual { Kind = "mixed", Emoji = target, Items = items },
            options, targetCount.ToString());
    }

    // -----------------------------------------------------------------------
    // Memory (show, hide, then "which did you see?")
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateMemory(int level, string? world, string skill, string type)
    {
        var pool = ObjectPool.OrderBy(_ => Random.Shared.Next()).ToList();
        var k = level <= 1 ? 2 : level <= 3 ? 3 : 4;

        var shown = pool.Take(k).ToList();
        var target = shown[Random.Shared.Next(shown.Count)];
        var distractors = pool.Skip(k).Take(2).ToList();

        var options = new[] { target }.Concat(distractors)
            .OrderBy(_ => Random.Shared.Next())
            .Select(e => new ExerciseOption { Value = e, Label = e })
            .ToList();

        return Build(type, skill, world, level, "რომელი დაინახე?", "memory.which",
            new ExerciseVisual { Kind = "memory", Items = shown }, options, target);
    }

    // -----------------------------------------------------------------------
    // Speed (tap the star as it appears)
    // -----------------------------------------------------------------------

    private ExerciseDto GenerateSpeed(int level, string? world, string skill, string type)
    {
        var options = new List<ExerciseOption> { new() { Value = "go", Label = "⭐" } };
        return Build(type, skill, world, level, "დააჭირე ვარსკვლავს!", "speed.tap",
            new ExerciseVisual { Kind = "speed", Emoji = "⭐" }, options, "go");
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
