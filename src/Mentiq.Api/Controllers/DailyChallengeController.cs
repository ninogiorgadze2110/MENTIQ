using Mentiq.Api.Authorization;
using Mentiq.Application.Features.DailyChallenge;
using Mentiq.Application.Features.DailyChallenge.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>
/// The Daily Challenge: a 1-minute mixed drill for the user's grade that rolls
/// over at 06:00 Tbilisi time, with a per-grade daily leaderboard.
/// </summary>
[ApiController]
[Route("api/daily-challenge")]
[Authorize]
public sealed class DailyChallengeController : ApiControllerBase
{
    private readonly IDailyChallengeService _daily;

    public DailyChallengeController(IDailyChallengeService daily)
    {
        _daily = daily;
    }

    /// <summary>Today's challenge state for the current user (with their rank if played).</summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(DailyChallengeDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DailyChallengeDto>> Today(CancellationToken cancellationToken)
        => Ok(await _daily.GetTodayAsync(GetUserId(), cancellationToken));

    /// <summary>Submit a completed attempt (keeps the best score of the day).</summary>
    [HttpPost("submit")]
    [RequireSubscription]
    [ProducesResponseType(typeof(DailyChallengeDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DailyChallengeDto>> Submit(
        SubmitDailyChallengeRequest request, CancellationToken cancellationToken)
        => Ok(await _daily.SubmitAsync(GetUserId(), request, cancellationToken));

    /// <summary>Today's leaderboard for the current user's grade.</summary>
    [HttpGet("leaderboard")]
    [ProducesResponseType(typeof(DailyChallengeLeaderboardResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<DailyChallengeLeaderboardResponse>> Leaderboard(CancellationToken cancellationToken)
        => Ok(await _daily.GetLeaderboardAsync(GetUserId(), cancellationToken));
}
