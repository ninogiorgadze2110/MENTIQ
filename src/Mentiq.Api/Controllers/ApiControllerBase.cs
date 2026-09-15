using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>Shared helpers for authenticated API controllers.</summary>
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Resolves the authenticated user's id from the JWT.</summary>
    protected Guid GetUserId()
    {
        var raw =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(raw, out var id)
            ? id
            : throw new UnauthorizedAccessException("The token does not contain a valid user id.");
    }
}
