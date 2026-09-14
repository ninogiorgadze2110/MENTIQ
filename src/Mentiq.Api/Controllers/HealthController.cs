using Mentiq.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    /// <summary>
    /// Lightweight liveness probe. Returns a simple healthy status and never
    /// exposes configuration, secrets or connection strings.
    /// </summary>
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "healthy" });

    /// <summary>
    /// Optional readiness probe that reports database connectivity only as a
    /// boolean. No connection details are ever returned.
    /// </summary>
    [HttpGet("ready")]
    public async Task<IActionResult> Ready(
        [FromServices] IApplicationDbContext db, CancellationToken cancellationToken)
    {
        bool databaseReachable;
        try
        {
            databaseReachable = await db.CanConnectAsync(cancellationToken);
        }
        catch
        {
            databaseReachable = false;
        }

        var status = databaseReachable ? "healthy" : "degraded";
        return Ok(new { status, database = databaseReachable ? "up" : "down" });
    }
}
