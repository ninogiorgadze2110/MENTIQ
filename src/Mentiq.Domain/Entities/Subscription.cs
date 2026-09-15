using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// Lifecycle state of a paid subscription record. The <see cref="Trial"/> state
/// is never stored on a <see cref="Subscription"/> row itself — it is derived
/// from the user's trial dates. Effective access is always evaluated on the
/// backend (see the subscription service), never trusted from the client.
/// </summary>
public enum SubscriptionStatus
{
    /// <summary>Free trial window (derived from the user's trial dates).</summary>
    Trial = 0,

    /// <summary>A paid subscription that currently grants access.</summary>
    Active = 1,

    /// <summary>Trial ended and no active paid subscription exists.</summary>
    Expired = 2,

    /// <summary>A paid subscription that was cancelled/deactivated by an admin.</summary>
    Cancelled = 3
}

/// <summary>
/// A user's current paid subscription (one row per user). This record is
/// upserted by manual admin activation for the MVP; the <see cref="Provider"/>
/// and provider-id fields keep the model ready for an automated payment gateway
/// later without any schema change. Every change is also appended to
/// <see cref="SubscriptionHistory"/> so nothing is ever lost.
/// </summary>
public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Plan code (e.g. "monthly", "yearly"). Prices live in configuration.</summary>
    public string Plan { get; set; } = string.Empty;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>Payment provider. "Manual" for the MVP; later "TBC", "BOG", "Stripe", etc.</summary>
    public string Provider { get; set; } = "Manual";

    /// <summary>Opaque customer id from the payment provider (unused for Manual).</summary>
    public string? ProviderCustomerId { get; set; }

    /// <summary>Opaque subscription id from the payment provider (unused for Manual).</summary>
    public string? ProviderSubscriptionId { get; set; }

    /// <summary>The admin who last activated/changed this subscription (null for automated).</summary>
    public Guid? ActivatedByAdminId { get; set; }

    public string? Notes { get; set; }
}
