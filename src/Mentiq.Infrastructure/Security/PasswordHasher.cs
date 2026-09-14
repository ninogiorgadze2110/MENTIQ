using Mentiq.Application.Common.Interfaces;
using Mentiq.Domain.Entities;
using AspNetIdentity = Microsoft.AspNetCore.Identity;

namespace Mentiq.Infrastructure.Security;

/// <summary>
/// Password hashing backed by the ASP.NET Core Identity PBKDF2 hasher.
/// </summary>
public sealed class PasswordHasher : IPasswordHasher
{
    private readonly AspNetIdentity.PasswordHasher<User> _hasher = new();

    public string Hash(string password)
        => _hasher.HashPassword(new User(), password);

    public bool Verify(string hash, string password)
    {
        var result = _hasher.VerifyHashedPassword(new User(), hash, password);
        return result is AspNetIdentity.PasswordVerificationResult.Success
            or AspNetIdentity.PasswordVerificationResult.SuccessRehashNeeded;
    }
}
