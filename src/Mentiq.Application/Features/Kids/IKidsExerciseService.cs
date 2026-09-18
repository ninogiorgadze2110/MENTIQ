using Mentiq.Application.Features.Kids.Dtos;

namespace Mentiq.Application.Features.Kids;

/// <summary>
/// Generates Kids exercises and grades answers server-side. One generation +
/// one submit path serves every exercise type; the type is data, not a new
/// endpoint. STEP 4 implements the "counting" type.
/// </summary>
public interface IKidsExerciseService
{
    /// <summary>Generate the next exercise for a world (adapted to the child's level).</summary>
    Task<ExerciseDto> NextAsync(Guid userId, string? world, CancellationToken cancellationToken = default);

    /// <summary>Grade a submitted answer, store the attempt and update progress.</summary>
    Task<SubmitExerciseResult> SubmitAsync(Guid userId, SubmitExerciseRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SkillProgressDto>> GetProgressAsync(Guid userId, CancellationToken cancellationToken = default);
}
