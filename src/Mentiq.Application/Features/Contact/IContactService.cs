using Mentiq.Application.Features.Contact.Dtos;

namespace Mentiq.Application.Features.Contact;

/// <summary>Contact-form messages: user feedback, suggestions, bug reports.</summary>
public interface IContactService
{
    Task<Guid> SubmitAsync(Guid? userId, SubmitContactRequest request, CancellationToken cancellationToken = default);

    Task<ContactListResponse> ListAsync(CancellationToken cancellationToken = default);

    Task MarkHandledAsync(Guid id, bool handled, CancellationToken cancellationToken = default);
}
