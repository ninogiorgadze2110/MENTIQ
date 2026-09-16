using Mentiq.Application.Features.Subscription;
using Mentiq.Application.Features.Subscription.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>
/// Self-service subscription endpoints for the signed-in user. The status is
/// always computed on the backend from persisted UTC dates.
/// </summary>
[ApiController]
[Route("api/subscription")]
[Authorize]
public sealed class SubscriptionController : ApiControllerBase
{
    private readonly ISubscriptionService _subscriptions;

    public SubscriptionController(ISubscriptionService subscriptions)
    {
        _subscriptions = subscriptions;
    }

    /// <summary>Effective access snapshot: status, trial/subscription dates, days remaining.</summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(SubscriptionStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubscriptionStatusDto>> GetStatus(CancellationToken cancellationToken)
        => Ok(await _subscriptions.GetStatusAsync(GetUserId(), cancellationToken));

    /// <summary>The user's current subscription record.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(SubscriptionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubscriptionDto>> GetCurrent(CancellationToken cancellationToken)
        => Ok(await _subscriptions.GetCurrentAsync(GetUserId(), cancellationToken));

      // {
      //   "Code": "yearly",
      //   "Name": "წლიური",
      //   "Price": 118,
      //   "Currency": "₾",
      //   "Period": "year",
      //   "DurationDays": 365,
      //   "Description": "სრული წვდომა ერთი წლით — 30%-იანი დაზოგვა."
      // }
    /// <summary>Configured plans and manual-payment instructions for the pricing page.</summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PlansResponse), StatusCodes.Status200OK)]
    public ActionResult<PlansResponse> GetPlans()
        => Ok(_subscriptions.GetPlans());
}
