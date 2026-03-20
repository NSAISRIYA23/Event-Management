using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class OrdersService
{
    private const string OrdersFile = "orders.json";
    private const string UsersFile = "users.json";

    private readonly IJsonStore _store;
    private readonly ProductsService _products;
    private readonly BookingFileService _bookingFiles;

    public OrdersService(IJsonStore store, ProductsService products, BookingFileService bookingFiles)
    {
        _store = store;
        _products = products;
        _bookingFiles = bookingFiles;
    }

    public Task<List<Order>> GetAllAsync() => _store.ReadListAsync<Order>(OrdersFile);

    public async Task<List<Order>> GetForUserAsync(string userId)
    {
        var items = await _store.ReadListAsync<Order>(OrdersFile);
        return items.Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAtUtc).ToList();
    }

    public sealed record CreateOrderItem(string ProductId, int Quantity);

    public async Task<(bool ok, string error, Order? order)> CreateAsync(string userId, List<CreateOrderItem> items, string paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(userId)) return (false, "Unauthorized.", null);
        if (items is null || items.Count == 0) return (false, "Order must contain at least one item.", null);
        if (string.IsNullOrWhiteSpace(paymentMethod)) return (false, "Payment method is required.", null);

        var products = await _products.GetAllAsync();
        var order = new Order
        {
            UserId = userId,
            PaymentMethod = paymentMethod,
            Status = "placed",
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var i in items)
        {
            if (string.IsNullOrWhiteSpace(i.ProductId)) return (false, "Invalid product.", null);
            if (i.Quantity <= 0) return (false, "Quantity must be greater than 0.", null);

            var p = products.FirstOrDefault(x => x.Id == i.ProductId && x.IsActive);
            if (p is null) return (false, $"Product not found: {i.ProductId}", null);
            if (p.Stock >= 0 && p.Stock < i.Quantity) return (false, $"Insufficient stock for {p.Name}", null);

            var lineTotal = p.Price * i.Quantity;
            order.Items.Add(new OrderItem
            {
                ProductId = p.Id,
                Name = p.Name,
                Quantity = i.Quantity,
                UnitPrice = p.Price,
                LineTotal = lineTotal
            });
            order.TotalAmount += lineTotal;
        }

        // Reduce stock (simple, no payment)
        foreach (var li in order.Items)
        {
            var p = products.First(x => x.Id == li.ProductId);
            p.Stock = Math.Max(0, p.Stock - li.Quantity);
            p.UpdatedAtUtc = DateTime.UtcNow;
        }
        await _store.WriteListAsync("products.json", products);

        var orders = await _store.ReadListAsync<Order>(OrdersFile);
        var users = await _store.ReadListAsync<User>(UsersFile);
        var userName = users.FirstOrDefault(u => u.Id == userId)?.Name ?? "Valued customer";
        order.ReceiptPdfUrl = await _bookingFiles.GenerateOrderReceiptPdfAsync(order.Id, userName, order.Items, order.TotalAmount, paymentMethod, order.CreatedAtUtc);

        orders.Add(order);
        await _store.WriteListAsync(OrdersFile, orders);

        return (true, "", order);
    }
}

