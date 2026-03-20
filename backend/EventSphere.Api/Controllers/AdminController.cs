using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public sealed class AdminController : ControllerBase
{
    private readonly EventsService _events;
    private readonly BookingsService _bookings;
    private readonly OrdersService _orders;

    public AdminController(EventsService events, BookingsService bookings, OrdersService orders)
    {
        _events = events;
        _bookings = bookings;
        _orders = orders;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var events = await _events.GetAllAsync();
        var bookings = await _bookings.GetAllAsync();
        var orders = await _orders.GetAllAsync();

        return Ok(new
        {
            totalEvents = events.Count,
            totalBookings = bookings.Count,
            totalOrders = orders.Count
        });
    }
}

