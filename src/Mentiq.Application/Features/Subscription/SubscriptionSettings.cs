namespace Mentiq.Application.Features.Subscription;

/// <summary>
/// Subscription configuration bound from the "Subscription" section of app
/// settings. Prices and plans are configuration-driven and never hardcoded in
/// the application code, so they can change without a redeploy of logic.
/// </summary>
public sealed class SubscriptionSettings
{
    public const string SectionName = "Subscription";

    /// <summary>Length of the free trial granted at registration.</summary>
    public int TrialDays { get; set; } = 7;

    /// <summary>Manual-payment instructions shown on the pricing page.</summary>
    public string PaymentInstructions { get; set; } =
        "Payment is currently handled manually. After your payment is confirmed, your MENTIQ subscription will be activated.";

    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;

    public List<SubscriptionPlanOption> Plans { get; set; } = new();
}

/// <summary>A purchasable plan definition (config-driven).</summary>
public sealed class SubscriptionPlanOption
{
    /// <summary>Stable plan code stored on subscriptions, e.g. "monthly".</summary>
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    /// <summary>Optional pre-discount "compare at" price, shown struck through for a sale.</summary>
    public decimal? OldPrice { get; set; }

    public string Currency { get; set; } = "GEL";

    /// <summary>Billing period label, e.g. "month" or "year".</summary>
    public string Period { get; set; } = "month";

    /// <summary>How many days an activation of this plan grants by default.</summary>
    public int DurationDays { get; set; } = 30;

    public string? Description { get; set; }

    /// <summary>
    /// Which audiences this plan is offered to: "kids", "school", "adult".
    /// Empty (or containing "all") means everyone. Lets kids and adults have
    /// their own plans while sharing the same subscription machinery.
    /// </summary>
    public List<string> Audiences { get; set; } = new();
}
