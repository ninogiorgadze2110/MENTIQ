using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Kids.Dtos;

/// <summary>
/// A generated exercise sent to the child. The correct answer is NEVER included —
/// it lives only inside the signed <see cref="Token"/>. `Visual` and `Options`
/// are generic so the same shape serves every exercise type.
/// </summary>
public sealed record ExerciseDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Skill { get; init; } = string.Empty;
    public string? World { get; init; }
    public int Difficulty { get; init; }

    /// <summary>Georgian instruction text (also used as TTS fallback).</summary>
    public string Instruction { get; init; } = string.Empty;

    /// <summary>Audio key for a recorded instruction file, if one exists.</summary>
    public string InstructionAudioKey { get; init; } = string.Empty;

    /// <summary>Type-agnostic visual payload (e.g. objects to count).</summary>
    public ExerciseVisual Visual { get; init; } = new();

    /// <summary>Answer choices the child can pick.</summary>
    public IReadOnlyList<ExerciseOption> Options { get; init; } = Array.Empty<ExerciseOption>();

    /// <summary>Opaque signed token carrying the correct answer for server-side grading.</summary>
    public string Token { get; init; } = string.Empty;
}

/// <summary>Generic visual description. `Kind` tells the renderer how to draw it.</summary>
public sealed record ExerciseVisual
{
    /// <summary>"objects" | "addition" | "makeN" | "sequence" | "none".</summary>
    public string Kind { get; init; } = "objects";
    public string? Emoji { get; init; }
    public int Count { get; init; }

    /// <summary>Target total for the "makeN" (complete-to-N) kind: `Count` solid +
    /// `Target - Count` dashed slots, and the child answers how many are missing.</summary>
    public int Target { get; init; }

    /// <summary>Addends for the "addition" kind, e.g. [2, 1] → 🍎🍎 + 🍎.</summary>
    public IReadOnlyList<int>? Addends { get; init; }

    /// <summary>Ordered items for the "sequence" (pattern) kind; the child guesses what follows.</summary>
    public IReadOnlyList<string>? Items { get; init; }
}

public sealed record ExerciseOption
{
    /// <summary>Machine value used for grading.</summary>
    public string Value { get; init; } = string.Empty;
    /// <summary>What the child sees (number, emoji, …).</summary>
    public string Label { get; init; } = string.Empty;
    /// <summary>When set, the option renders as a group of `Count` × `Emoji` (e.g. more/less).</summary>
    public string? Emoji { get; init; }
    public int? Count { get; init; }
}

public sealed record SubmitExerciseRequest
{
    [Required]
    public string Token { get; init; } = string.Empty;

    [Required]
    public string Answer { get; init; } = string.Empty;

    public int ResponseTimeMs { get; init; }

    /// <summary>1 for the first try, 2 for a retry, etc.</summary>
    public int AttemptNumber { get; init; } = 1;
}

public sealed record SubmitExerciseResult
{
    public bool IsCorrect { get; init; }

    /// <summary>Revealed only after answering, so the child can see the right answer.</summary>
    public string CorrectAnswer { get; init; } = string.Empty;

    public int StarsAwarded { get; init; }
    public int TotalStars { get; init; }
    public int Level { get; init; }

    /// <summary>Georgian feedback line + its audio key.</summary>
    public string Feedback { get; init; } = string.Empty;
    public string FeedbackAudioKey { get; init; } = string.Empty;
}

public sealed record SkillProgressDto
{
    public string Skill { get; init; } = string.Empty;
    public int Level { get; init; }
    public int Score { get; init; }
    public int TotalAttempts { get; init; }
    public int CorrectAttempts { get; init; }
    public int Accuracy { get; init; }
    public int AverageResponseTimeMs { get; init; }
}
