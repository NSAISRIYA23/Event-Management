# EventSphere

EventSphere is a full-stack event management and marketplace platform built with:

- ASP.NET Core Web API (`.NET 8`) for backend services
- Angular (`v21`) + Angular Material for frontend UI
- JWT-based authentication and role-based admin capabilities
- File-backed JSON data store for events, products, bookings, orders, and resources
- PDF invoice generation using `QuestPDF`

## Project Structure

```text
Event Management/
  backend/
    EventSphere.Api/        # ASP.NET Core API
  frontend/
    eventsphere-web/        # Angular web app
```

## Core Features

- User registration/login with JWT authentication
- Browse and book events
- Marketplace with cart and checkout flow
- Payment simulation and booking/order confirmation
- Downloadable invoice/PDF
- Resource center for event-related documents
- User history pages (`My Bookings`, `My Orders`)
- Admin area for managing event data

## Tech Stack

### Frontend

- Angular 21
- Angular Material
- RxJS
- TypeScript

### Backend

- ASP.NET Core 8 Web API
- JWT Bearer authentication
- Swagger/OpenAPI (enabled in development)
- QuestPDF

## Prerequisites

- Node.js (LTS recommended) and npm
- .NET SDK 8.0+
- Git (optional, recommended)

## Local Development

### 1) Backend API

From `backend/EventSphere.Api`:

```powershell
dotnet restore
dotnet run
```

By default, API runs on localhost (development profile).  
The frontend development environment currently points to:

`http://localhost:5067/api`

### 2) Frontend App

From `frontend/eventsphere-web`:

```powershell
npm install
npm start
```

Open:

`http://localhost:4200`

## Build Commands

### Backend (Release)

```powershell
cd backend/EventSphere.Api
dotnet build -c Release
```

### Frontend (Production)

```powershell
cd frontend/eventsphere-web
ng build --configuration production
```

Production frontend output:

`frontend/eventsphere-web/dist/eventsphere-web`

## Configuration

## Frontend Environment Files

- `frontend/eventsphere-web/src/environments/environment.ts` (development)
- `frontend/eventsphere-web/src/environments/environment.prod.ts` (production)

Production API base URL is currently:

`/api`

This is intended for reverse-proxy deployment where the same host serves frontend and proxies `/api` to backend.

## Backend Configuration

`backend/EventSphere.Api/appsettings.json`:

- `Jwt:Key` - set a strong production secret
- `Jwt:Issuer`
- `Jwt:Audience`
- `Cors:AllowedOrigins` - add frontend domain(s) in production

Example:

```json
"Cors": {
  "AllowedOrigins": [
    "https://your-frontend-domain.com"
  ]
}
```

## Deployment Notes

- Swagger is enabled only in development.
- CORS is permissive in development; in production it uses `Cors:AllowedOrigins`.
- Do not deploy with the default JWT key.
- Ensure static uploads route is reachable at `/uploads`.
- Configure reverse proxy:
  - serve Angular build as static site
  - route `/api/*` to ASP.NET API
  - route `/uploads/*` to backend/static file handling

## Suggested Production Flow

1. Build backend in release mode.
2. Build frontend in production mode.
3. Deploy backend service.
4. Deploy frontend `dist` artifacts.
5. Configure proxy rules (`/api`, `/uploads`).
6. Set production `Jwt` and `Cors` values.
7. Smoke test login, bookings, cart, payment simulation, and invoice download.

## Troubleshooting

- If Angular build fails with transient Windows crash code `-1073741819`, retry build.
- If lists are not rendering, verify backend API is running and frontend `apiBaseUrl` points correctly.
- If images do not load, verify backend static file serving and `/uploads` route.

## License

Internal project / educational use unless otherwise specified.
