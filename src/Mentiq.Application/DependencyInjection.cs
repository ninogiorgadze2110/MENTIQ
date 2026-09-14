using Mentiq.Application.Features.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace Mentiq.Application;

/// <summary>Registers application-layer services (use cases).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
