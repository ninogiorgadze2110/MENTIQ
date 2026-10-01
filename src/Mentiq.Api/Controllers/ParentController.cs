using Mentiq.Application.Features.Parent;
using Mentiq.Application.Features.Parent.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>Parent-facing, plain-language weekly summary of the child's progress.</summary>
[ApiController]
[Route("api/parent")]
[Authorize]
public sealed class ParentController : ApiControllerBase
{
    private readonly IParentService _parent;

    public ParentController(IParentService parent)
    {
        _parent = parent;
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ParentSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ParentSummaryDto>> Summary(CancellationToken cancellationToken)
        => Ok(await _parent.GetWeeklySummaryAsync(GetUserId(), cancellationToken));
}
