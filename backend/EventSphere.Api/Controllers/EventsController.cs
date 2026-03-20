using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EventsController : ControllerBase
{
    private readonly EventsService _events;

    public EventsController(EventsService events)
    {
        _events = events;
    }

    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetAll()
        => Ok(await _events.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetById(string id)
    {
        var ev = await _events.GetByIdAsync(id);
        return ev is null ? NotFound() : Ok(ev);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<Event>> Create([FromBody] Event e)
        => Ok(await _events.CreateAsync(e));

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Event>> Update(string id, [FromBody] Event e)
    {
        var updated = await _events.UpdateAsync(id, e);
        return updated is null ? NotFound() : Ok(updated);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => (await _events.DeleteAsync(id)) ? NoContent() : NotFound();
}

