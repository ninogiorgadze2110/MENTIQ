using Mentiq.Application.Features.Achievements.Dtos;

namespace Mentiq.Application.Features.Achievements;

public interface IAchievementService
{
    /// <summary>
    /// Evaluates the user's achievements against their current stats, unlocks any
    /// newly earned ones, and returns the full catalog with unlock state.
    /// </summary>
    Task<AchievementsResponse> GetAndEvaluateAsync(Guid userId, CancellationToken cancellationToken = default);
}
