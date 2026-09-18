using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Auth.Dtos;

public sealed record RegisterRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(128)]
    public string DisplayName { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; init; } = string.Empty;

    /// <summary>Experience segment: "preschool", "school" or "adult".</summary>
    [MaxLength(32)]
    public string? EducationLevel { get; init; }

    /// <summary>School grade / class: 0 for preschool/adult, 1–12 for school.</summary>
    [Range(0, 12)]
    public int Grade { get; init; } = 1;

    /// <summary>Optional age in years (preschool: 4–6).</summary>
    [Range(3, 120)]
    public int? Age { get; init; }
}

public sealed record LoginRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public sealed record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public int Grade { get; init; }

    /// <summary>Experience segment: "preschool", "school" or "adult".</summary>
    public string EducationLevel { get; init; } = "school";

    public int? Age { get; init; }

    /// <summary>Authorization role: "Student" or "Administrator".</summary>
    public string Role { get; init; } = "Student";
}

public sealed record AuthResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
    public UserDto User { get; init; } = new();
}
