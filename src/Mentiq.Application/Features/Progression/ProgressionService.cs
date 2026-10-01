using System.Text.Json;
using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Progression.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Progression;

public sealed class ProgressionService : IProgressionService
{
    private readonly IApplicationDbContext _db;

    private static readonly JsonSerializerOptions Json = new();

    public ProgressionService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<BeltProgressResponse> GetAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var rows = await LoadOrInitAsync(userId, cancellationToken);
        return BuildResponse(rows);
    }

    public async Task<BeltProgressResponse> RecordAnswersAsync(Guid userId, RecordAnswersRequest request, CancellationToken cancellationToken = default)
    {
        var skill = request.Skill?.Trim() ?? string.Empty;
        if (!ProgressionConfig.IsSkill(skill))
        {
            throw new ValidationException($"Unknown skill '{request.Skill}'.");
        }

        await LoadOrInitAsync(userId, cancellationToken); // ensure rows exist
        var row = await _db.UserSkillProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Skill == skill, cancellationToken);
        if (row is null)
        {
            row = new UserSkillProgress { UserId = userId, Skill = skill };
            _db.UserSkillProgress.Add(row);
        }

        var incoming = (request.Answers ?? Array.Empty<AnswerDto>())
            .Select(a => new AnswerRecord(a.Correct, Math.Max(0, a.TimeMs)))
            .ToList();

        var recent = Deserialize(row.RecentJson).Concat(incoming).ToList();

        // One session → at most one belt. Advance resets the window on promotion.
        var (belt, kept, _) = MasteryEvaluator.Advance(recent, row.BeltIndex);

        row.BeltIndex = belt;
        row.RecentJson = Serialize(kept);
        row.TotalAnswers += incoming.Count;
        row.TotalCorrect += incoming.Count(a => a.Correct);

        await _db.SaveChangesAsync(cancellationToken);

        var rows = await _db.UserSkillProgress.Where(p => p.UserId == userId).ToListAsync(cancellationToken);
        return BuildResponse(rows);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /// <summary>Ensures a row exists per skill. First-time users start at white;
    /// their existing practice history is used for a best-effort belt backfill.</summary>
    private async Task<List<UserSkillProgress>> LoadOrInitAsync(Guid userId, CancellationToken cancellationToken)
    {
        var rows = await _db.UserSkillProgress.Where(p => p.UserId == userId).ToListAsync(cancellationToken);
        if (rows.Count > 0)
        {
            return rows;
        }

        var inferred = await InferBeltsFromHistoryAsync(userId, cancellationToken);
        rows = ProgressionConfig.Skills
            .Select(s => new UserSkillProgress
            {
                UserId = userId,
                Skill = s.Key,
                BeltIndex = inferred.GetValueOrDefault(s.Key, 0),
                RecentJson = "[]"
            })
            .ToList();

        _db.UserSkillProgress.AddRange(rows);
        await _db.SaveChangesAsync(cancellationToken);
        return rows;
    }

    /// <summary>
    /// Best-effort backfill from existing <see cref="PracticeSession"/> history:
    /// for each skill, the highest belt whose target was met in a ≥90%-accuracy
    /// session (matched by the skill's Georgian name in the session title). Only
    /// session aggregates exist, so this is approximate; new answers refine it.
    /// </summary>
    private async Task<Dictionary<string, int>> InferBeltsFromHistoryAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId && s.Accuracy >= ProgressionConfig.MinAccuracyPercent && s.AvgSeconds > 0)
            .Select(s => new { s.Title, s.AvgSeconds })
            .ToListAsync(cancellationToken);

        var result = new Dictionary<string, int>();
        if (sessions.Count == 0)
        {
            return result;
        }

        foreach (var skill in ProgressionConfig.Skills)
        {
            var matching = sessions
                .Where(s => s.Title.Contains(skill.Name, StringComparison.OrdinalIgnoreCase))
                .ToList();
            if (matching.Count == 0)
            {
                continue;
            }

            var bestAvg = matching.Min(s => s.AvgSeconds);
            // Highest belt whose target (seconds) the user already beat.
            var passed = 0;
            foreach (var belt in ProgressionConfig.Belts)
            {
                if (bestAvg <= belt.TargetSeconds)
                {
                    passed = Math.Max(passed, belt.Index);
                }
            }
            if (passed > 0)
            {
                result[skill.Key] = passed;
            }
        }

        return result;
    }

    private static BeltProgressResponse BuildResponse(List<UserSkillProgress> rows)
    {
        var byKey = rows.ToDictionary(r => r.Skill, StringComparer.OrdinalIgnoreCase);
        int BeltOf(string key) => byKey.TryGetValue(key, out var r) ? r.BeltIndex : 0;

        var skills = ProgressionConfig.Skills.Select(def =>
        {
            var belt = BeltOf(def.Key);
            var recent = byKey.TryGetValue(def.Key, out var row) ? Deserialize(row.RecentJson) : new List<AnswerRecord>();
            var snap = MasteryEvaluator.Snapshot(recent, belt);

            var unlocked = def.Requires is null || BeltOf(def.Requires.Skill) >= def.Requires.BeltIndex;

            return new SkillProgressDto
            {
                Key = def.Key,
                Name = def.Name,
                BeltIndex = belt,
                BeltId = ProgressionConfig.Belt(belt).Id,
                Unlocked = unlocked,
                Requires = def.Requires is null ? null : new PrerequisiteDto { Skill = def.Requires.Skill, BeltIndex = def.Requires.BeltIndex },
                Mastery = new MasteryDto
                {
                    AccuracyPercent = snap.AccuracyPercent,
                    MedianTimeMs = snap.MedianTimeMs,
                    AnswersCount = snap.AnswersCount,
                    WindowSize = snap.WindowSize,
                    TargetSeconds = snap.TargetSeconds,
                    Ready = snap.Ready
                },
                LessonsByBelt = def.LessonsByBelt
            };
        }).ToList();

        return new BeltProgressResponse
        {
            Belts = ProgressionConfig.Belts.Select(b => new BeltDto
            {
                Id = b.Id,
                Name = b.Name,
                Index = b.Index,
                Difficulty = b.Difficulty,
                TargetSeconds = b.TargetSeconds
            }).ToList(),
            Skills = skills,
            MasteryWindow = ProgressionConfig.MasteryWindow,
            MinAccuracyPercent = ProgressionConfig.MinAccuracyPercent
        };
    }

    private static List<AnswerRecord> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<AnswerRecord>();
        }
        try
        {
            var raw = JsonSerializer.Deserialize<List<StoredAnswer>>(json, Json) ?? new();
            return raw.Select(a => new AnswerRecord(a.C, a.T)).ToList();
        }
        catch
        {
            return new List<AnswerRecord>();
        }
    }

    private static string Serialize(IReadOnlyList<AnswerRecord> answers)
        => JsonSerializer.Serialize(answers.Select(a => new StoredAnswer { C = a.Correct, T = a.TimeMs }), Json);

    private sealed class StoredAnswer
    {
        public bool C { get; set; }
        public int T { get; set; }
    }
}
