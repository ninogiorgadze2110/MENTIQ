using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Parent.Dtos;
using Mentiq.Application.Features.Progression;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Parent;

public sealed class ParentService : IParentService
{
    private readonly IApplicationDbContext _db;
    private readonly IProgressionService _progression;

    public ParentService(IApplicationDbContext db, IProgressionService progression)
    {
        _db = db;
        _progression = progression;
    }

    public async Task<ParentSummaryDto> GetWeeklySummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var twoWeeksAgo = now.AddDays(-14);

        var sessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId && s.CompletedAtUtc >= twoWeeksAgo)
            .Select(s => new { s.Accuracy, s.AvgSeconds, s.TotalQuestions, s.CompletedAtUtc })
            .ToListAsync(cancellationToken);

        var thisWeek = sessions.Where(s => s.CompletedAtUtc >= weekAgo).ToList();
        var prevWeek = sessions.Where(s => s.CompletedAtUtc < weekAgo).ToList();

        var daysThisWeek = thisWeek.Select(s => DateOnly.FromDateTime(s.CompletedAtUtc)).Distinct().Count();

        var thisTimed = thisWeek.Where(s => s.AvgSeconds > 0).ToList();
        var prevTimed = prevWeek.Where(s => s.AvgSeconds > 0).ToList();
        var speedAfter = thisTimed.Count > 0 ? Math.Round(thisTimed.Average(s => s.AvgSeconds), 1) : 0;
        var speedBefore = prevTimed.Count > 0 ? Math.Round(prevTimed.Average(s => s.AvgSeconds), 1) : 0;
        var speedImproved = speedBefore > 0 && speedAfter > 0 && speedAfter < speedBefore;

        var accThis = thisWeek.Count > 0 ? (int)Math.Round(thisWeek.Average(s => s.Accuracy)) : 0;
        var accPrev = prevWeek.Count > 0 ? (int)Math.Round(prevWeek.Average(s => s.Accuracy)) : 0;

        // Belts, tricks and weakest skill from the progression snapshot.
        var prog = await _progression.GetAsync(userId, cancellationToken);
        string BeltName(int index) => prog.Belts.FirstOrDefault(b => b.Index == index)?.Name ?? string.Empty;

        var belts = prog.Skills
            .Where(s => s.BeltIndex >= 1)
            .OrderByDescending(s => s.BeltIndex)
            .Select(s => new ParentBeltDto { SkillName = s.Name, BeltName = BeltName(s.BeltIndex), BeltIndex = s.BeltIndex })
            .ToList();
        var topBeltIndex = prog.Skills.Count > 0 ? prog.Skills.Max(s => s.BeltIndex) : 0;
        var topBeltName = topBeltIndex >= 1 ? BeltName(topBeltIndex) : string.Empty;

        var trickIds = prog.Skills
            .SelectMany(s => s.LessonsByBelt.Take(s.BeltIndex).SelectMany(b => b))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var needsHelp = prog.Skills
            .Where(s => s.Unlocked && s.Mastery.AnswersCount > 0)
            .OrderBy(s => s.Mastery.AccuracyPercent)
            .FirstOrDefault();

        return new ParentSummaryDto
        {
            ChildName = FirstName(user.DisplayName),
            Grade = user.Grade,
            DaysThisWeek = daysThisWeek,
            SessionsThisWeek = thisWeek.Count,
            QuestionsThisWeek = thisWeek.Sum(s => s.TotalQuestions),
            TopBeltName = topBeltName,
            Belts = belts,
            TricksMastered = trickIds.Count,
            TrickIds = trickIds,
            SpeedBeforeSeconds = speedBefore,
            SpeedAfterSeconds = speedAfter,
            SpeedImproved = speedImproved,
            AccuracyThisWeek = accThis,
            AccuracyPrevWeek = accPrev,
            NeedsHelpSkillName = needsHelp?.Name,
            NeedsHelpAccuracy = needsHelp is null ? null : needsHelp.Mastery.AccuracyPercent
        };
    }

    private static string FirstName(string displayName)
        => string.IsNullOrWhiteSpace(displayName) ? "ბავშვი" : displayName.Split(' ')[0];
}
