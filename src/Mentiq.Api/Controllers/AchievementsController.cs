using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mentiq.Application.Features.Achievements;
using Mentiq.Application.Features.Achievements.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

[ApiController]
[Route("api/achievements")]
[Authorize]
public sealed class AchievementsController : ControllerBase
{
    private readonly IAchievementService _achievements;

    public AchievementsController(IAchievementService achievements)
    {
        _achievements = achievements;
    }

    [HttpGet]
    [ProducesResponseType(typeof(AchievementsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AchievementsResponse>> Get(CancellationToken cancellationToken)
        => Ok(await _achievements.GetAndEvaluateAsync(GetUserId(), cancellationToken));

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
