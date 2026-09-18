using Mentiq.Application.Features.Achievements;
using Mentiq.Application.Features.Auth;
using Mentiq.Application.Features.Competition;
using Mentiq.Application.Features.Contact;
using Mentiq.Application.Features.DailyChallenge;
using Mentiq.Application.Features.Kids;
using Mentiq.Application.Features.Practice;
using Mentiq.Application.Features.Subscription;
using Microsoft.Extensions.DependencyInjection;

namespace Mentiq.Application;

/// <summary>Registers application-layer services (use cases).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPracticeService, PracticeService>();
        services.AddScoped<ICompetitionService, CompetitionService>();
        services.AddScoped<IAchievementService, AchievementService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IDailyChallengeService, DailyChallengeService>();
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IKidsExerciseService, KidsExerciseService>();

        return services;
    }
}
