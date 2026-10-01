namespace Mentiq.Application.Features.League;

/// <summary>
/// League points for a practice session: correct answers times a speed
/// coefficient, so faster thinking is worth more. Pure and testable. Only
/// "ჩემი დონე" (level) sessions are submitted, so a strong student cannot farm
/// points on an easy level.
/// </summary>
public static class LeagueScoring
{
    public const int BasePerCorrect = 10;
    private const double SpeedRefSeconds = 5.0; // avg at which the multiplier is ~1.0
    private const double MinMultiplier = 0.5;
    private const double MaxMultiplier = 2.0;

    /// <summary>Speed multiplier for an average seconds-per-question (clamped 0.5–2.0).</summary>
    public static double SpeedMultiplier(double avgSeconds)
    {
        var mult = SpeedRefSeconds / Math.Max(avgSeconds, 1.0);
        return Math.Clamp(mult, MinMultiplier, MaxMultiplier);
    }

    /// <summary>Points earned by a session with <paramref name="correct"/> correct answers.</summary>
    public static int SessionPoints(int correct, double avgSeconds)
    {
        if (correct <= 0) return 0;
        return (int)Math.Round(correct * BasePerCorrect * SpeedMultiplier(avgSeconds));
    }
}
