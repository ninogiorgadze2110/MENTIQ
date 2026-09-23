using Mentiq.Domain.Common;

namespace Mentiq.Domain.Entities;

/// <summary>
/// A single global, admin-controllable platform setting (key/value). Used for
/// runtime switches such as the beta "free access for everyone" mode, so they can
/// be toggled from the admin dashboard without a redeploy.
/// </summary>
public class PlatformSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
