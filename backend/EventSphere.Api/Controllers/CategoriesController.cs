using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CategoriesController : ControllerBase
{
    private readonly CategoriesService _categories;

    public CategoriesController(CategoriesService categories)
    {
        _categories = categories;
    }

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
        => Ok(await _categories.GetAllAsync());

    public sealed record CreateCategoryRequest(string Name);

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<Category>> Create([FromBody] CreateCategoryRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "Name is required." });
        return Ok(await _categories.CreateAsync(req.Name));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => (await _categories.DeleteAsync(id)) ? NoContent() : NotFound();
}

