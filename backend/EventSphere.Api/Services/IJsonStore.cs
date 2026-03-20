namespace EventSphere.Api.Services;

public interface IJsonStore
{
    Task EnsureDataFilesExistAsync();
    Task<List<T>> ReadListAsync<T>(string fileName);
    Task WriteListAsync<T>(string fileName, List<T> items);
}

