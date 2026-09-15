using Mentiq.Application.Features.Subscription;
using Mentiq.Application.Features.Subscription.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>
/// Manual subscription management for administrators. Every endpoint requires
/// the Administrator role; a non-admin token receives 403 Forbidden.
/// </summary>
[ApiController]
[Route("api/admin/subscriptions")]
[Authorize(Roles = UserRoles.Administrator)]
public sealed class AdminSubscriptionController : ApiControllerBase
{
    private readonly ISubscriptionService _subscriptions;

    public AdminSubscriptionController(ISubscriptionService subscriptions)
    {
        _subscriptions = subscriptions;
    }

    /// <summary>List users with their current subscription state (optional search).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(AdminSubscriptionListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminSubscriptionListResponse>> List(
        [FromQuery] string? q, CancellationToken cancellationToken)
        => Ok(await _subscriptions.ListAsync(q, cancellationToken));

    /// <summary>Full subscription detail + history for one user.</summary>
    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(AdminSubscriptionDetail), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminSubscriptionDetail>> Get(
        Guid userId, CancellationToken cancellationToken)
        => Ok(await _subscriptions.GetForUserAsync(userId, cancellationToken));

    /// <summary>Activate (or replace) a paid subscription after confirming manual payment.</summary>
    [HttpPost("{userId:guid}/activate")]
    [ProducesResponseType(typeof(AdminSubscriptionDetail), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminSubscriptionDetail>> Activate(
        Guid userId, ActivateSubscriptionRequest request, CancellationToken cancellationToken)
        => Ok(await _subscriptions.ActivateAsync(userId, GetUserId(), request, cancellationToken));

    /// <summary>Extend an existing subscription's end date.</summary>
    [HttpPost("{userId:guid}/extend")]
    [ProducesResponseType(typeof(AdminSubscriptionDetail), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminSubscriptionDetail>> Extend(
        Guid userId, ExtendSubscriptionRequest request, CancellationToken cancellationToken)
        => Ok(await _subscriptions.ExtendAsync(userId, GetUserId(), request, cancellationToken));

    /// <summary>Cancel/deactivate a subscription immediately.</summary>
    [HttpPost("{userId:guid}/cancel")]
    [ProducesResponseType(typeof(AdminSubscriptionDetail), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminSubscriptionDetail>> Cancel(
        Guid userId, CancelSubscriptionRequest request, CancellationToken cancellationToken)
        => Ok(await _subscriptions.CancelAsync(userId, GetUserId(), request, cancellationToken));
}
