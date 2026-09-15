using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Practice.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Practice;

public sealed class PracticeService : IPracticeService
{
    private readonly IApplicationDbContext _db;

    public PracticeService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task SaveSessionAsync(Guid userId, SavePracticeSessionRequest request, CancellationToken cancellationToken = default)
    {
        var session = new PracticeSession
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Mode = request.Mode,
            TotalQuestions = request.TotalQuestions,
            CorrectCount = request.CorrectCount,
            WrongCount = request.WrongCount,
            Score = request.Score,
            LongestStreak = request.LongestStreak,
            Accuracy = Math.Clamp(request.Accuracy, 0, 100),
            AvgSeconds = request.AvgSeconds,
            DurationSeconds = request.DurationSeconds,
            StartedAtUtc = request.StartedAtUtc == default ? DateTime.UtcNow : request.StartedAtUtc,
            CompletedAtUtc = DateTime.UtcNow
        };

        _db.PracticeSessions.Add(session);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProgressResponse> GetProgressAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var sessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.CompletedAtUtc)
            .ToListAsync(cancellationToken);

        if (sessions.Count == 0)
        {
            return new ProgressResponse();
        }

        var days = sessions
            .Select(s => DateOnly.FromDateTime(s.CompletedAtUtc))
            .ToHashSet();

        // Day streak: consecutive days ending today (or yesterday if not yet practiced today).
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var cursor = days.Contains(today) ? today : today.AddDays(-1);
        var streak = 0;
        while (days.Contains(cursor))
        {
            streak++;
            cursor = cursor.AddDays(-1);
        }

        // Weekly activity: last 7 days, oldest → newest.
        var weekly = new int[7];
        for (var i = 0; i < 7; i++)
        {
            var day = today.AddDays(-(6 - i));
            weekly[i] = sessions.Count(s => DateOnly.FromDateTime(s.CompletedAtUtc) == day);
        }

        var trend = sessions.TakeLast(12).Select(s => s.Accuracy).ToArray();
        var secondsTrend = sessions.TakeLast(12).Select(s => Math.Round(s.AvgSeconds, 1)).ToArray();

        var recent = sessions
            .OrderByDescending(s => s.CompletedAtUtc)
            .Take(6)
            .Select(s => new RecentSessionDto
            {
                Title = s.Title,
                Accuracy = s.Accuracy,
                Score = s.Score,
                CorrectCount = s.CorrectCount,
                TotalQuestions = s.TotalQuestions,
                CompletedAtUtc = s.CompletedAtUtc
            })
            .ToList();

        return new ProgressResponse
        {
            DayStreak = streak,
            TotalSessions = sessions.Count,
            TotalQuestions = sessions.Sum(s => s.TotalQuestions),
            AvgAccuracy = (int)Math.Round(sessions.Average(s => s.Accuracy)),
            AvgSeconds = Math.Round(sessions.Average(s => s.AvgSeconds), 1),
            BestStreak = sessions.Max(s => s.LongestStreak),
            WeeklyActivity = weekly,
            AccuracyTrend = trend,
            SecondsTrend = secondsTrend,
            RecentSessions = recent
        };
    }
}
