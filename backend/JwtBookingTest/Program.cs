using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

var backendBase = "http://localhost:5067";
var userId = "0a4fd57cf5584fa086befc09e72544f6"; // from backend data/users.json (admin)
var email = "test@gmail.com";
var name = "test";
var isAdmin = "true";

var jwtKey = "DEV_ONLY_CHANGE_ME__EventSphere_JWT_Key_32_chars_min";
var issuer = "EventSphere";
var audience = "EventSphere";

var paymentMethod = "UPI";
var eventId = "evt_techsummit_2026";
var quantity = 1;

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

var claims = new List<Claim>
{
    new(JwtRegisteredClaimNames.Sub, userId),
    new(JwtRegisteredClaimNames.Email, email),
    new("name", name),
    new("isAdmin", isAdmin)
};

var token = new JwtSecurityToken(
    issuer: issuer,
    audience: audience,
    claims: claims,
    expires: DateTime.UtcNow.AddDays(1),
    signingCredentials: creds);

var jwt = new JwtSecurityTokenHandler().WriteToken(token);

using var http = new HttpClient();
http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwt);

var bookingReq = new
{
    eventId,
    quantity,
    paymentMethod
};

var resp = await http.PostAsJsonAsync($"{backendBase}/api/bookings", bookingReq);
Console.WriteLine($"POST /api/bookings -> {(int)resp.StatusCode} {resp.ReasonPhrase}");
var body = await resp.Content.ReadAsStringAsync();
Console.WriteLine(body);

if (!resp.IsSuccessStatusCode) return;

var booking = JsonSerializer.Deserialize<JsonElement>(body);
var pdfUrl = booking.TryGetProperty("confirmationPdfUrl", out var pdf) ? pdf.GetString() : null;

Console.WriteLine($"confirmationPdfUrl: {pdfUrl}");

if (string.IsNullOrWhiteSpace(pdfUrl)) return;

// Ensure file exists on disk.
var pdfPath = System.IO.Path.Combine("C:\\Event Management\\backend\\EventSphere.Api\\uploads\\confirmations", System.IO.Path.GetFileName(pdfUrl));
Console.WriteLine($"pdfPath: {pdfPath} exists={System.IO.File.Exists(pdfPath)}");

