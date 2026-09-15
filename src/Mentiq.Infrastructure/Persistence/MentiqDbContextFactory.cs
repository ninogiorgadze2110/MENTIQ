using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Mentiq.Infrastructure.Persistence;

/// <summary>
/// Design-time factory used by the EF Core tools (dotnet ef migrations add /
/// database update).
///
/// It resolves the connection string the same way the running app does, based
/// on the environment:
///   • no ASPNETCORE_ENVIRONMENT (or "Development")  → appsettings.Development.json (local DB)
///   • ASPNETCORE_ENVIRONMENT=Production             → appsettings.json (production DB)
/// A ConnectionStrings__DefaultConnection environment variable overrides both.
/// So running "dotnet ef ..." locally hits the local database automatically,
/// and only targets production when you explicitly ask for it.
/// </summary>
public sealed class MentiqDbContextFactory : IDesignTimeDbContextFactory<MentiqDbContext>
{
    private const string LocalFallbackConnectionString =
        "Server=localhost;Database=MentiqDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true;Encrypt=False";

    public MentiqDbContext CreateDbContext(string[] args)
    {
        var environment =
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        // Explicit env var wins; otherwise the environment-specific appsettings;
        // if nothing resolved (e.g. run from a folder without the json files),
        // fall back to the local database so dev commands never touch production.
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = LocalFallbackConnectionString;
        }

        var options = new DbContextOptionsBuilder<MentiqDbContext>()
            .UseSqlServer(connectionString, sql =>
                sql.MigrationsAssembly(typeof(MentiqDbContextFactory).Assembly.FullName))
            .Options;

        return new MentiqDbContext(options);
    }
}
