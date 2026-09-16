using System.ComponentModel.DataAnnotations;

namespace Mentiq.Application.Features.Contact.Dtos;

public sealed record SubmitContactRequest
{
    [Required(ErrorMessage = "კომენტარი სავალდებულოა.")]
    [MaxLength(2000)]
    public string Comment { get; init; } = string.Empty;

    [EmailAddress]
    [MaxLength(256)]
    public string? Email { get; init; }

    [MaxLength(128)]
    public string? Name { get; init; }
}

public sealed record ContactMessageDto
{
    public Guid Id { get; init; }
    public string Comment { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Name { get; init; }
    public Guid? UserId { get; init; }
    public bool Handled { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}

public sealed record ContactListResponse
{
    public IReadOnlyList<ContactMessageDto> Items { get; init; } = Array.Empty<ContactMessageDto>();
    public int Total { get; init; }
}
