using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Subscription.Dtos;

/// <summary>
/// The effective access snapshot for a user. Computed entirely on the backend
/// from UTC dates in the database — the client must never derive access itself.
/// </summary>
public sealed record SubscriptionStatusDto
{
    /// <summary>"Trial", "Active", "Expired" or "Cancelled".</summary>
    public string Status { get; init; } = "Expired";

    public bool HasAccess { get; init; }
    public bool IsTrial { get; init; }

    public DateTime TrialStartDate { get; init; }
    public DateTime TrialEndDate { get; init; }

    public DateTime? SubscriptionStartDate { get; init; }
    public DateTime? SubscriptionEndDate { get; init; }

    public string? Plan { get; init; }

    /// <summary>Whole days remaining on whichever window currently grants access.</summary>
    public int DaysRemaining { get; init; }

    /// <summary>Access-granting expiry (paid end when active, else trial end). Null when no access.</summary>
    public DateTime? AccessEndsUtc { get; init; }

    /// <summary>True when the platform is in admin-enabled beta free-access mode.</summary>
    public bool BetaFreeAccess { get; init; }
}

/// <summary>The platform-wide beta free-access switch (admin toggle).</summary>
public sealed record BetaAccessDto
{
    public bool Enabled { get; init; }
}

/// <summary>Full current-subscription detail for a user (admin + self views).</summary>
public sealed record SubscriptionDto
{
    public Guid UserId { get; init; }
    public string? Plan { get; init; }
    public string Status { get; init; } = "Expired";
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Provider { get; init; }
    public Guid? ActivatedByAdminId { get; init; }
    public string? Notes { get; init; }
    public DateTime TrialStartDate { get; init; }
    public DateTime TrialEndDate { get; init; }
}

/// <summary>A configured, purchasable plan returned to the pricing page.</summary>
public sealed record PlanDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? OldPrice { get; init; }
    public string Currency { get; init; } = "GEL";
    public string Period { get; init; } = "month";
    public int DurationDays { get; init; }
    public string? Description { get; init; }

    /// <summary>Audiences this plan targets ("kids"/"school"/"adult"); empty = everyone.</summary>
    public IReadOnlyList<string> Audiences { get; init; } = Array.Empty<string>();
}

/// <summary>Plans + manual-payment instructions for the pricing page.</summary>
public sealed record PlansResponse
{
    public IReadOnlyList<PlanDto> Plans { get; init; } = Array.Empty<PlanDto>();
    public string PaymentInstructions { get; init; } = string.Empty;
    public string ContactEmail { get; init; } = string.Empty;
    public string ContactPhone { get; init; } = string.Empty;
    public bool ManualPayment { get; init; } = true;
}

// ---- Admin views ----

/// <summary>One row in the admin subscription list.</summary>
public sealed record AdminSubscriptionRow
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string Status { get; init; } = "Expired";
    public bool HasAccess { get; init; }
    public DateTime TrialEndDate { get; init; }
    public string? Plan { get; init; }
    public DateTime? SubscriptionStartDate { get; init; }
    public DateTime? SubscriptionEndDate { get; init; }
}

public sealed record AdminSubscriptionListResponse
{
    public IReadOnlyList<AdminSubscriptionRow> Items { get; init; } = Array.Empty<AdminSubscriptionRow>();
    public int Total { get; init; }
}

public sealed record SubscriptionHistoryDto
{
    public string Action { get; init; } = string.Empty;
    public string Plan { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Provider { get; init; } = "Manual";
    public Guid? ActivatedBy { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}

/// <summary>Full admin detail for one user's subscription, including history.</summary>
public sealed record AdminSubscriptionDetail
{
    public SubscriptionDto Current { get; init; } = new();
    public SubscriptionStatusDto Status { get; init; } = new();
    public string Email { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public IReadOnlyList<SubscriptionHistoryDto> History { get; init; } = Array.Empty<SubscriptionHistoryDto>();
}

// ---- Admin commands ----

public sealed record ActivateSubscriptionRequest
{
    [Required, MaxLength(64)]
    public string Plan { get; init; } = string.Empty;

    [Required]
    public DateTime StartDate { get; init; }

    [Required]
    public DateTime EndDate { get; init; }

    [MaxLength(32)]
    public string Provider { get; init; } = "Manual";

    [MaxLength(1024)]
    public string? Notes { get; init; }
}

public sealed record ExtendSubscriptionRequest
{
    /// <summary>New absolute end date (UTC). Takes priority over <see cref="AddDays"/> when set.</summary>
    public DateTime? EndDate { get; init; }

    /// <summary>Alternatively, extend the current end by this many days.</summary>
    public int? AddDays { get; init; }

    [MaxLength(1024)]
    public string? Notes { get; init; }
}

public sealed record CancelSubscriptionRequest
{
    [MaxLength(1024)]
    public string? Notes { get; init; }
}
