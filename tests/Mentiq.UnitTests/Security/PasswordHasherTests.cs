using Mentiq.Infrastructure.Security;

namespace Mentiq.UnitTests.Security;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_ProducesValueDifferentFromPlainText()
    {
        var hash = _hasher.Hash("Sup3rSecret!");

        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.NotEqual("Sup3rSecret!", hash);
    }

    [Fact]
    public void Verify_ReturnsTrue_ForCorrectPassword()
    {
        var hash = _hasher.Hash("Sup3rSecret!");

        Assert.True(_hasher.Verify(hash, "Sup3rSecret!"));
    }

    [Fact]
    public void Verify_ReturnsFalse_ForIncorrectPassword()
    {
        var hash = _hasher.Hash("Sup3rSecret!");

        Assert.False(_hasher.Verify(hash, "wrong-password"));
    }
}
