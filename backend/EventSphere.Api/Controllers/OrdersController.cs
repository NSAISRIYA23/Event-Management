using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController : ControllerBase
{
    private readonly OrdersService _orders;

    public OrdersController(OrdersService orders)
    {
        _orders = orders;
    }

    public sealed record CreateOrderRequest(List<OrdersService.CreateOrderItem> Items, string PaymentMethod);

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var userId = User.GetUserId();
        var (ok, error, order) = await _orders.CreateAsync(userId, req.Items ?? [], req.PaymentMethod);
        if (!ok) return BadRequest(new { message = error });
        return Ok(order);
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<List<Order>>> Mine()
        => Ok(await _orders.GetForUserAsync(User.GetUserId()));

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetAll()
        => Ok(await _orders.GetAllAsync());
}

