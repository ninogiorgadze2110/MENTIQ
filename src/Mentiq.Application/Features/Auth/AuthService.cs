using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Auth.Dtos;
using Mentiq.Application.Features.Subscription;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Auth;

public sealed class AuthService : IAuthService
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly SubscriptionSettings _subscriptionSettings;

    public AuthService(
        IApplicationDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator,
        SubscriptionSettings subscriptionSettings)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
        _subscriptionSettings = subscriptionSettings;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        // Every new user gets a full-access free trial starting immediately.
        // Trial length is configuration-driven; all dates are UTC and the
        // backend is the only authority for trial expiry.
        var now = DateTime.UtcNow;
        var trialDays = _subscriptionSettings.TrialDays > 0 ? _subscriptionSettings.TrialDays : 7;

        var (educationLevel, grade, age) = ResolveEducation(request);

        var user = new User
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            EducationLevel = educationLevel,
            Grade = grade,
            Age = age,
            Role = UserRoles.Student,
            TrialStartUtc = now,
            TrialEndUtc = now.AddDays(trialDays)
        };

        _db.Users.Add(user);

        // Record the trial start in the append-only history log.
        _db.SubscriptionHistory.Add(new SubscriptionHistory
        {
            UserId = user.Id,
            Action = "Trial",
            Plan = "trial",
            Status = SubscriptionStatus.Trial,
            StartDate = user.TrialStartUtc,
            EndDate = user.TrialEndUtc,
            Provider = "Manual",
            ActivatedBy = null,
            Notes = $"{trialDays}-day free trial granted at registration."
        });

        await _db.SaveChangesAsync(cancellationToken);

        return BuildResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null || !_passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            // Do not reveal whether the email or the password was wrong.
            throw new UnauthorizedException("Invalid email or password.");
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user)
    {
        var (token, expiresAtUtc) = _tokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAtUtc = expiresAtUtc,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Grade = user.Grade,
                EducationLevel = user.EducationLevel,
                Age = user.Age,
                Role = user.Role
            }
        };
    }

    /// <summary>
    /// Normalizes the requested education level, grade and age into a consistent
    /// triple. The level is the source of truth; when it is missing it is inferred
    /// from the grade so older clients keep working.
    /// </summary>
    private static (string EducationLevel, int Grade, int? Age) ResolveEducation(RegisterRequest request)
    {
        var level = EducationLevels.IsValid(request.EducationLevel)
            ? request.EducationLevel!
            : request.Grade <= 0 ? EducationLevels.Preschool : EducationLevels.School;

        return level switch
        {
            EducationLevels.Preschool => (level, 0, request.Age is >= 3 and <= 7 ? request.Age : 5),
            EducationLevels.Adult => (level, 0, request.Age),
            _ => (EducationLevels.School, Math.Clamp(request.Grade, 1, 12), null)
        };
    }
}
