using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using EventSphere.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EventSphere API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

    options.AddPolicy("app", p =>
    {
        p.AllowAnyHeader()
         .AllowAnyMethod();

        if (builder.Environment.IsDevelopment())
        {
            p.AllowCredentials()
             .SetIsOriginAllowed(_ => true);
            return;
        }

        if (allowedOrigins.Length > 0)
        {
            p.WithOrigins(allowedOrigins)
             .AllowCredentials();
        }
    });
});

builder.Services.AddSingleton<AppPaths>();
builder.Services.AddSingleton<IJsonStore, JsonStore>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<BookingFileService>();
builder.Services.AddSingleton<EventsService>();
builder.Services.AddSingleton<CategoriesService>();
builder.Services.AddSingleton<ProductsService>();
builder.Services.AddSingleton<BookingsService>();
builder.Services.AddSingleton<OrdersService>();
builder.Services.AddSingleton<ResourcesService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "DEV_ONLY_CHANGE_ME__EventSphere_JWT_Key_32_chars_min";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EventSphere";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EventSphere";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireClaim("isAdmin", "true"));
});

var app = builder.Build();

app.Services.GetRequiredService<AppPaths>().EnsureFoldersExist();
await app.Services.GetRequiredService<IJsonStore>().EnsureDataFilesExistAsync();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("app");

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        app.Services.GetRequiredService<AppPaths>().UploadsRoot),
    RequestPath = "/uploads"
});

app.MapControllers();

app.Run();
