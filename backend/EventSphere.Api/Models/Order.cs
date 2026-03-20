namespace EventSphere.Api.Models;

public sealed class Order
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public List<OrderItem> Items { get; set; } = [];
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "";
    public string ReceiptPdfUrl { get; set; } = "";
    public string Status { get; set; } = "placed";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class OrderItem
{
    public string ProductId { get; set; } = "";
    public string Name { get; set; } = "";
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

