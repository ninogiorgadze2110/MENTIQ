using Mentiq.Application.Features.Progression.Dtos;

namespace Mentiq.Application.Features.Progression;

/// <summary>Belt progression: current belts, unlocks and mastery per skill.</summary>
public interface IProgressionService
{
    Task<BeltProgressResponse> GetAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>Record a batch of answers for one skill and update progress
    /// (at most one belt per call). Returns the refreshed snapshot.</summary>
    Task<BeltProgressResponse> RecordAnswersAsync(Guid userId, RecordAnswersRequest request, CancellationToken cancellationToken = default);
}
