using Mentiq.Application.Features.Contact;
using Mentiq.Application.Features.Contact.Dtos;
using Mentiq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mentiq.Api.Controllers;

/// <summary>Public contact form + admin inbox for feedback and suggestions.</summary>
[ApiController]
[Route("api/contact")]
public sealed class ContactController : ApiControllerBase
{
    private readonly IContactService _contact;

    public ContactController(IContactService contact)
    {
        _contact = contact;
    }

    /// <summary>Submit a contact message. Works for anyone; captures the user id when signed in.</summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(SubmitContactRequest request, CancellationToken cancellationToken)
    {
        var id = await _contact.SubmitAsync(TryGetUserId(), request, cancellationToken);
        return Ok(new { id });
    }
}

/// <summary>Admin inbox for contact-form messages.</summary>
[ApiController]
[Route("api/admin/contact")]
[Authorize(Roles = UserRoles.Administrator)]
public sealed class AdminContactController : ApiControllerBase
{
    private readonly IContactService _contact;

    public AdminContactController(IContactService contact)
    {
        _contact = contact;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ContactListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ContactListResponse>> List(CancellationToken cancellationToken)
        => Ok(await _contact.ListAsync(cancellationToken));

    [HttpPost("{id:guid}/handled")]
    public async Task<IActionResult> MarkHandled(Guid id, [FromQuery] bool handled, CancellationToken cancellationToken)
    {
        await _contact.MarkHandledAsync(id, handled, cancellationToken);
        return NoContent();
    }
}
