namespace Mentiq.Infrastructure.Authentication;

/// <summary>
/// Strongly-typed JWT configuration bound from the "Jwt" configuration
/// section. The signing secret is supplied through configuration/secrets
/// and is never committed to source control.
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = string.Empty;

    public string Issuer { get; set; } = "Mentiq";

    public string Audience { get; set; } = "Mentiq";

    public int AccessTokenExpiryMinutes { get; set; } = 60;
}
