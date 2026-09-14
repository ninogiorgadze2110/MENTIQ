using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the persistence context so application use cases do not
/// depend on the concrete EF Core DbContext in the Infrastructure project.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns whether the underlying database is reachable.</summary>
    Task<bool> CanConnectAsync(CancellationToken cancellationToken = default);
}
