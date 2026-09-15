using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mentiq.Application.Features.Practice;
using Mentiq.Application.Features.Practice.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

[ApiController]
[Route("api/practice")]
[Authorize]
public sealed class PracticeController : ControllerBase
{
    private readonly IPracticeService _practice;

    public PracticeController(IPracticeService practice)
    {
        _practice = practice;
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> SaveSession(SavePracticeSessionRequest request, CancellationToken cancellationToken)
    {
        await _practice.SaveSessionAsync(GetUserId(), request, cancellationToken);
        return NoContent();
    }

    [HttpGet("progress")]
    [ProducesResponseType(typeof(ProgressResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProgressResponse>> GetProgress(CancellationToken cancellationToken)
    {
        var progress = await _practice.GetProgressAsync(GetUserId(), cancellationToken);
        return Ok(progress);
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
