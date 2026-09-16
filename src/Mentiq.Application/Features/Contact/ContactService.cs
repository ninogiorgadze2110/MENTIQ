using Mentiq.Application.Common.Exceptions;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Application.Features.Contact.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Features.Contact;

public sealed class ContactService : IContactService
{
    private readonly IApplicationDbContext _db;

    public ContactService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> SubmitAsync(Guid? userId, SubmitContactRequest request, CancellationToken cancellationToken = default)
    {
        var comment = request.Comment?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(comment))
        {
            throw new ValidationException("კომენტარი სავალდებულოა.");
        }

        var message = new ContactMessage
        {
            Comment = comment.Length > 2000 ? comment[..2000] : comment,
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            Name = string.IsNullOrWhiteSpace(request.Name) ? null : request.Name.Trim(),
            UserId = userId
        };

        _db.ContactMessages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);
        return message.Id;
    }

    public async Task<ContactListResponse> ListAsync(CancellationToken cancellationToken = default)
    {
        var items = await _db.ContactMessages.AsNoTracking()
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(500)
            .Select(m => new ContactMessageDto
            {
                Id = m.Id,
                Comment = m.Comment,
                Email = m.Email,
                Name = m.Name,
                UserId = m.UserId,
                Handled = m.Handled,
                CreatedAtUtc = m.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new ContactListResponse { Items = items, Total = items.Count };
    }

    public async Task MarkHandledAsync(Guid id, bool handled, CancellationToken cancellationToken = default)
    {
        var message = await _db.ContactMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken)
            ?? throw new NotFoundException("Message not found.");

        message.Handled = handled;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
