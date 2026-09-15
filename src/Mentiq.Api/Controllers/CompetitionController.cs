using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mentiq.Application.Features.Competition;
using Mentiq.Application.Features.Competition.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

[ApiController]
[Route("api/competition")]
[Authorize]
public sealed class CompetitionController : ControllerBase
{
    private readonly ICompetitionService _competition;

    public CompetitionController(ICompetitionService competition)
    {
        _competition = competition;
    }

    /// <summary>All-time leaderboard for the current user's grade (practice points).</summary>
    [HttpGet("leaderboard")]
    [ProducesResponseType(typeof(LeaderboardResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<LeaderboardResponse>> GetLeaderboard(CancellationToken cancellationToken)
        => Ok(await _competition.GetLeaderboardAsync(GetUserId(), cancellationToken));

    /// <summary>Time-boxed competitions for the current user's grade.</summary>
    [HttpGet("list")]
    [ProducesResponseType(typeof(IReadOnlyList<CompetitionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CompetitionDto>>> List(CancellationToken cancellationToken)
        => Ok(await _competition.GetListAsync(GetUserId(), cancellationToken));

    [HttpPost]
    [ProducesResponseType(typeof(CompetitionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CompetitionDto>> Create(CreateCompetitionRequest request, CancellationToken cancellationToken)
        => Ok(await _competition.CreateAsync(GetUserId(), request, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CompetitionDetailDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CompetitionDetailDto>> Detail(Guid id, CancellationToken cancellationToken)
        => Ok(await _competition.GetDetailAsync(GetUserId(), id, cancellationToken));

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, SubmitEntryRequest request, CancellationToken cancellationToken)
    {
        await _competition.SubmitAsync(GetUserId(), id, request, cancellationToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var raw =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(raw, out var id)
            ? id
            : throw new UnauthorizedAccessException("The token does not contain a valid user id.");
    }
}
