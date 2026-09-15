using Mentiq.Api.Authorization;
using Mentiq.Application.Features.Practice;
using Mentiq.Application.Features.Practice.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

[ApiController]
[Route("api/practice")]
[Authorize]
public sealed class PracticeController : ApiControllerBase
{
    private readonly IPracticeService _practice;

    public PracticeController(IPracticeService practice)
    {
        _practice = practice;
    }

    // Recording a completed practice session is premium functionality: it
    // requires an active trial or paid subscription, enforced server-side.
    [HttpPost("sessions")]
    [RequireSubscription]
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
}
