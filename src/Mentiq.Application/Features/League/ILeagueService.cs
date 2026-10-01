using Mentiq.Application.Features.League.Dtos;

namespace Mentiq.Application.Features.League;

/// <summary>Weekly, per-grade competitive leagues with promotion/relegation.</summary>
public interface ILeagueService
{
    /// <summary>The signed-in user's current weekly league (standings, rank, zones).</summary>
    Task<MyLeagueResponse> GetMyLeagueAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>Add a level-mode session's points to the user's current-week league.</summary>
    Task SubmitSessionAsync(Guid userId, SubmitLeagueSessionRequest request, CancellationToken cancellationToken = default);

    /// <summary>Resolve (promote/relegate) every league whose week has ended. Returns how many were closed.</summary>
    Task<int> CloseDueLeaguesAsync(DateTime nowUtc, CancellationToken cancellationToken = default);
}
