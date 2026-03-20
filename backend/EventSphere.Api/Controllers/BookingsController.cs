using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class BookingsController : ControllerBase
{
    private readonly BookingsService _bookings;

    public BookingsController(BookingsService bookings)
    {
        _bookings = bookings;
    }

    public sealed record CreateBookingRequest(string EventId, int Quantity, string PaymentMethod);

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest req)
    {
        var userId = User.GetUserId();
        var (ok, error, booking) = await _bookings.CreateAsync(userId, req.EventId, req.Quantity, req.PaymentMethod);
        if (!ok) return BadRequest(new { message = error });
        return Ok(booking);
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<List<Booking>>> Mine()
        => Ok(await _bookings.GetForUserAsync(User.GetUserId()));

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<ActionResult<List<Booking>>> GetAll()
        => Ok(await _bookings.GetAllAsync());
}

