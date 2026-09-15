using Mentiq.Application.Features.Subscription.Dtos;

namespace Mentiq.Application.Features.Subscription;

/// <summary>
/// Central authority for trial and paid-subscription access. Every access
/// decision is evaluated here against UTC dates persisted in the database; no
/// client-supplied state is ever trusted.
/// </summary>
public interface ISubscriptionService
{
    // ---- Self / access ----

    Task<SubscriptionStatusDto> GetStatusAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<SubscriptionDto> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>The single source of truth used by API guards to gate premium endpoints.</summary>
    Task<bool> HasActiveAccessAsync(Guid userId, CancellationToken cancellationToken = default);

    PlansResponse GetPlans();

    // ---- Admin ----

    Task<AdminSubscriptionListResponse> ListAsync(string? query, CancellationToken cancellationToken = default);

    Task<AdminSubscriptionDetail> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<AdminSubscriptionDetail> ActivateAsync(Guid userId, Guid adminId, ActivateSubscriptionRequest request, CancellationToken cancellationToken = default);

    Task<AdminSubscriptionDetail> ExtendAsync(Guid userId, Guid adminId, ExtendSubscriptionRequest request, CancellationToken cancellationToken = default);

    Task<AdminSubscriptionDetail> CancelAsync(Guid userId, Guid adminId, CancelSubscriptionRequest request, CancellationToken cancellationToken = default);
}
