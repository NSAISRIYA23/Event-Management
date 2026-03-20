using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EventSphere.Api.Services;

public sealed class BookingFileService
{
    private readonly AppPaths _paths;
    private static bool _licenseSet;

    public BookingFileService(AppPaths paths)
    {
        _paths = paths;
    }

    public async Task<string> GenerateConfirmationAsync(string bookingId, string content)
    {
        var confirmationsDir = Path.Combine(_paths.UploadsRoot, "confirmations");
        Directory.CreateDirectory(confirmationsDir);

        var fileName = $"booking_{bookingId}.txt";
        var fullPath = Path.Combine(confirmationsDir, fileName);
        await File.WriteAllTextAsync(fullPath, content, Encoding.UTF8);

        return $"/uploads/confirmations/{fileName}";
    }

    public Task<string> GenerateConfirmationPdfAsync(
        string bookingId,
        string attendeeName,
        string eventTitle,
        DateTime eventStartUtc,
        string location,
        int quantity,
        decimal totalAmount,
        DateTime bookingCreatedAtUtc,
        string paymentMethod)
    {
        if (!_licenseSet)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            _licenseSet = true;
        }

        var confirmationsDir = Path.Combine(_paths.UploadsRoot, "confirmations");
        Directory.CreateDirectory(confirmationsDir);

        var fileName = $"booking_{bookingId}.pdf";
        var fullPath = Path.Combine(confirmationsDir, fileName);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                page.Header().Column(col =>
                {
                    col.Item().Text("EventSphere").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
                    col.Item().PaddingTop(2).Text("Booking Confirmation").FontSize(16).SemiBold().FontColor(Colors.Grey.Darken2);
                });

                page.Content().Column(col =>
                {
                    col.Item().PaddingTop(10).Text(eventTitle).FontSize(14).SemiBold();
                    col.Item().PaddingTop(4).Text($"Attendee: {attendeeName}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Booking ID: {bookingId}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Booked on: {bookingCreatedAtUtc:yyyy-MM-dd HH:mm} UTC").FontSize(12);

                    col.Item().PaddingTop(14).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

                    col.Item().PaddingTop(12).Text($"Event start: {eventStartUtc:yyyy-MM-dd HH:mm} UTC").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Location: {location}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Tickets: {quantity}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Total Amount: {totalAmount:0} INR").FontSize(12);

                    col.Item().PaddingTop(2).Text($"Payment Method: {paymentMethod}").FontSize(12);

                    col.Item().PaddingTop(18).Text("Thank you for booking with EventSphere!").FontSize(12).SemiBold();
                    col.Item().PaddingTop(6).Text("Have an amazing event experience.").FontSize(11).FontColor(Colors.Grey.Darken2);
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("EventSphere").SemiBold();
                    x.Span(" • Built for event management + marketplace").FontSize(9).FontColor(Colors.Grey.Darken2);
                });
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        var bytes = stream.ToArray();
        return Task.FromResult(SavePdf(fullPath, bytes));

        static string SavePdf(string path, byte[] data)
        {
            File.WriteAllBytes(path, data);
            return $"/uploads/confirmations/{Path.GetFileName(path)}";
        }
    }

    public Task<string> GenerateOrderReceiptPdfAsync(
        string orderId,
        string customerName,
        List<EventSphere.Api.Models.OrderItem> items,
        decimal totalAmount,
        string paymentMethod,
        DateTime createdAtUtc)
    {
        if (!_licenseSet)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            _licenseSet = true;
        }

        var confirmationsDir = Path.Combine(_paths.UploadsRoot, "confirmations");
        Directory.CreateDirectory(confirmationsDir);

        var fileName = $"order_{orderId}.pdf";
        var fullPath = Path.Combine(confirmationsDir, fileName);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                page.Header().Column(col =>
                {
                    col.Item().Text("EventSphere").FontSize(20).SemiBold().FontColor(Colors.Grey.Darken4);
                    col.Item().PaddingTop(2).Text("Order Receipt").FontSize(16).SemiBold().FontColor(Colors.Grey.Darken2);
                });

                page.Content().Column(col =>
                {
                    col.Item().PaddingTop(10).Text($"Customer: {customerName}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Order ID: {orderId}").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Order Date: {createdAtUtc:yyyy-MM-dd HH:mm} UTC").FontSize(12);
                    col.Item().PaddingTop(2).Text($"Payment Method: {paymentMethod}").FontSize(12);

                    col.Item().PaddingTop(14).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

                    foreach (var item in items)
                    {
                        col.Item().PaddingTop(8).Row(r =>
                        {
                            r.RelativeItem().Text($"{item.Name} x {item.Quantity}").FontSize(11);
                            r.ConstantItem(120).AlignRight().Text($"{item.LineTotal:0} INR").FontSize(11).SemiBold();
                        });
                    }

                    col.Item().PaddingTop(14).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                    col.Item().PaddingTop(10).AlignRight().Text($"Total: {totalAmount:0} INR").FontSize(14).SemiBold();

                    col.Item().PaddingTop(18).Text("Payment successful. Order received.").FontSize(12).SemiBold();
                    col.Item().PaddingTop(6).Text("Thank you for shopping with EventSphere.").FontSize(11).FontColor(Colors.Grey.Darken2);
                });
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        File.WriteAllBytes(fullPath, stream.ToArray());
        return Task.FromResult($"/uploads/confirmations/{fileName}");
    }
}

