using System.IdentityModel.Tokens.Jwt;
using Mentiq.Domain.Entities;
using Mentiq.Infrastructure.Authentication;
using Microsoft.Extensions.Options;

namespace Mentiq.UnitTests.Authentication;

public class JwtTokenGeneratorTests
{
    private static JwtTokenGenerator CreateGenerator(int expiryMinutes = 60)
    {
        var settings = new JwtSettings
        {
            Secret = "unit-test-signing-secret-that-is-long-enough-256bits!!",
            Issuer = "Mentiq",
            Audience = "Mentiq",
            AccessTokenExpiryMinutes = expiryMinutes
        };

        return new JwtTokenGenerator(Options.Create(settings));
    }

    [Fact]
    public void GenerateToken_ReturnsReadableJwt_WithExpectedClaims()
    {
        var user = new User { Email = "user@mentiq.com", DisplayName = "Test User" };

        var (token, expiresAtUtc) = CreateGenerator().GenerateToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expiresAtUtc > DateTime.UtcNow);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal("Mentiq", jwt.Issuer);
        Assert.Contains(jwt.Claims, c => c.Type == "email" && c.Value == "user@mentiq.com");
        Assert.Contains(jwt.Claims, c => c.Type == "sub" && c.Value == user.Id.ToString());
    }
}
