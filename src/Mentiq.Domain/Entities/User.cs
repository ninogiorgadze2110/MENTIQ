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

    /// <summary>School grade / class. 0 for preschool and adult; 1–12 for school.</summary>
    public int Grade { get; set; } = 1;

    /// <summary>
    /// Which MENTIQ experience the user belongs to: "preschool" (0 კლასი, ~4–6y),
    /// "school" (1–12 კლასი) or "adult" (ზრდასრული). This — not Grade alone —
    /// decides the experience, so new levels can be added without restructuring.
    /// </summary>
    public string EducationLevel { get; set; } = EducationLevels.School;

    /// <summary>Optional age in years (used for preschool: 4–6).</summary>
    public int? Age { get; set; }

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

/// <summary>
/// MENTIQ experience segments. Kept as strings so more can be added later
/// without a schema change.
/// </summary>
public static class EducationLevels
{
    /// <summary>0 კლასი — preschool / kindergarten (~4–6 years).</summary>
    public const string Preschool = "preschool";

    /// <summary>1–12 კლასი — school grades.</summary>
    public const string School = "school";

    /// <summary>ზრდასრული — adult.</summary>
    public const string Adult = "adult";

    public static bool IsValid(string? value) =>
        value is Preschool or School or Adult;
}
