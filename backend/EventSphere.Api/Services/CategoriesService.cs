using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class CategoriesService
{
    private const string CategoriesFile = "categories.json";
    private readonly IJsonStore _store;

    public CategoriesService(IJsonStore store)
    {
        _store = store;
    }

    public Task<List<Category>> GetAllAsync() => _store.ReadListAsync<Category>(CategoriesFile);

    public async Task<Category> CreateAsync(string name)
    {
        var items = await _store.ReadListAsync<Category>(CategoriesFile);
        var existing = items.FirstOrDefault(c => c.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (existing is not null) return existing;

        var c = new Category { Name = name.Trim() };
        items.Add(c);
        await _store.WriteListAsync(CategoriesFile, items);
        return c;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var items = await _store.ReadListAsync<Category>(CategoriesFile);
        var removed = items.RemoveAll(x => x.Id == id) > 0;
        if (!removed) return false;
        await _store.WriteListAsync(CategoriesFile, items);
        return true;
    }
}

