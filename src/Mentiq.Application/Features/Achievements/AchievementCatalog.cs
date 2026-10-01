using Mentiq.Application.Features.Progression;

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

    // ---- Belt progression ----
    /// <summary>Highest belt index reached in any skill (0 = white … 4 = black).</summary>
    public int MaxBeltIndex { get; init; }
    /// <summary>Lowest belt index across ALL skills (for "every skill at belt N").</summary>
    public int MinBeltIndex { get; init; }
    /// <summary>Distinct tricks mastered — tricks tied to belts the user has passed.</summary>
    public int TricksMastered { get; init; }
    /// <summary>Most active days inside any rolling 7-day window (weekly-rhythm goal).</summary>
    public int MaxActiveDaysInWeek { get; init; }
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

/// <summary>
/// The static catalog of all achievements MENTIQ can award. Codes are stable —
/// renaming a name/description keeps earned badges intact. Belts are the primary
/// category; speed/accuracy feats are gated behind a belt so they are earned
/// through real progress, not on day one.
/// </summary>
public static class AchievementCatalog
{
    private static int B(bool value) => value ? 1 : 0;

    /// <summary>Distinct tricks tied to any belt across all skills.</summary>
    public static readonly int TotalTricks = ProgressionConfig.Skills
        .SelectMany(s => s.LessonsByBelt.SelectMany(b => b))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Count();

