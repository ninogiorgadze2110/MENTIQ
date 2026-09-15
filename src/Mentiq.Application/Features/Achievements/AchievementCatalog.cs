namespace Mentiq.Application.Features.Achievements;

/// <summary>Aggregated stats a user's achievements are evaluated against.</summary>
public sealed record UserStats
{
    public int DayStreak { get; init; }
    public int TotalSessions { get; init; }
    public int MaxLongestStreak { get; init; }
    /// <summary>Best (lowest) average seconds-per-question across sessions; large if none.</summary>
    public double BestAvgSeconds { get; init; } = double.MaxValue;
    public bool AnyPerfectSession { get; init; }
    public bool Any20Of20 { get; init; }
    /// <summary>Best (lowest) competition rank achieved; 0 if never competed.</summary>
    public int BestCompetitionRank { get; init; }
    public bool AnyCompetitionPerfect { get; init; }
}

public sealed record AchievementDef(
    string Code,
    string Category,
    string Emoji,
    string Name,
    string Description,
    int Target,
    bool Secret,
    Func<UserStats, int> Progress);

/// <summary>The static catalog of all achievements MENTIQ can award.</summary>
public static class AchievementCatalog
{
    private static int B(bool value) => value ? 1 : 0;

    public static readonly IReadOnlyList<AchievementDef> All = new List<AchievementDef>
    {
        // ---- 🔥 Streak ----
        new("streak_3",   "streak", "🔥", "First Spark",       "3 დღე ზედიზედ ივარჯიშე.",   3,   false, s => s.DayStreak),
        new("streak_7",   "streak", "🔥", "On Fire",           "7 დღე ზედიზედ ვარჯიში.",    7,   false, s => s.DayStreak),
        new("streak_14",  "streak", "🌟", "Two Weeks Strong",  "14 დღე ზედიზედ.",           14,  false, s => s.DayStreak),
        new("streak_30",  "streak", "💎", "Consistency Pro",   "30 დღე ზედიზედ.",           30,  false, s => s.DayStreak),
        new("streak_60",  "streak", "🏅", "60 Day Warrior",    "60 დღე ზედიზედ.",           60,  false, s => s.DayStreak),
        new("streak_100", "streak", "👑", "100 Day Legend",    "100 დღე ზედიზედ.",          100, false, s => s.DayStreak),
        new("streak_365", "streak", "🐉", "365 Day Master",    "მთელი წელი ზედიზედ.",       365, true,  s => s.DayStreak),

        // ---- 📚 Volume ----
        new("vol_1",  "volume", "🎯", "First Steps",     "დაასრულე პირველი ვარჯიში.",   1,  false, s => s.TotalSessions),
        new("vol_10", "volume", "📚", "Getting Serious", "დაასრულე 10 ვარჯიში.",         10, false, s => s.TotalSessions),
        new("vol_50", "volume", "🧠", "Dedicated",       "დაასრულე 50 ვარჯიში.",         50, false, s => s.TotalSessions),

        // ---- ⚡ Speed ----
        new("speed_5", "speed", "⚡", "Quick Thinker",   "საშუალო პასუხი < 5 წამი.", 1, false, s => B(s.BestAvgSeconds <= 5)),
        new("speed_3", "speed", "🚀", "Fast Mind",       "საშუალო პასუხი < 3 წამი.", 1, false, s => B(s.BestAvgSeconds <= 3)),
        new("speed_2", "speed", "⚡", "Lightning Brain", "საშუალო პასუხი < 2 წამი.", 1, true,  s => B(s.BestAvgSeconds <= 2)),

        // ---- 🎯 Accuracy ----
        new("perfect",     "accuracy", "🎯", "Perfect Score",    "100% სიზუსტე ვარჯიშში.",              1,  false, s => B(s.AnyPerfectSession)),
        new("acc_20",      "accuracy", "💯", "Accuracy Machine", "20/20 სწორი პასუხი ერთ ვარჯიშში.",    1,  false, s => B(s.Any20Of20)),
        new("no_mistakes", "accuracy", "🧠", "No Mistakes",      "50 პასუხი ზედიზედ შეცდომის გარეშე.",  50, true,  s => s.MaxLongestStreak),

        // ---- 🏆 Competition ----
        new("comp_gold",    "competition", "🥇", "Math Champion", "შეჯიბრში 1 ადგილი.",       1, false, s => B(s.BestCompetitionRank == 1)),
        new("comp_silver",  "competition", "🥈", "Silver Mind",   "შეჯიბრში 2 ან უკეთესი.",   1, false, s => B(s.BestCompetitionRank is >= 1 and <= 2)),
        new("comp_bronze",  "competition", "🥉", "Bronze Mind",   "შეჯიბრში 3 ან უკეთესი.",   1, false, s => B(s.BestCompetitionRank is >= 1 and <= 3)),
        new("comp_top10",   "competition", "🔥", "Top 10",        "შეჯიბრში Top 10-ში.",      1, false, s => B(s.BestCompetitionRank is >= 1 and <= 10)),
        new("comp_perfect", "competition", "🎯", "Perfect Battle","100% სიზუსტე შეჯიბრში.",   1, false, s => B(s.AnyCompetitionPerfect))
    };
}
