namespace Mentiq.Application.Features.Parent.Dtos;

/// <summary>A belt the child currently holds in one skill.</summary>
public sealed record ParentBeltDto
{
    public string SkillName { get; init; } = string.Empty;
    public string BeltName { get; init; } = string.Empty;
    public int BeltIndex { get; init; }
}

/// <summary>
/// A plain-language weekly summary of a child's practice, for the parent view.
/// Built entirely from real practice/progression data so it stays truthful.
/// </summary>
public sealed record ParentSummaryDto
{
    public string ChildName { get; init; } = string.Empty;
    public int Grade { get; init; }

    /// <summary>Distinct days practised in the last 7 days.</summary>
    public int DaysThisWeek { get; init; }
    public int SessionsThisWeek { get; init; }
    public int QuestionsThisWeek { get; init; }

    /// <summary>Highest belt reached (name), e.g. "მწვანე"; empty if none yet.</summary>
    public string TopBeltName { get; init; } = string.Empty;

    /// <summary>Belts the child holds (skills already past white).</summary>
    public IReadOnlyList<ParentBeltDto> Belts { get; init; } = Array.Empty<ParentBeltDto>();

    public int TricksMastered { get; init; }
    /// <summary>Trick (lesson) ids mastered — the client maps these to titles.</summary>
    public IReadOnlyList<string> TrickIds { get; init; } = Array.Empty<string>();

    /// <summary>Average seconds per question last week vs this week (0 if no data).</summary>
    public double SpeedBeforeSeconds { get; init; }
    public double SpeedAfterSeconds { get; init; }
    public bool SpeedImproved { get; init; }

    public int AccuracyThisWeek { get; init; }
    public int AccuracyPrevWeek { get; init; }

    /// <summary>The skill that most needs help (lowest accuracy), or null.</summary>
    public string? NeedsHelpSkillName { get; init; }
    public int? NeedsHelpAccuracy { get; init; }
}
