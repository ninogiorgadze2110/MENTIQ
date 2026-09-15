using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// An application user who can authenticate against the API.
/// </summary>
public class User : BaseEntity
{
    /// <summary>Unique login identifier / email address.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Display name shown in the UI.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Hashed password. The plain-text password is never stored.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime? LastLoginAtUtc { get; set; }

    public bool? IsDeleted { get; set; } = false;

    /// <summary>School grade / class, 1–12.</summary>
    public int Grade { get; set; } = 1;
}
