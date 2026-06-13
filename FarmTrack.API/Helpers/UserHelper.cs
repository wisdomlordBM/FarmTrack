using System.Security.Claims;

namespace FarmTrack.API.Helpers
{
    public static class UserHelper
    {
        public static string GetUserId(ClaimsPrincipal user)
            => user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }
}
