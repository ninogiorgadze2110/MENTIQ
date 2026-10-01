using Mentiq.Application.Features.Parent.Dtos;

namespace Mentiq.Application.Features.Parent;

/// <summary>Plain-language weekly summaries of a child's progress, for parents.</summary>
public interface IParentService
{
    Task<ParentSummaryDto> GetWeeklySummaryAsync(Guid userId, CancellationToken cancellationToken = default);
}
