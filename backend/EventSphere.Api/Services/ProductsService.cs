using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class ProductsService
{
    private const string ProductsFile = "products.json";
    private readonly IJsonStore _store;

    public ProductsService(IJsonStore store)
    {
        _store = store;
    }

    public Task<List<Product>> GetAllAsync() => _store.ReadListAsync<Product>(ProductsFile);

    public async Task<Product?> GetByIdAsync(string id)
    {
        var items = await _store.ReadListAsync<Product>(ProductsFile);
        return items.FirstOrDefault(p => p.Id == id);
    }

    public async Task<Product> CreateAsync(Product p)
    {
        var items = await _store.ReadListAsync<Product>(ProductsFile);
        p.Id = Guid.NewGuid().ToString("N");
        p.CreatedAtUtc = DateTime.UtcNow;
        p.UpdatedAtUtc = p.CreatedAtUtc;
        items.Add(p);
        await _store.WriteListAsync(ProductsFile, items);
        return p;
    }

    public async Task<Product?> UpdateAsync(string id, Product patch)
    {
        var items = await _store.ReadListAsync<Product>(ProductsFile);
        var existing = items.FirstOrDefault(x => x.Id == id);
        if (existing is null) return null;

        existing.Name = patch.Name;
        existing.Description = patch.Description;
        existing.Price = patch.Price;
        existing.Stock = patch.Stock;
        existing.ImageUrl = patch.ImageUrl;
        existing.IsActive = patch.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _store.WriteListAsync(ProductsFile, items);
        return existing;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var items = await _store.ReadListAsync<Product>(ProductsFile);
        var removed = items.RemoveAll(x => x.Id == id) > 0;
        if (!removed) return false;
        await _store.WriteListAsync(ProductsFile, items);
        return true;
    }
}

