using EventSphere.Api.Models;

namespace EventSphere.Api.Services;

public sealed class BookingsService
{
    private const string BookingsFile = "bookings.json";
    private const string UsersFile = "users.json";

    private readonly IJsonStore _store;
    private readonly EventsService _events;
    private readonly BookingFileService _bookingFiles;

    public BookingsService(IJsonStore store, EventsService events, BookingFileService bookingFiles)
    {
        _store = store;
        _events = events;
        _bookingFiles = bookingFiles;
    }

    public Task<List<Booking>> GetAllAsync() => _store.ReadListAsync<Booking>(BookingsFile);

    public async Task<List<Booking>> GetForUserAsync(string userId)
    {
        var items = await _store.ReadListAsync<Booking>(BookingsFile);
        return items.Where(b => b.UserId == userId).OrderByDescending(b => b.CreatedAtUtc).ToList();
    }

    public async Task<(bool ok, string error, Booking? booking)> CreateAsync(string userId, string eventId, int quantity, string paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(userId)) return (false, "Unauthorized.", null);
        if (string.IsNullOrWhiteSpace(eventId)) return (false, "EventId is required.", null);
        if (quantity <= 0) return (false, "Quantity must be greater than 0.", null);
        if (string.IsNullOrWhiteSpace(paymentMethod)) return (false, "Payment method is required.", null);

        var ev = await _events.GetByIdAsync(eventId);
        if (ev is null || !ev.IsActive) return (false, "Event not found.", null);

        var bookings = await _store.ReadListAsync<Booking>(BookingsFile);

        var totalBooked = bookings.Where(b => b.EventId == eventId && b.Status == "confirmed").Sum(b => b.Quantity);
        if (ev.Capacity > 0 && totalBooked + quantity > ev.Capacity)
            return (false, "Not enough capacity remaining.", null);

        var booking = new Booking
        {
            UserId = userId,
            EventId = eventId,
            Quantity = quantity,
            TotalAmount = ev.Price * quantity,
            PaymentMethod = paymentMethod,
            Status = "confirmed",
            CreatedAtUtc = DateTime.UtcNow
        };

        var users = await _store.ReadListAsync<User>(UsersFile);
        var userName = users.FirstOrDefault(u => u.Id == userId)?.Name;
        userName ??= "Valued attendee";

        var confirmationText =
$@"EventSphere
========================================
        Booking Confirmation
========================================

Booking ID   : {booking.Id}
Attendee     : {userName}
Booking Date : {booking.CreatedAtUtc:yyyy-MM-dd}

Event        : {ev.Title}
Event Start  : {ev.StartUtc:yyyy-MM-dd HH:mm} UTC
Location     : {ev.Location}

Quantity     : {booking.Quantity}
Total Amount : {booking.TotalAmount}

----------------------------------------
Thank you for booking with EventSphere!
Have an amazing event experience.
----------------------------------------
";

        booking.ConfirmationFileUrl = await _bookingFiles.GenerateConfirmationAsync(booking.Id, confirmationText);
        booking.ConfirmationPdfUrl = await _bookingFiles.GenerateConfirmationPdfAsync(
            booking.Id,
            userName,
            ev.Title,
            ev.StartUtc,
            ev.Location,
            booking.Quantity,
            booking.TotalAmount,
            booking.CreatedAtUtc,
            paymentMethod
        );

        bookings.Add(booking);
        await _store.WriteListAsync(BookingsFile, bookings);

        return (true, "", booking);
    }
}

