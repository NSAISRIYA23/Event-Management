namespace EventSphere.Api.Models;

public sealed class ResourceItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string EventId { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string OriginalFileName { get; set; } = "";
    public long FileSizeBytes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

