using Mentiq.Api.Authorization;
using Mentiq.Application.Features.Progression;
using Mentiq.Application.Features.Progression.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>Belt progression: current belts, unlocks and mastery per skill.</summary>
[ApiController]
[Route("api/progression")]
[Authorize]
public sealed class ProgressionController : ApiControllerBase
{
    private readonly IProgressionService _progression;

    public ProgressionController(IProgressionService progression)
    {
        _progression = progression;
    }

    /// <summary>The user's belts, unlocks and mastery, plus the belt config.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(BeltProgressResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<BeltProgressResponse>> Get(CancellationToken cancellationToken)
        => Ok(await _progression.GetAsync(GetUserId(), cancellationToken));

    /// <summary>Record a batch of answers for one skill; progress updates server-side.</summary>
    [HttpPost("answers")]
    [RequireSubscription]
    [ProducesResponseType(typeof(BeltProgressResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<BeltProgressResponse>> RecordAnswers(
        RecordAnswersRequest request, CancellationToken cancellationToken)
        => Ok(await _progression.RecordAnswersAsync(GetUserId(), request, cancellationToken));
}
