using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Mentiq.Application.Common.Interfaces;
using Mentiq.Infrastructure.Authentication;
using Microsoft.Extensions.Options;

namespace Mentiq.Infrastructure.Security;

/// <summary>
/// Stateless exercise tokens: a base64url JSON payload with an HMAC-SHA256
/// signature (keyed by the app secret). The client cannot read a meaningful
/// answer out of it without breaking, and cannot forge one without the key.
/// </summary>
public sealed class ExerciseTokenService : IExerciseTokenService
{
    private readonly byte[] _key;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public ExerciseTokenService(IOptions<JwtSettings> jwt)
    {
        var secret = jwt.Value.Secret;
        _key = Encoding.UTF8.GetBytes(string.IsNullOrEmpty(secret) ? "mentiq-exercise-fallback-key" : secret);
    }

    public string Issue(ExerciseTokenPayload payload)
    {
        var body = Base64Url(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, Json)));
        var sig = Base64Url(Sign(body));
        return $"{body}.{sig}";
    }

    public ExerciseTokenPayload? Verify(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        var parts = token.Split('.');
        if (parts.Length != 2) return null;

        var expected = Base64Url(Sign(parts[0]));
        // Constant-time comparison to avoid signature-timing leaks.
        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(parts[1])))
        {
            return null;
        }

        try
        {
            var json = Encoding.UTF8.GetString(FromBase64Url(parts[0]));
            var payload = JsonSerializer.Deserialize<ExerciseTokenPayload>(json, Json);
            if (payload is null) return null;
            if (payload.ExpUnix < DateTimeOffset.UtcNow.ToUnixTimeSeconds()) return null;
            return payload;
        }
        catch
        {
            return null;
        }
    }

    private byte[] Sign(string body)
    {
        using var hmac = new HMACSHA256(_key);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
    }

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] FromBase64Url(string value)
    {
        var s = value.Replace('-', '+').Replace('_', '/');
        s = (s.Length % 4) switch { 2 => s + "==", 3 => s + "=", _ => s };
        return Convert.FromBase64String(s);
    }
}
