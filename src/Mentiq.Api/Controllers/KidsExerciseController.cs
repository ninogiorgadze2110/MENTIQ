using Mentiq.Api.Authorization;
using Mentiq.Application.Features.Kids;
using Mentiq.Application.Features.Kids.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>
/// MENTIQ Kids exercise engine. One generation endpoint and one submit endpoint
/// serve every exercise type; answers are graded server-side.
/// </summary>
[ApiController]
[Route("api/kids/exercises")]
[Authorize]
public sealed class KidsExerciseController : ApiControllerBase
{
    private readonly IKidsExerciseService _exercises;

    public KidsExerciseController(IKidsExerciseService exercises)
    {
        _exercises = exercises;
    }

    /// <summary>Next exercise for a world, adapted to the child's level.</summary>
    [HttpGet("next")]
    [RequireSubscription]
    [ProducesResponseType(typeof(ExerciseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ExerciseDto>> Next([FromQuery] string? world, CancellationToken cancellationToken)
        => Ok(await _exercises.NextAsync(GetUserId(), world, cancellationToken));

    /// <summary>Grade an answer (server-side), store the attempt and update progress.</summary>
    [HttpPost("submit")]
    [RequireSubscription]
    [ProducesResponseType(typeof(SubmitExerciseResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubmitExerciseResult>> Submit(
        SubmitExerciseRequest request, CancellationToken cancellationToken)
        => Ok(await _exercises.SubmitAsync(GetUserId(), request, cancellationToken));
}

/// <summary>Kids progress (skill levels/accuracy) — used by the child summary and parent dashboard.</summary>
[ApiController]
[Route("api/kids/progress")]
[Authorize]
public sealed class KidsProgressController : ApiControllerBase
{
    private readonly IKidsExerciseService _exercises;

    public KidsProgressController(IKidsExerciseService exercises)
    {
        _exercises = exercises;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SkillProgressDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SkillProgressDto>>> Get(CancellationToken cancellationToken)
        => Ok(await _exercises.GetProgressAsync(GetUserId(), cancellationToken));
}
