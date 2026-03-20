using EventSphere.Api.Models;
using EventSphere.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController : ControllerBase
{
    private readonly ProductsService _products;

    public ProductsController(ProductsService products)
    {
        _products = products;
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll()
        => Ok(await _products.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(string id)
    {
        var p = await _products.GetByIdAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromBody] Product p)
        => Ok(await _products.CreateAsync(p));

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> Update(string id, [FromBody] Product p)
    {
        var updated = await _products.UpdateAsync(id, p);
        return updated is null ? NotFound() : Ok(updated);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => (await _products.DeleteAsync(id)) ? NoContent() : NotFound();
}

