using Mentiq.Application.Features.League;

namespace Mentiq.Api.BackgroundJobs;

/// <summary>
/// Hourly background job that closes any weekly league whose week has ended,
/// applying promotions and relegations. Runs once on startup to catch up after
/// downtime, then every hour. The actual Monday-06:00 boundary lives in
/// <see cref="LeagueConfig"/>; this job only needs to fire often enough to notice.
/// </summary>
public sealed class LeagueCloserService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LeagueCloserService> _logger;

    public LeagueCloserService(IServiceScopeFactory scopeFactory, ILogger<LeagueCloserService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var leagues = scope.ServiceProvider.GetRequiredService<ILeagueService>();
                var closed = await leagues.CloseDueLeaguesAsync(DateTime.UtcNow, stoppingToken);
                if (closed > 0)
                {
                    _logger.LogInformation("Closed {Count} finished league week(s).", closed);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "League closing job failed; will retry next cycle.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
