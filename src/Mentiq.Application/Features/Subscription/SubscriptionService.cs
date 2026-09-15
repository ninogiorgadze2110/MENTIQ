using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Subscription.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Subscription;

using SubscriptionEntity = Domain.Entities.Subscription;

public sealed class SubscriptionService : ISubscriptionService
{
    private readonly IApplicationDbContext _db;
    private readonly SubscriptionSettings _settings;

    public SubscriptionService(IApplicationDbContext db, SubscriptionSettings settings)
    {
        _db = db;
        _settings = settings;
    }

    // -----------------------------------------------------------------------
    // Self / access
    // -----------------------------------------------------------------------

    public async Task<SubscriptionStatusDto> GetStatusAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var sub = await _db.Subscriptions.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);

        return Evaluate(user, sub, DateTime.UtcNow);
    }

    public async Task<bool> HasActiveAccessAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var trialEnd = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => (DateTime?)u.TrialEndUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (trialEnd is null)
        {
            return false; // Unknown user → no access.
        }

        if (now < trialEnd.Value)
        {
            return true; // Trial still active.
        }

        return await _db.Subscriptions.AsNoTracking().AnyAsync(
            s => s.UserId == userId
                 && s.Status == SubscriptionStatus.Active
                 && s.StartDate <= now
                 && now < s.EndDate,
            cancellationToken);
    }

    public async Task<SubscriptionDto> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var sub = await _db.Subscriptions.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);

        return ToDto(user, sub);
    }

    public PlansResponse GetPlans()
    {
        return new PlansResponse
        {
            Plans = _settings.Plans.Select(p => new PlanDto
            {
                Code = p.Code,
                Name = p.Name,
                Price = p.Price,
                Currency = p.Currency,
                Period = p.Period,
                DurationDays = p.DurationDays,
                Description = p.Description
            }).ToList(),
            PaymentInstructions = _settings.PaymentInstructions,
            ContactEmail = _settings.ContactEmail,
            ContactPhone = _settings.ContactPhone,
            ManualPayment = true
        };
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    public async Task<AdminSubscriptionListResponse> ListAsync(string? query, CancellationToken cancellationToken = default)
    {
        var users = _db.Users.AsNoTracking().Where(u => u.IsDeleted != true);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim().ToLower();
            users = users.Where(u => u.Email.ToLower().Contains(q) || u.DisplayName.ToLower().Contains(q));
        }

        var userList = await users
            .OrderBy(u => u.Email)
            .Take(500)
            .ToListAsync(cancellationToken);

        var ids = userList.Select(u => u.Id).ToList();
        var subs = await _db.Subscriptions.AsNoTracking()
            .Where(s => ids.Contains(s.UserId))
            .ToDictionaryAsync(s => s.UserId, cancellationToken);

        var now = DateTime.UtcNow;
        var rows = userList.Select(u =>
        {
            subs.TryGetValue(u.Id, out var sub);
            var status = Evaluate(u, sub, now);
            return new AdminSubscriptionRow
            {
                UserId = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                Status = status.Status,
                HasAccess = status.HasAccess,
                TrialEndDate = u.TrialEndUtc,
                Plan = sub?.Plan,
                SubscriptionStartDate = sub is null ? null : sub.StartDate,
                SubscriptionEndDate = sub is null ? null : sub.EndDate
            };
        }).ToList();

        return new AdminSubscriptionListResponse { Items = rows, Total = rows.Count };
    }

    public async Task<AdminSubscriptionDetail> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var sub = await _db.Subscriptions.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);

        var history = await _db.SubscriptionHistory.AsNoTracking()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return BuildDetail(user, sub, history);
    }

    public async Task<AdminSubscriptionDetail> ActivateAsync(Guid userId, Guid adminId, ActivateSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var start = ToUtc(request.StartDate);
        var end = ToUtc(request.EndDate);
        if (end <= start)
        {
            throw new ValidationException("End date must be after the start date.");
        }

        var provider = string.IsNullOrWhiteSpace(request.Provider) ? "Manual" : request.Provider.Trim();
        var plan = request.Plan.Trim();

        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        if (sub is null)
        {
            sub = new SubscriptionEntity { UserId = userId };
            _db.Subscriptions.Add(sub);
        }

        sub.Plan = plan;
        sub.Status = SubscriptionStatus.Active;
        sub.StartDate = start;
        sub.EndDate = end;
        sub.Provider = provider;
        sub.ActivatedByAdminId = adminId;
        sub.Notes = request.Notes;

        AppendHistory(userId, "Activate", sub, adminId);

        await _db.SaveChangesAsync(cancellationToken);
        return await GetForUserAsync(userId, cancellationToken);
    }

    public async Task<AdminSubscriptionDetail> ExtendAsync(Guid userId, Guid adminId, ExtendSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("This user has no subscription to extend. Activate one first.");

        DateTime newEnd;
        if (request.EndDate is { } absolute)
        {
            newEnd = ToUtc(absolute);
        }
        else if (request.AddDays is { } days && days > 0)
        {
            // Extend from the later of the current end or now, so an already-expired
            // subscription is extended forward from today rather than the past.
            var basis = sub.EndDate > DateTime.UtcNow ? sub.EndDate : DateTime.UtcNow;
            newEnd = basis.AddDays(days);
        }
        else
        {
            throw new ValidationException("Provide either a new end date or a positive number of days to add.");
        }

        if (newEnd <= sub.StartDate)
        {
            throw new ValidationException("The new end date must be after the subscription start date.");
        }

        sub.EndDate = newEnd;
        sub.Status = SubscriptionStatus.Active; // Re-activate if it had lapsed.
        sub.ActivatedByAdminId = adminId;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            sub.Notes = request.Notes;
        }

        AppendHistory(userId, "Extend", sub, adminId);

        await _db.SaveChangesAsync(cancellationToken);
        return await GetForUserAsync(userId, cancellationToken);
    }

    public async Task<AdminSubscriptionDetail> CancelAsync(Guid userId, Guid adminId, CancelSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("This user has no subscription to cancel.");

        sub.Status = SubscriptionStatus.Cancelled;
        sub.EndDate = DateTime.UtcNow; // Deactivate access immediately.
        sub.ActivatedByAdminId = adminId;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            sub.Notes = request.Notes;
        }

        AppendHistory(userId, "Cancel", sub, adminId);

        await _db.SaveChangesAsync(cancellationToken);
        return await GetForUserAsync(userId, cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /// <summary>
    /// The single centralized access rule: paid subscription takes priority,
    /// but an unexpired trial also grants access.
    /// </summary>
    private static SubscriptionStatusDto Evaluate(User user, SubscriptionEntity? sub, DateTime now)
    {
        var paidActive = sub is not null
            && sub.Status == SubscriptionStatus.Active
            && sub.StartDate <= now
            && now < sub.EndDate;

        var trialActive = now < user.TrialEndUtc;
        var hasAccess = paidActive || trialActive;

        string status;
        DateTime? accessEnds;
        if (paidActive)
        {
            status = "Active";
            accessEnds = sub!.EndDate;
        }
        else if (trialActive)
        {
            status = "Trial";
            accessEnds = user.TrialEndUtc;
        }
        else if (sub is not null && sub.Status == SubscriptionStatus.Cancelled)
        {
            status = "Cancelled";
            accessEnds = null;
        }
        else
        {
            status = "Expired";
            accessEnds = null;
        }

        var daysRemaining = accessEnds is { } end
            ? Math.Max(0, (int)Math.Ceiling((end - now).TotalDays))
            : 0;

        return new SubscriptionStatusDto
        {
            Status = status,
            HasAccess = hasAccess,
            IsTrial = !paidActive && trialActive,
            TrialStartDate = user.TrialStartUtc,
            TrialEndDate = user.TrialEndUtc,
            SubscriptionStartDate = sub?.StartDate,
            SubscriptionEndDate = sub?.EndDate,
            Plan = paidActive ? sub!.Plan : sub?.Plan,
            DaysRemaining = daysRemaining,
            AccessEndsUtc = accessEnds
        };
    }

    private static SubscriptionDto ToDto(User user, SubscriptionEntity? sub) => new()
    {
        UserId = user.Id,
        Plan = sub?.Plan,
        Status = Evaluate(user, sub, DateTime.UtcNow).Status,
        StartDate = sub?.StartDate,
        EndDate = sub?.EndDate,
        Provider = sub?.Provider,
        ActivatedByAdminId = sub?.ActivatedByAdminId,
        Notes = sub?.Notes,
        TrialStartDate = user.TrialStartUtc,
        TrialEndDate = user.TrialEndUtc
    };

    private static AdminSubscriptionDetail BuildDetail(User user, SubscriptionEntity? sub, List<SubscriptionHistory> history) => new()
    {
        Current = ToDto(user, sub),
        Status = Evaluate(user, sub, DateTime.UtcNow),
        Email = user.Email,
        DisplayName = user.DisplayName,
        History = history.Select(h => new SubscriptionHistoryDto
        {
            Action = h.Action,
            Plan = h.Plan,
            Status = h.Status.ToString(),
            StartDate = h.StartDate,
            EndDate = h.EndDate,
            Provider = h.Provider,
            ActivatedBy = h.ActivatedBy,
            Notes = h.Notes,
            CreatedAtUtc = h.CreatedAtUtc
        }).ToList()
    };

    private void AppendHistory(Guid userId, string action, SubscriptionEntity sub, Guid adminId)
    {
        _db.SubscriptionHistory.Add(new SubscriptionHistory
        {
            UserId = userId,
            Action = action,
            Plan = sub.Plan,
            Status = sub.Status,
            StartDate = sub.StartDate,
            EndDate = sub.EndDate,
            Provider = sub.Provider,
            ActivatedBy = adminId,
            Notes = sub.Notes
        });
    }

    /// <summary>Normalizes an incoming date to UTC. Unspecified kinds are treated as UTC.</summary>
    private static DateTime ToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
