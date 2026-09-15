using Mentiq.Application.Features.Practice.Dtos;

namespace Mentiq.Application.Features.Practice;

public interface IPracticeService
{
    Task SaveSessionAsync(Guid userId, SavePracticeSessionRequest request, CancellationToken cancellationToken = default);

    Task<ProgressResponse> GetProgressAsync(Guid userId, CancellationToken cancellationToken = default);
}
