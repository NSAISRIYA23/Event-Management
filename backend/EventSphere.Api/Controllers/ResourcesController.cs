using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ResourcesController : ControllerBase
{
    private readonly ResourcesService _resources;

    public sealed class ResourceUploadRequest
    {
        [FromForm(Name = "title")]
        public string Title { get; set; } = "";

        [FromForm(Name = "description")]
        public string? Description { get; set; }

        [FromForm(Name = "eventId")]
        public string? EventId { get; set; }

        public IFormFile File { get; set; } = default!;
    }

    public ResourcesController(ResourcesService resources)
    {
        _resources = resources;
    }

    [HttpGet]
    public async Task<ActionResult<List<ResourceItem>>> GetAll()
        => Ok(await _resources.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResourceItem>> GetById(string id)
    {
        var r = await _resources.GetByIdAsync(id);
        return r is null ? NotFound() : Ok(r);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> Upload([FromForm] ResourceUploadRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Title is required." });
        if (req.File is null || req.File.Length == 0) return BadRequest(new { message = "File is required." });

        var res = await _resources.CreateAsync(req.Title, req.Description ?? "", req.EventId ?? "", req.File);
        return Ok(res);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => (await _resources.DeleteAsync(id)) ? NoContent() : NotFound();
}

