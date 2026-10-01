using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A user's belt progression on one skill. The recent-answer window (the last N
/// {correct, timeMs} answers) is stored as JSON so the mastery rule can be
/// evaluated server-side without a separate per-answer table.
/// </summary>
public class UserSkillProgress : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Skill key, e.g. "add", "mul", "div" (see ProgressionConfig).</summary>
    public string Skill { get; set; } = string.Empty;

    /// <summary>Current belt index: 0 = white … 4 = black.</summary>
    public int BeltIndex { get; set; }

    /// <summary>JSON array of the last N answers: [{"c":true,"t":4200}, …].</summary>
    public string RecentJson { get; set; } = "[]";

    /// <summary>Lifetime counters (for stats; not used by the mastery window).</summary>
    public int TotalAnswers { get; set; }
    public int TotalCorrect { get; set; }
}
