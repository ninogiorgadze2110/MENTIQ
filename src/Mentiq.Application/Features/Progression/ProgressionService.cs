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

    /// <summary>
    /// Ensures a row exists per skill. Everyone starts at the white belt (index 0):
    /// belts are earned only through recorded answers (a full mastery window at the
    /// required accuracy and target time), never inferred from past session
    /// aggregates — mastery is the single path to progress.
    /// </summary>
    private async Task<List<UserSkillProgress>> LoadOrInitAsync(Guid userId, CancellationToken cancellationToken)
    {
        var rows = await _db.UserSkillProgress.Where(p => p.UserId == userId).ToListAsync(cancellationToken);
        if (rows.Count > 0)
        {
            // One-time cleanup of belts inferred from session history before mastery
            // recording existed: a belt above white with zero recorded answers was
            // never actually earned, so reset it to white. Belts earned through real
            // answers (TotalAnswers > 0) are left untouched.
            var inferredOnly = rows.Where(r => r.BeltIndex > 0 && r.TotalAnswers == 0).ToList();
            if (inferredOnly.Count > 0)
            {
                foreach (var r in inferredOnly)
                {
                    r.BeltIndex = 0;
                    r.RecentJson = "[]";
                }
                await _db.SaveChangesAsync(cancellationToken);
            }
            return rows;
        }

        rows = ProgressionConfig.Skills
            .Select(s => new UserSkillProgress
            {
                UserId = userId,
                Skill = s.Key,
                BeltIndex = 0,
                RecentJson = "[]"
            })
            .ToList();

        _db.UserSkillProgress.AddRange(rows);
        await _db.SaveChangesAsync(cancellationToken);
        return rows;
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
