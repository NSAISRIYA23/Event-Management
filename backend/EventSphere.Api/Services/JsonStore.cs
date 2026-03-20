using System.Collections.Concurrent;
using System.Text.Json;

namespace EventSphere.Api.Services;

public sealed class JsonStore : IJsonStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private readonly AppPaths _paths;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    public JsonStore(AppPaths paths)
    {
        _paths = paths;
    }

    public async Task EnsureDataFilesExistAsync()
    {
        var files = new[]
        {
            "users.json",
            "events.json",
            "bookings.json",
            "products.json",
            "orders.json",
            "resources.json",
            "categories.json"
        };

        foreach (var f in files)
        {
            var path = Path.Combine(_paths.DataRoot, f);
            if (File.Exists(path)) continue;
            await File.WriteAllTextAsync(path, "[]");
        }
    }

    public async Task<List<T>> ReadListAsync<T>(string fileName)
    {
        var path = Path.Combine(_paths.DataRoot, fileName);
        var gate = _locks.GetOrAdd(path, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();
        try
        {
            if (!File.Exists(path)) return [];
            var json = await File.ReadAllTextAsync(path);
            if (string.IsNullOrWhiteSpace(json)) return [];
            return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? [];
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task WriteListAsync<T>(string fileName, List<T> items)
    {
        var path = Path.Combine(_paths.DataRoot, fileName);
        var gate = _locks.GetOrAdd(path, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();
        try
        {
            var json = JsonSerializer.Serialize(items, JsonOptions);
            await File.WriteAllTextAsync(path, json);
        }
        finally
        {
            gate.Release();
        }
    }
}

