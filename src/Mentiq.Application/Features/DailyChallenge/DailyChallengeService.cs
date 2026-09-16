using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.DailyChallenge.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.DailyChallenge;

public sealed class DailyChallengeService : IDailyChallengeService
{
    private readonly IApplicationDbContext _db;

    // Tbilisi is a fixed UTC+4 offset (no DST). The daily challenge rolls over
    // at 06:00 local time each morning.
    private static readonly TimeSpan TbilisiOffset = TimeSpan.FromHours(4);
    private const int CutoffHour = 6;

    private const int QuizSeconds = 60;
    private const int LeaderboardSize = 50;

    public DailyChallengeService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<DailyChallengeDto> GetTodayAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var now = DateTime.UtcNow;
        var date = ChallengeDateFor(now);
        var ordered = await OrderedEntriesAsync(date, user.Grade, cancellationToken);

        var myIndex = ordered.FindIndex(e => e.UserId == userId);
        var mine = myIndex >= 0 ? ordered[myIndex] : null;

        return new DailyChallengeDto
        {
            Date = date,
            Grade = user.Grade,
            QuizSeconds = QuizSeconds,
            Completed = mine is not null,
            MyScore = mine?.Score,
            MyRank = myIndex >= 0 ? myIndex + 1 : null,
            ParticipantCount = ordered.Count,
            ResetsAtUtc = ResetsAtUtc(date)
        };
    }

    public async Task<DailyChallengeDto> SubmitAsync(Guid userId, SubmitDailyChallengeRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var now = DateTime.UtcNow;
        var date = ChallengeDateFor(now);

        // The grade always comes from the account, never the client, so a user
        // cannot enter an easier grade's leaderboard.
        var grade = user.Grade;

        var entry = await _db.DailyChallengeEntries
            .FirstOrDefaultAsync(e => e.ChallengeDate == date && e.Grade == grade && e.UserId == userId, cancellationToken);

        if (entry is null)
        {
            _db.DailyChallengeEntries.Add(new DailyChallengeEntry
            {
                ChallengeDate = date,
                Grade = grade,
                UserId = userId,
                DisplayName = user.DisplayName,
                Score = request.Score,
                CorrectCount = request.CorrectCount,
                TotalQuestions = request.TotalQuestions,
                Accuracy = request.Accuracy,
                DurationSeconds = request.DurationSeconds,
                SubmittedAtUtc = now
            });
        }
        else if (request.Score > entry.Score)
        {
            // Keep only the best score for the day.
            entry.Score = request.Score;
            entry.CorrectCount = request.CorrectCount;
            entry.TotalQuestions = request.TotalQuestions;
            entry.Accuracy = request.Accuracy;
            entry.DurationSeconds = request.DurationSeconds;
            entry.DisplayName = user.DisplayName;
            entry.SubmittedAtUtc = now;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetTodayAsync(userId, cancellationToken);
    }

    public async Task<DailyChallengeLeaderboardResponse> GetLeaderboardAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var now = DateTime.UtcNow;
        var date = ChallengeDateFor(now);
        var ordered = await OrderedEntriesAsync(date, user.Grade, cancellationToken);

        var rows = ordered
            .Take(LeaderboardSize)
            .Select((e, i) => new DailyChallengeRankRow
            {
                Rank = i + 1,
                UserId = e.UserId,
                DisplayName = e.DisplayName,
                Score = e.Score,
                CorrectCount = e.CorrectCount,
                Accuracy = e.Accuracy,
                DurationSeconds = e.DurationSeconds,
                IsMe = e.UserId == userId
            })
            .ToList();

        var myIndex = ordered.FindIndex(e => e.UserId == userId);

        return new DailyChallengeLeaderboardResponse
        {
            Date = date,
            Grade = user.Grade,
            Entries = rows,
            MyRank = myIndex >= 0 ? myIndex + 1 : null,
            MyScore = myIndex >= 0 ? ordered[myIndex].Score : null,
            ParticipantCount = ordered.Count,
            ResetsAtUtc = ResetsAtUtc(date)
        };
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private async Task<List<DailyChallengeEntry>> OrderedEntriesAsync(DateTime date, int grade, CancellationToken cancellationToken)
    {
        return await _db.DailyChallengeEntries.AsNoTracking()
            .Where(e => e.ChallengeDate == date && e.Grade == grade)
            .OrderByDescending(e => e.Score)
            .ThenBy(e => e.DurationSeconds) // faster wins ties
            .ThenBy(e => e.SubmittedAtUtc)  // earlier submission wins remaining ties
            .ToListAsync(cancellationToken);
    }

    /// <summary>The challenge day key for an instant, rolling at 06:00 Tbilisi time.</summary>
    private static DateTime ChallengeDateFor(DateTime nowUtc)
    {
        var localShifted = nowUtc.Add(TbilisiOffset).AddHours(-CutoffHour);
        return DateTime.SpecifyKind(localShifted.Date, DateTimeKind.Utc);
    }

    /// <summary>UTC instant the given challenge day resets (next 06:00 Tbilisi).</summary>
    private static DateTime ResetsAtUtc(DateTime date)
        => DateTime.SpecifyKind(date.AddDays(1).AddHours(CutoffHour).Add(-TbilisiOffset), DateTimeKind.Utc);
}
