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

    /// <summary>Authorization role. "Student" (default) or "Administrator".</summary>
    public string Role { get; set; } = UserRoles.Student;

    /// <summary>UTC instant the 7-day free trial began (set at registration).</summary>
    public DateTime TrialStartUtc { get; set; } = DateTime.UtcNow;

    /// <summary>UTC instant the free trial ends. Access is validated against this on the backend.</summary>
    public DateTime TrialEndUtc { get; set; } = DateTime.UtcNow.AddDays(7);
}

/// <summary>Well-known authorization role names.</summary>
public static class UserRoles
{
    public const string Student = "Student";
    public const string Administrator = "Administrator";
}
