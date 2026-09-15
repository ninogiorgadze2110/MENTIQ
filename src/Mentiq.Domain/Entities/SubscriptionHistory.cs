using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// Append-only audit log of every subscription change. Rows are never updated
/// or deleted, so the full history of who activated/extended/cancelled a
/// subscription (and with which plan and dates) is always recoverable.
/// </summary>
public class SubscriptionHistory : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>What happened: "Activate", "Extend", "Cancel", "Trial".</summary>
    public string Action { get; set; } = string.Empty;

    public string Plan { get; set; } = string.Empty;

    public SubscriptionStatus Status { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string Provider { get; set; } = "Manual";

    /// <summary>The admin who performed the action (null for automated/self events).</summary>
    public Guid? ActivatedBy { get; set; }

    public string? Notes { get; set; }
}
