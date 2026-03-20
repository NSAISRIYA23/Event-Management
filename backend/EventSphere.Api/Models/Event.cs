namespace EventSphere.Api.Models;

public sealed class Event
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartUtc { get; set; } = DateTime.UtcNow.AddDays(7);
    public DateTime EndUtc { get; set; } = DateTime.UtcNow.AddDays(7).AddHours(2);
    public decimal Price { get; set; }
    public int Capacity { get; set; } = 100;
    public string CategoryId { get; set; } = "";
    public string CoverImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

