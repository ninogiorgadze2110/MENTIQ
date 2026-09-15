using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>Records that a user has unlocked a specific achievement.</summary>
public class UserAchievement : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Stable achievement code from the catalog (e.g. "streak_7").</summary>
    public string Code { get; set; } = string.Empty;

    public DateTime UnlockedAtUtc { get; set; } = DateTime.UtcNow;
}
