namespace Mentiq.Application.Features.Achievements.Dtos;

public sealed record AchievementDto
{
    public string Code { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Emoji { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int Target { get; init; }
    public int Progress { get; init; }
    public bool Unlocked { get; init; }
    public bool Secret { get; init; }
    public DateTime? UnlockedAtUtc { get; init; }
}

public sealed record AchievementsResponse
{
    public int UnlockedCount { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<AchievementDto> Achievements { get; init; } = System.Array.Empty<AchievementDto>();
    /// <summary>Codes unlocked on this request (for a celebratory toast).</summary>
    public IReadOnlyList<string> NewlyUnlocked { get; init; } = System.Array.Empty<string>();
}
