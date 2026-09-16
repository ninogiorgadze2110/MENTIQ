using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>Shared helpers for authenticated API controllers.</summary>
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Resolves the authenticated user's id from the JWT.</summary>
    protected Guid GetUserId()
        => TryGetUserId() ?? throw new UnauthorizedAccessException("The token does not contain a valid user id.");

    /// <summary>Resolves the user's id if present (for endpoints that allow anonymous access).</summary>
    protected Guid? TryGetUserId()
    {
        var raw =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(raw, out var id) ? id : null;
    }
}
