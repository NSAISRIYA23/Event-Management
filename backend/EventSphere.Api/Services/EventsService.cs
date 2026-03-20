using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class EventsService
{
    private const string EventsFile = "events.json";
    private readonly IJsonStore _store;

    public EventsService(IJsonStore store)
    {
        _store = store;
    }

    public Task<List<Event>> GetAllAsync() => _store.ReadListAsync<Event>(EventsFile);

    public async Task<Event?> GetByIdAsync(string id)
    {
        var items = await _store.ReadListAsync<Event>(EventsFile);
        return items.FirstOrDefault(e => e.Id == id);
    }

    public async Task<Event> CreateAsync(Event e)
    {
        var items = await _store.ReadListAsync<Event>(EventsFile);
        e.Id = Guid.NewGuid().ToString("N");
        e.CreatedAtUtc = DateTime.UtcNow;
        e.UpdatedAtUtc = e.CreatedAtUtc;
        items.Add(e);
        await _store.WriteListAsync(EventsFile, items);
        return e;
    }

    public async Task<Event?> UpdateAsync(string id, Event patch)
    {
        var items = await _store.ReadListAsync<Event>(EventsFile);
        var existing = items.FirstOrDefault(x => x.Id == id);
        if (existing is null) return null;

        existing.Title = patch.Title;
        existing.Description = patch.Description;
        existing.Location = patch.Location;
        existing.StartUtc = patch.StartUtc;
        existing.EndUtc = patch.EndUtc;
        existing.Price = patch.Price;
        existing.Capacity = patch.Capacity;
        existing.CategoryId = patch.CategoryId;
        existing.CoverImageUrl = patch.CoverImageUrl;
        existing.IsActive = patch.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _store.WriteListAsync(EventsFile, items);
        return existing;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var items = await _store.ReadListAsync<Event>(EventsFile);
        var removed = items.RemoveAll(x => x.Id == id) > 0;
        if (!removed) return false;
        await _store.WriteListAsync(EventsFile, items);
        return true;
    }
}

