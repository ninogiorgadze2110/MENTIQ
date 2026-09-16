using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A message sent from the Contact form — feedback, a suggestion for the app's
/// development, a bug report, etc. Only the comment is required; name and email
/// are optional. When submitted by a signed-in user, their id is captured too.
/// </summary>
public class ContactMessage : BaseEntity
{
    /// <summary>The message body (required).</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Optional reply-to email.</summary>
    public string? Email { get; set; }

    /// <summary>Optional name.</summary>
    public string? Name { get; set; }

    /// <summary>The signed-in user who sent it, if any.</summary>
    public Guid? UserId { get; set; }

    /// <summary>Admin triage flag.</summary>
    public bool Handled { get; set; }
}
