using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class ResourcesService
{
    private const string ResourcesFile = "resources.json";

    private readonly IJsonStore _store;
    private readonly AppPaths _paths;

    public ResourcesService(IJsonStore store, AppPaths paths)
    {
        _store = store;
        _paths = paths;
    }

    public Task<List<ResourceItem>> GetAllAsync() => _store.ReadListAsync<ResourceItem>(ResourcesFile);

    public async Task<ResourceItem?> GetByIdAsync(string id)
    {
        var items = await _store.ReadListAsync<ResourceItem>(ResourcesFile);
        return items.FirstOrDefault(r => r.Id == id);
    }

    public async Task<ResourceItem> CreateAsync(string title, string description, string eventId, IFormFile file)
    {
        var items = await _store.ReadListAsync<ResourceItem>(ResourcesFile);

        var dir = Path.Combine(_paths.UploadsRoot, "resources");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".bin";

        var safeId = Guid.NewGuid().ToString("N");
        var fileName = $"res_{safeId}{ext}";
        var fullPath = Path.Combine(dir, fileName);

        await using (var fs = File.Create(fullPath))
        {
            await file.CopyToAsync(fs);
        }

        var res = new ResourceItem
        {
            Title = title.Trim(),
            Description = description?.Trim() ?? "",
            EventId = eventId?.Trim() ?? "",
            FileUrl = $"/uploads/resources/{fileName}",
            OriginalFileName = file.FileName,
            FileSizeBytes = file.Length,
            CreatedAtUtc = DateTime.UtcNow
        };

        items.Add(res);
        await _store.WriteListAsync(ResourcesFile, items);
        return res;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var items = await _store.ReadListAsync<ResourceItem>(ResourcesFile);
        var existing = items.FirstOrDefault(r => r.Id == id);
        if (existing is null) return false;

        items.Remove(existing);
        await _store.WriteListAsync(ResourcesFile, items);

        // Best-effort delete physical file
        try
        {
            if (existing.FileUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            {
                var rel = existing.FileUrl.Replace("/", Path.DirectorySeparatorChar.ToString()).TrimStart(Path.DirectorySeparatorChar);
                var full = Path.Combine(_paths.ContentRoot, rel);
                if (File.Exists(full)) File.Delete(full);
            }
        }
        catch { /* ignore */ }

        return true;
    }
}

