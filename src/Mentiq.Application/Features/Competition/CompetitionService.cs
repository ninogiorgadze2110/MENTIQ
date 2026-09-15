using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Competition.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using CompetitionEntity = Mentiq.Domain.Entities.Competition;

namespace Mentiq.Application.Features.Competition;

public sealed class CompetitionService : ICompetitionService
{
    private readonly IApplicationDbContext _db;

    public CompetitionService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<LeaderboardResponse> GetLeaderboardAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var me = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (me is null)
        {
            return new LeaderboardResponse();
        }

        var grade = me.Grade;

        var users = await _db.Users
            .Where(u => u.Grade == grade && u.IsDeleted != true)
            .Select(u => new { u.Id, u.DisplayName })
            .ToListAsync(cancellationToken);

        var userIds = users.Select(u => u.Id).ToList();

        var totals = await _db.PracticeSessions
            .Where(s => userIds.Contains(s.UserId))
            .GroupBy(s => s.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(x => x.Score), Sessions = g.Count() })
            .ToListAsync(cancellationToken);

        var byUser = totals.ToDictionary(t => t.UserId);

        var entries = users
            .Select(u =>
            {
                byUser.TryGetValue(u.Id, out var t);
                return new { u.Id, u.DisplayName, Total = t?.Total ?? 0, Sessions = t?.Sessions ?? 0 };
            })
            .OrderByDescending(x => x.Total)
            .ThenBy(x => x.DisplayName)
            .Select((x, i) => new LeaderboardEntry
            {
                Rank = i + 1,
                DisplayName = x.DisplayName,
                TotalScore = x.Total,
                Sessions = x.Sessions,
                IsCurrentUser = x.Id == userId
            })
            .ToList();

        var mine = entries.FirstOrDefault(e => e.IsCurrentUser);

        return new LeaderboardResponse
        {
            Grade = grade,
            Participants = entries.Count,
            MyRank = mine?.Rank ?? 0,
            MyScore = mine?.TotalScore ?? 0,
            Entries = entries
        };
    }

    public async Task<CompetitionDto> CreateAsync(Guid userId, CreateCompetitionRequest request, CancellationToken cancellationToken = default)
    {
        var me = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var grade = request.Grade == 0 ? me.Grade : request.Grade;
        var now = DateTime.UtcNow;

        var competition = new CompetitionEntity
        {
            Title = request.Title.Trim(),
            Grade = grade,
            QuestionCount = request.QuestionCount,
            StartsAtUtc = now,
            EndsAtUtc = now.AddHours(request.DurationHours),
            CreatedByUserId = userId,
            CreatedByName = me.DisplayName
        };

        _db.Competitions.Add(competition);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(competition, now, participants: 0, played: false, myScore: 0);
    }

    public async Task<IReadOnlyList<CompetitionDto>> GetListAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var me = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (me is null)
        {
            return System.Array.Empty<CompetitionDto>();
        }

        var competitions = await _db.Competitions
            .Where(c => c.Grade == me.Grade)
            .OrderByDescending(c => c.EndsAtUtc)
            .Take(30)
            .ToListAsync(cancellationToken);

        var ids = competitions.Select(c => c.Id).ToList();

        var entries = await _db.CompetitionEntries
            .Where(e => ids.Contains(e.CompetitionId))
            .Select(e => new { e.CompetitionId, e.UserId, e.Score })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        return competitions
            .Select(c =>
            {
                var mine = entries.FirstOrDefault(e => e.CompetitionId == c.Id && e.UserId == userId);
                var participants = entries.Count(e => e.CompetitionId == c.Id);
                return ToDto(c, now, participants, mine is not null, mine?.Score ?? 0);
            })
            .ToList();
    }

    public async Task SubmitAsync(Guid userId, Guid competitionId, SubmitEntryRequest request, CancellationToken cancellationToken = default)
    {
        var competition = await _db.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken)
            ?? throw new NotFoundException("Competition not found.");

        var now = DateTime.UtcNow;
        if (now < competition.StartsAtUtc || now > competition.EndsAtUtc)
        {
            throw new ConflictException("ეს შეჯიბრი აქტიური არ არის.");
        }

        var already = await _db.CompetitionEntries
            .AnyAsync(e => e.CompetitionId == competitionId && e.UserId == userId, cancellationToken);
        if (already)
        {
            throw new ConflictException("ამ შეჯიბრში უკვე მიიღე მონაწილეობა.");
        }

        var me = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        _db.CompetitionEntries.Add(new CompetitionEntry
        {
            CompetitionId = competitionId,
            UserId = userId,
            DisplayName = me.DisplayName,
            Score = request.Score,
            CorrectCount = request.CorrectCount,
            TotalQuestions = request.TotalQuestions,
            Accuracy = Math.Clamp(request.Accuracy, 0, 100),
            DurationSeconds = request.DurationSeconds,
            SubmittedAtUtc = now
        });

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<CompetitionDetailDto> GetDetailAsync(Guid userId, Guid competitionId, CancellationToken cancellationToken = default)
    {
        var competition = await _db.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken)
            ?? throw new NotFoundException("Competition not found.");

        var entries = await _db.CompetitionEntries
            .Where(e => e.CompetitionId == competitionId)
            .OrderByDescending(e => e.Score)
            .ThenBy(e => e.SubmittedAtUtc)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var mine = entries.FirstOrDefault(e => e.UserId == userId);

        var ranked = entries
            .Select((e, i) => new CompetitionEntryDto
            {
                Rank = i + 1,
                DisplayName = e.DisplayName,
                Score = e.Score,
                Accuracy = e.Accuracy,
                IsCurrentUser = e.UserId == userId
            })
            .ToList();

        return new CompetitionDetailDto
        {
            Competition = ToDto(competition, now, entries.Count, mine is not null, mine?.Score ?? 0),
            Entries = ranked
        };
    }

    private static CompetitionDto ToDto(CompetitionEntity c, DateTime now, int participants, bool played, int myScore) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Grade = c.Grade,
        QuestionCount = c.QuestionCount,
        StartsAtUtc = c.StartsAtUtc,
        EndsAtUtc = c.EndsAtUtc,
        Status = now < c.StartsAtUtc ? "upcoming" : now > c.EndsAtUtc ? "ended" : "active",
        Participants = participants,
        Played = played,
        MyScore = myScore,
        CreatedByName = c.CreatedByName
    };
}
