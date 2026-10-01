using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Progression.Dtos;

/// <summary>Full belt-progression snapshot for a user, plus the config the client
/// needs to render the path without hard-coding anything of its own.</summary>
public sealed record BeltProgressResponse
{
    public IReadOnlyList<BeltDto> Belts { get; init; } = Array.Empty<BeltDto>();
    public IReadOnlyList<SkillProgressDto> Skills { get; init; } = Array.Empty<SkillProgressDto>();
    public int MasteryWindow { get; init; }
    public int MinAccuracyPercent { get; init; }
}

public sealed record BeltDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Index { get; init; }
    public int Difficulty { get; init; }
    public int TargetSeconds { get; init; }
}

public sealed record PrerequisiteDto
{
    public string Skill { get; init; } = string.Empty;
    public int BeltIndex { get; init; }
}

public sealed record MasteryDto
{
    public int AccuracyPercent { get; init; }
    public int MedianTimeMs { get; init; }
    public int AnswersCount { get; init; }
    public int WindowSize { get; init; }
    public int TargetSeconds { get; init; }
    public bool Ready { get; init; }
}

public sealed record SkillProgressDto
{
    public string Key { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int BeltIndex { get; init; }
    public string BeltId { get; init; } = string.Empty;
    public bool Unlocked { get; init; }
    public PrerequisiteDto? Requires { get; init; }
    public MasteryDto Mastery { get; init; } = new();
    /// <summary>Trick (learn lesson) ids per belt; index = belt.</summary>
    public IReadOnlyList<IReadOnlyList<string>> LessonsByBelt { get; init; } = Array.Empty<IReadOnlyList<string>>();
}

// ---- Commands ----

public sealed record AnswerDto
{
    public bool Correct { get; init; }
    public int TimeMs { get; init; }
}

public sealed record RecordAnswersRequest
{
    [Required]
    public string Skill { get; init; } = string.Empty;

    [Required]
    public IReadOnlyList<AnswerDto> Answers { get; init; } = Array.Empty<AnswerDto>();
}
