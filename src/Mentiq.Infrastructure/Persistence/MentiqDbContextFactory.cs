using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Mentiq.Infrastructure.Persistence;

/// <summary>
/// Design-time factory used by the EF Core tools (dotnet ef migrations add /
/// database update). It does not connect to a database when scaffolding a
/// migration; a connection string is only required for "database update".
/// The value can be overridden with the ConnectionStrings__DefaultConnection
/// environment variable so no real connection string is committed.
/// </summary>
public sealed class MentiqDbContextFactory : IDesignTimeDbContextFactory<MentiqDbContext>
{
    // private const string FallbackConnectionString =
    //     "Server=localhost;Database=MentiqDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true;Encrypt=False";

    private const string FallbackConnectionString =
        "Server=db68276.public.databaseasp.net; Database=db68276; User Id=db68276; Password=G%p32J!yTc9=; Encrypt=False; MultipleActiveResultSets=True;";
    public MentiqDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? FallbackConnectionString;

        var options = new DbContextOptionsBuilder<MentiqDbContext>()
            .UseSqlServer(connectionString, sql =>
                sql.MigrationsAssembly(typeof(MentiqDbContextFactory).Assembly.FullName))
            .Options;

        return new MentiqDbContext(options);
    }
}
