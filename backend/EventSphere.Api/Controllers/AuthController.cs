using EventSphere.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    public sealed record RegisterRequest(string Name, string Email, string Password, bool IsAdmin);
    public sealed record LoginRequest(string Email, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (ok, error) = await _auth.RegisterAsync(req.Name, req.Email, req.Password, req.IsAdmin);
        if (!ok) return BadRequest(new { message = error });
        return Ok(new { message = "Registered successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (ok, error, user) = await _auth.ValidateLoginAsync(req.Email, req.Password);
        if (!ok || user is null) return Unauthorized(new { message = error });
        var token = _auth.CreateJwt(user);
        return Ok(new
        {
            token,
            user = new { user.Id, user.Name, user.Email, isAdmin = user.IsAdmin }
        });
    }
}

