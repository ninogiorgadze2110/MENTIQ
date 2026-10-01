using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.League.Dtos;
using Microsoft.EntityFrameworkCore;
using LeagueEntity = Mentiq.Domain.Entities.League;
using LeagueEntryEntity = Mentiq.Domain.Entities.LeagueEntry;
using StandingEntity = Mentiq.Domain.Entities.UserLeagueStanding;

namespace Mentiq.Application.Features.League;

public sealed class LeagueService : ILeagueService
{
    private readonly IApplicationDbContext _db;

    public LeagueService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<MyLeagueResponse> GetMyLeagueAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var tier = await _db.UserLeagueStandings.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Tier)
            .FirstOrDefaultAsync(cancellationToken) ?? LeagueConfig.MinTier;

        var weekStart = LeagueConfig.WeekStartUtc(DateTime.UtcNow);
        var weekEnd = LeagueConfig.WeekEndUtc(weekStart);
        var tierDef = LeagueConfig.Tier(tier);

        var league = await _db.Leagues.AsNoTracking()
            .FirstOrDefaultAsync(l => l.Grade == user.Grade && l.Tier == tier && l.WeekStartUtc == weekStart, cancellationToken);

        var entries = league is null
            ? new List<LeagueEntryEntity>()
            : await _db.LeagueEntries.AsNoTracking()
                .Where(e => e.LeagueId == league.Id)
                .OrderByDescending(e => e.Points)
                .ThenBy(e => e.CreatedAtUtc)
                .ToListAsync(cancellationToken);

        var n = entries.Count;
        var (promoteCount, relegateCount) = Zones(n, tier);

        var rows = entries.Select((e, i) => new LeagueRankRow
        {
            Rank = i + 1,
            UserId = e.UserId,
            DisplayName = e.DisplayName,
            Points = e.Points,
            IsMe = e.UserId == userId,
            Zone = i < promoteCount ? "up" : i >= n - relegateCount ? "down" : "stay"
        }).ToList();

        var mine = rows.FirstOrDefault(r => r.IsMe);

        return new MyLeagueResponse
        {
            Grade = user.Grade,
            TierIndex = tier,
            TierId = tierDef.Id,
            TierName = tierDef.Name,
            WeekStartUtc = weekStart,
            WeekEndUtc = weekEnd,
            MyRank = mine?.Rank,
            MyPoints = mine?.Points ?? 0,
            ParticipantCount = n,
            PromoteCount = promoteCount,
            RelegateCount = relegateCount,
            Entries = rows
        };
    }

    public async Task SubmitSessionAsync(Guid userId, SubmitLeagueSessionRequest request, CancellationToken cancellationToken = default)
    {
        var points = LeagueScoring.SessionPoints(request.Correct, request.AvgSeconds);
        if (points <= 0)
        {
            return;
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        // Current tier, carried from previous weeks (default bronze).
        var standing = await _db.UserLeagueStandings.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        if (standing is null)
        {
            standing = new StandingEntity { UserId = userId, Tier = LeagueConfig.MinTier };
            _db.UserLeagueStandings.Add(standing);
        }

        var weekStart = LeagueConfig.WeekStartUtc(DateTime.UtcNow);
        var weekEnd = LeagueConfig.WeekEndUtc(weekStart);

        // The weekly league for this grade + tier is created the first time anyone
        // of that bracket practises — "every Monday a new league appears".
        var league = await _db.Leagues
            .FirstOrDefaultAsync(l => l.Grade == user.Grade && l.Tier == standing.Tier && l.WeekStartUtc == weekStart, cancellationToken);
        if (league is null)
        {
            league = new LeagueEntity
            {
                Grade = user.Grade,
                Tier = standing.Tier,
                WeekStartUtc = weekStart,
                WeekEndUtc = weekEnd,
                Closed = false
            };
            _db.Leagues.Add(league);
        }

        var entry = await _db.LeagueEntries
            .FirstOrDefaultAsync(e => e.LeagueId == league.Id && e.UserId == userId, cancellationToken);
        if (entry is null)
        {
            entry = new LeagueEntryEntity
            {
                LeagueId = league.Id,
                UserId = userId,
                DisplayName = user.DisplayName,
                Points = 0
            };
            _db.LeagueEntries.Add(entry);
        }

        entry.Points += points;
        entry.DisplayName = user.DisplayName;

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> CloseDueLeaguesAsync(DateTime nowUtc, CancellationToken cancellationToken = default)
    {
        var due = await _db.Leagues
            .Where(l => !l.Closed && l.WeekEndUtc <= nowUtc)
            .ToListAsync(cancellationToken);
        if (due.Count == 0)
        {
            return 0;
        }

        var standings = await _db.UserLeagueStandings.ToListAsync(cancellationToken);
        var standingByUser = standings.ToDictionary(s => s.UserId);

        foreach (var league in due)
        {
            var members = await _db.LeagueEntries
                .Where(e => e.LeagueId == league.Id)
                .Select(e => new LeagueClosing.Member(e.UserId, e.Points))
                .ToListAsync(cancellationToken);

            foreach (var move in LeagueClosing.Resolve(members, league.Tier))
            {
                if (standingByUser.TryGetValue(move.UserId, out var standing))
                {
                    standing.Tier = move.NewTier;
                }
                else
                {
                    var created = new StandingEntity { UserId = move.UserId, Tier = move.NewTier };
                    _db.UserLeagueStandings.Add(created);
                    standingByUser[move.UserId] = created;
                }
            }

            league.Closed = true;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return due.Count;
    }

    /// <summary>Promotion/relegation counts for a league of <paramref name="n"/> members at a tier.</summary>
    private static (int Promote, int Relegate) Zones(int n, int tier)
    {
        var promote = tier >= LeagueConfig.MaxTier ? 0 : n * LeagueConfig.PromotePercent / 100;
        var relegate = tier <= LeagueConfig.MinTier ? 0 : n * LeagueConfig.RelegatePercent / 100;
        if (promote + relegate > n)
        {
            relegate = Math.Max(0, n - promote);
        }
        return (promote, relegate);
    }
}
