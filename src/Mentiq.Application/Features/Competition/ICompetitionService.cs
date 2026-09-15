using Mentiq.Application.Features.Competition.Dtos;

namespace Mentiq.Application.Features.Competition;

public interface ICompetitionService
{
    /// <summary>All-time leaderboard for the current user's grade (practice points).</summary>
    Task<LeaderboardResponse> GetLeaderboardAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<CompetitionDto> CreateAsync(Guid userId, CreateCompetitionRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CompetitionDto>> GetListAsync(Guid userId, CancellationToken cancellationToken = default);

    Task SubmitAsync(Guid userId, Guid competitionId, SubmitEntryRequest request, CancellationToken cancellationToken = default);

    Task<CompetitionDetailDto> GetDetailAsync(Guid userId, Guid competitionId, CancellationToken cancellationToken = default);
}
