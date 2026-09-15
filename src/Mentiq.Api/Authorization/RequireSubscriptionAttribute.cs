using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mentiq.Api.Common;
using Mentiq.Application.Features.Subscription;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Mentiq.Api.Authorization;

/// <summary>
/// Server-side subscription gate. Applied to premium endpoints, it re-evaluates
/// access against the database on every request, so a user can never bypass the
/// paywall by tampering with client state, tokens' non-signed claims, or by
/// calling the API directly. Must be combined with [Authorize] (authentication).
/// </summary>
public sealed class RequireSubscriptionAttribute : TypeFilterAttribute
{
    public RequireSubscriptionAttribute() : base(typeof(SubscriptionGate))
    {
    }

    private sealed class SubscriptionGate : IAsyncActionFilter
    {
        private readonly ISubscriptionService _subscriptions;

        public SubscriptionGate(ISubscriptionService subscriptions)
        {
            _subscriptions = subscriptions;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var raw =
                context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? context.HttpContext.User.FindFirstValue("sub");

            if (!Guid.TryParse(raw, out var userId))
            {
                context.Result = Error(StatusCodes.Status401Unauthorized, "Authentication is required.");
                return;
            }

            var hasAccess = await _subscriptions.HasActiveAccessAsync(userId, context.HttpContext.RequestAborted);
            if (!hasAccess)
            {
                context.Result = Error(
                    StatusCodes.Status403Forbidden,
                    "Your MENTIQ access is inactive. Choose a plan to continue.");
                return;
            }

            await next();
        }

        private static ObjectResult Error(int status, string message) => new(new ApiError
        {
            Status = status,
            Message = message
        })
        {
            StatusCode = status
        };
    }
}
