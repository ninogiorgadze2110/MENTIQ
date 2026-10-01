using Mentiq.Api.Authorization;
using Mentiq.Application.Features.League;
using Mentiq.Application.Features.League.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>
/// Weekly competitive leagues: a per-grade, per-tier ladder that resets every
/// Monday with promotion/relegation. Points come from "ჩემი დონე" practice only.
/// </summary>
[ApiController]
[Route("api/leagues")]
[Authorize]
public sealed class LeagueController : ApiControllerBase
{
    private readonly ILeagueService _leagues;

    public LeagueController(ILeagueService leagues)
    {
        _leagues = leagues;
    }

    /// <summary>The current user's weekly league with standings and zones.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(MyLeagueResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<MyLeagueResponse>> Me(CancellationToken cancellationToken)
        => Ok(await _leagues.GetMyLeagueAsync(GetUserId(), cancellationToken));

    /// <summary>Add a level-mode practice session's points to the current week's league.</summary>
    [HttpPost("submit")]
    [RequireSubscription]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Submit(SubmitLeagueSessionRequest request, CancellationToken cancellationToken)
    {
        await _leagues.SubmitSessionAsync(GetUserId(), request, cancellationToken);
        return NoContent();
    }
}
