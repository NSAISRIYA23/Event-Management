using System.Security.Claims;

namespace EventSphere.Api.Services;

public static class ClaimsExtensions
{
    public static string GetUserId(this ClaimsPrincipal user)
        => user.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? user.FindFirstValue("sub")
           ?? "";

    public static bool IsAdmin(this ClaimsPrincipal user)
        => string.Equals(user.FindFirstValue("isAdmin"), "true", StringComparison.OrdinalIgnoreCase);
}

