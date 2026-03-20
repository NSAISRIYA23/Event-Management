using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EventSphere.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace EventSphere.Api.Services;

public sealed class AuthService
{
    private const string UsersFile = "users.json";

    private readonly IJsonStore _store;
    private readonly IConfiguration _config;

    public AuthService(IJsonStore store, IConfiguration config)
    {
        _store = store;
        _config = config;
    }

    public async Task<(bool ok, string error)> RegisterAsync(string name, string email, string password, bool isAdmin)
    {
        email = (email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(name)) return (false, "Name is required.");
        if (string.IsNullOrWhiteSpace(email)) return (false, "Email is required.");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 6) return (false, "Password must be at least 6 characters.");

        var users = await _store.ReadListAsync<User>(UsersFile);
        if (users.Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            return (false, "Email already registered.");

        var user = new User
        {
            Name = name.Trim(),
            Email = email,
            IsAdmin = isAdmin,
            PasswordHash = HashPassword(password)
        };

        users.Add(user);
        await _store.WriteListAsync(UsersFile, users);
        return (true, "");
    }

    public async Task<(bool ok, string error, User? user)> ValidateLoginAsync(string email, string password)
    {
        email = (email ?? "").Trim().ToLowerInvariant();
        var users = await _store.ReadListAsync<User>(UsersFile);
        var user = users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        if (user is null) return (false, "Invalid email or password.", null);
        if (!VerifyPassword(password, user.PasswordHash)) return (false, "Invalid email or password.", null);
        return (true, "", user);
    }

    public string CreateJwt(User user)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _config["Jwt:Issuer"] ?? "EventSphere";
        var audience = _config["Jwt:Audience"] ?? "EventSphere";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.Name),
            new("isAdmin", user.IsAdmin ? "true" : "false")
        };

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = SHA256.HashData(Combine(salt, Encoding.UTF8.GetBytes(password)));
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string stored)
    {
        var parts = (stored ?? "").Split(':');
        if (parts.Length != 2) return false;
        if (!TryFromBase64(parts[0], out var salt)) return false;
        if (!TryFromBase64(parts[1], out var expected)) return false;
        var actual = SHA256.HashData(Combine(salt, Encoding.UTF8.GetBytes(password)));
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static byte[] Combine(byte[] a, byte[] b)
    {
        var r = new byte[a.Length + b.Length];
        Buffer.BlockCopy(a, 0, r, 0, a.Length);
        Buffer.BlockCopy(b, 0, r, a.Length, b.Length);
        return r;
    }

    private static bool TryFromBase64(string s, out byte[] bytes)
    {
        try
        {
            bytes = Convert.FromBase64String(s);
            return true;
        }
        catch
        {
            bytes = Array.Empty<byte>();
            return false;
        }
    }
}

