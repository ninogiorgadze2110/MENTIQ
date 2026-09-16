using Mentiq.Application.Features.DailyChallenge.Dtos;

namespace Mentiq.Application.Features.DailyChallenge;

/// <summary>
/// The Daily Challenge: a 1-minute mixed-difficulty drill for the user's grade
/// that rolls over every morning at 06:00 Tbilisi time. Results form a per-grade,
/// per-day leaderboard.
/// </summary>
public interface IDailyChallengeService
{
    Task<DailyChallengeDto> GetTodayAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<DailyChallengeDto> SubmitAsync(Guid userId, SubmitDailyChallengeRequest request, CancellationToken cancellationToken = default);

    Task<DailyChallengeLeaderboardResponse> GetLeaderboardAsync(Guid userId, CancellationToken cancellationToken = default);
}
