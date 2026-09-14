using Mentiq.Domain.Entities;

namespace Mentiq.Application.Common.Interfaces;

/// <summary>Issues signed JWT access tokens for authenticated users.</summary>
public interface IJwtTokenGenerator
{
    /// <summary>Creates a signed JWT and returns the token plus its UTC expiry.</summary>
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user);
}
