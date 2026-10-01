using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Achievements.Dtos;
using Mentiq.Application.Features.Progression;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Achievements;

public sealed class AchievementService : IAchievementService
{
    private readonly IApplicationDbContext _db;

    public AchievementService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<AchievementsResponse> GetAndEvaluateAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var stats = await ComputeStatsAsync(userId, cancellationToken);

        var unlocked = await _db.UserAchievements
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);

        var unlockedByCode = unlocked.ToDictionary(a => a.Code, a => a.UnlockedAtUtc);
        var newly = new List<string>();
        var now = DateTime.UtcNow;

        foreach (var def in AchievementCatalog.All)
        {
            var met = def.Progress(stats) >= def.Target;
            if (met && !unlockedByCode.ContainsKey(def.Code))
            {
                _db.UserAchievements.Add(new UserAchievement { UserId = userId, Code = def.Code, UnlockedAtUtc = now });
                unlockedByCode[def.Code] = now;
                newly.Add(def.Code);
            }
        }

        if (newly.Count > 0)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }

        var achievements = AchievementCatalog.All
            .Select(def =>
            {
                var isUnlocked = unlockedByCode.TryGetValue(def.Code, out var at);
                return new AchievementDto
                {
                    Code = def.Code,
                    Category = def.Category,
                    Emoji = def.Emoji,
                    Name = def.Name,
                    Description = def.Description,
                    Target = def.Target,
                    Progress = Math.Min(def.Progress(stats), def.Target),
                    Unlocked = isUnlocked,
                    Secret = def.Secret,
                    UnlockedAtUtc = isUnlocked ? at : null
                };
            })
            .ToList();

        return new AchievementsResponse
        {
            UnlockedCount = achievements.Count(a => a.Unlocked),
            Total = achievements.Count,
            Achievements = achievements,
            NewlyUnlocked = newly
        };
    }

    private async Task<UserStats> ComputeStatsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId)
            .Select(s => new { s.Accuracy, s.AvgSeconds, s.TotalQuestions, s.LongestStreak, s.CompletedAtUtc })
            .ToListAsync(cancellationToken);

        // Consecutive-day streak ending today (or yesterday).
        var days = sessions.Select(s => DateOnly.FromDateTime(s.CompletedAtUtc)).ToHashSet();
        var streak = 0;
        if (days.Count > 0)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var cursor = days.Contains(today) ? today : today.AddDays(-1);
            while (days.Contains(cursor)) { streak++; cursor = cursor.AddDays(-1); }
        }

        // Best rolling 7-day window: most active days within any 7-day span.
        var maxActiveDaysInWeek = 0;
        foreach (var d in days)
        {
            var count = days.Count(x => x <= d && x > d.AddDays(-7));
            maxActiveDaysInWeek = Math.Max(maxActiveDaysInWeek, count);
        }

        var timed = sessions.Where(s => s.AvgSeconds > 0).ToList();

        // Belt progression: current belt per skill, used for belt/trick achievements.
        var beltRows = await _db.UserSkillProgress
            .Where(p => p.UserId == userId)
            .Select(p => new { p.Skill, p.BeltIndex })
            .ToListAsync(cancellationToken);
        var beltByKey = beltRows
            .GroupBy(r => r.Skill, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Max(r => r.BeltIndex), StringComparer.OrdinalIgnoreCase);

        var perSkillBelt = ProgressionConfig.Skills
            .Select(s => beltByKey.TryGetValue(s.Key, out var b) ? b : 0)
            .ToList();
        var maxBeltIndex = perSkillBelt.Count > 0 ? perSkillBelt.Max() : 0;
        var minBeltIndex = perSkillBelt.Count > 0 ? perSkillBelt.Min() : 0;

        // Tricks "mastered" = tricks tied to belts the user has already passed.
        var tricksMastered = ProgressionConfig.Skills
            .SelectMany(s =>
            {
                var current = beltByKey.TryGetValue(s.Key, out var b) ? b : 0;
                return s.LessonsByBelt
                    .Take(current) // belts strictly below the current one are passed
                    .SelectMany(lessons => lessons);
            })
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        // Competition ranks.
        var myEntries = await _db.CompetitionEntries
            .Where(e => e.UserId == userId)
            .Select(e => new { e.CompetitionId, e.Score, e.Accuracy })
            .ToListAsync(cancellationToken);

        var bestRank = 0;
        if (myEntries.Count > 0)
        {
            var compIds = myEntries.Select(e => e.CompetitionId).Distinct().ToList();
            var allEntries = await _db.CompetitionEntries
                .Where(e => compIds.Contains(e.CompetitionId))
                .Select(e => new { e.CompetitionId, e.Score })
                .ToListAsync(cancellationToken);

            bestRank = myEntries
                .Select(mine => 1 + allEntries.Count(e => e.CompetitionId == mine.CompetitionId && e.Score > mine.Score))
                .Min();
        }

        return new UserStats
        {
            DayStreak = streak,
            TotalSessions = sessions.Count,
            MaxLongestStreak = sessions.Count > 0 ? sessions.Max(s => s.LongestStreak) : 0,
            BestAvgSeconds = timed.Count > 0 ? timed.Min(s => s.AvgSeconds) : double.MaxValue,
            AnyPerfectSession = sessions.Any(s => s.TotalQuestions > 0 && s.Accuracy == 100),
            Any20Of20 = sessions.Any(s => s.TotalQuestions >= 20 && s.Accuracy == 100),
            BestCompetitionRank = bestRank,
            AnyCompetitionPerfect = myEntries.Any(e => e.Accuracy == 100),
            MaxBeltIndex = maxBeltIndex,
            MinBeltIndex = minBeltIndex,
            TricksMastered = tricksMastered,
            MaxActiveDaysInWeek = maxActiveDaysInWeek
        };
    }
}