    public static readonly IReadOnlyList<AchievementDef> All = new List<AchievementDef>
    {
        // ---- 🥋 ქამრები (main) ----
        new("belt_first_yellow", "belt", "🥋", "პირველი ქამარი",       "აიღე პირველი ქამარი (ყვითელი) ნებისმიერ უნარში.", 1, false, s => B(s.MaxBeltIndex >= 1)),
        new("belt_green",        "belt", "🟢", "მწვანე ქამარი",         "მიაღწიე მწვანე ქამარს ნებისმიერ უნარში.",          1, false, s => B(s.MaxBeltIndex >= 2)),
        new("belt_blue",         "belt", "🔵", "ლურჯი ქამარი",          "მიაღწიე ლურჯ ქამარს ნებისმიერ უნარში.",            1, false, s => B(s.MaxBeltIndex >= 3)),
        new("belt_black",        "belt", "⚫", "შავი ქამარი",           "მიაღწიე შავ ქამარს ნებისმიერ უნარში.",             1, false, s => B(s.MaxBeltIndex >= 4)),
        new("belt_all_yellow",   "belt", "🏵", "ყველა უნარი ყვითელზე",  "ყველა უნარი ყვითელ ქამარზე ან ზემოთ.",             1, false, s => B(s.MinBeltIndex >= 1)),
        new("belt_all_green",    "belt", "🎖", "ყველა უნარი მწვანეზე",  "ყველა უნარი მწვანე ქამარზე ან ზემოთ.",             1, true,  s => B(s.MinBeltIndex >= 2)),

        // ---- 🎩 ხრიკები ----
        new("trick_first", "tricks", "🎩", "პირველი ხრიკი",     "აითვისე პირველი ხრიკი.",     1,                false, s => B(s.TricksMastered >= 1)),
        new("trick_5",     "tricks", "🪄", "ხრიკების ხელოსანი", "აითვისე 5 ხრიკი.",           5,                false, s => s.TricksMastered),
        new("trick_all",   "tricks", "✨", "ხრიკების ოსტატი",   "აითვისე ყველა ხრიკი.",       Math.Max(1, TotalTricks), true,  s => s.TricksMastered),

        // ---- 🔥 სერია ----
        new("week_5",     "streak", "📅", "კვირის რიტმი",       "ივარჯიშე კვირაში 5 დღე (7-დან).", 5,   false, s => s.MaxActiveDaysInWeek),
        new("streak_3",   "streak", "🔥", "პირველი ნაპერწკალი", "3 დღე ზედიზედ ივარჯიშე.",          3,   false, s => s.DayStreak),
        new("streak_7",   "streak", "🔥", "ცეცხლზე",            "7 დღე ზედიზედ ვარჯიში.",           7,   false, s => s.DayStreak),
        new("streak_14",  "streak", "🌟", "ორი კვირა ზედიზედ",  "14 დღე ზედიზედ.",                  14,  false, s => s.DayStreak),
        new("streak_30",  "streak", "💎", "სტაბილურობა",        "30 დღე ზედიზედ.",                  30,  false, s => s.DayStreak),
        new("streak_60",  "streak", "🏅", "60 დღის მებრძოლი",   "60 დღე ზედიზედ.",                  60,  false, s => s.DayStreak),
        new("streak_100", "streak", "👑", "100 დღის ლეგენდა",   "100 დღე ზედიზედ.",                 100, false, s => s.DayStreak),
        new("streak_365", "streak", "🐉", "365 დღის ოსტატი",    "მთელი წელი ზედიზედ.",              365, true,  s => s.DayStreak),

        // ---- ⚡ სიჩქარე (belt-gated) ----
        new("speed_5", "speed", "⚡", "სისწრაფე",   "მწვანე ქამარზე საშუალო პასუხი ≤ 4 წამი.", 1, false, s => B(s.MaxBeltIndex >= 2 && s.BestAvgSeconds <= 4)),
        new("speed_3", "speed", "🚀", "ფიცხი გონება", "ლურჯ ქამარზე საშუალო პასუხი ≤ 3 წამი.",   1, false, s => B(s.MaxBeltIndex >= 3 && s.BestAvgSeconds <= 3)),
        new("speed_2", "speed", "⚡", "ელვა",       "ლურჯ ქამარზე საშუალო პასუხი ≤ 2 წამი.",   1, true,  s => B(s.MaxBeltIndex >= 3 && s.BestAvgSeconds <= 2)),

        // ---- 🎯 სიზუსტე (belt-gated) ----
        new("perfect",     "accuracy", "🎯", "უშეცდომო",          "ყვითელ ქამარზე 100% სიზუსტე ვარჯიშში.",   1,  false, s => B(s.MaxBeltIndex >= 1 && s.AnyPerfectSession)),
        new("acc_20",      "accuracy", "💯", "სიზუსტის მანქანა",  "მწვანე ქამარზე 20/20 სწორი პასუხი.",      1,  false, s => B(s.MaxBeltIndex >= 2 && s.Any20Of20)),
        new("no_mistakes", "accuracy", "🧠", "უშეცდომო სერია",    "50 პასუხი ზედიზედ შეცდომის გარეშე.",      50, true,  s => s.MaxLongestStreak),

        // ---- 🏆 შეჯიბრი ----
        new("comp_gold",    "competition", "🥇", "მათემატიკის ჩემპიონი", "შეჯიბრში 1 ადგილი.",     1, false, s => B(s.BestCompetitionRank == 1)),
        new("comp_silver",  "competition", "🥈", "ვერცხლის გონება",      "შეჯიბრში 2 ან უკეთესი.",  1, false, s => B(s.BestCompetitionRank is >= 1 and <= 2)),
        new("comp_bronze",  "competition", "🥉", "ბრინჯაოს გონება",      "შეჯიბრში 3 ან უკეთესი.",  1, false, s => B(s.BestCompetitionRank is >= 1 and <= 3)),
        new("comp_top10",   "competition", "🔥", "ტოპ 10",               "შეჯიბრში ტოპ 10-ში.",     1, false, s => B(s.BestCompetitionRank is >= 1 and <= 10)),
        new("comp_perfect", "competition", "🎯", "სრულყოფილი ბრძოლა",    "100% სიზუსტე შეჯიბრში.",   1, false, s => B(s.AnyCompetitionPerfect)),

        // ---- 📚 ვარჯიში ----
        new("vol_1",  "volume", "🎯", "პირველი ნაბიჯები", "დაასრულე პირველი ვარჯიში.", 1,  false, s => s.TotalSessions),
        new("vol_10", "volume", "📚", "სერიოზულად",        "დაასრულე 10 ვარჯიში.",       10, false, s => s.TotalSessions),
        new("vol_50", "volume", "🧠", "თავდადებული",       "დაასრულე 50 ვარჯიში.",       50, false, s => s.TotalSessions)
    };
}
