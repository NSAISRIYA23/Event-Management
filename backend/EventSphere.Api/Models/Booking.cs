namespace EventSphere.Api.Models;

public sealed class Booking
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string EventId { get; set; } = "";
    public int Quantity { get; set; } = 1;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "";
    public string Status { get; set; } = "confirmed";
    public string ConfirmationFileUrl { get; set; } = "";
    public string ConfirmationPdfUrl { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

