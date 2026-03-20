import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'events', loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent) },
      {
        path: 'events/:id',
        loadComponent: () => import('./pages/event-details/event-details.component').then(m => m.EventDetailsComponent)
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
      },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
      {
        path: 'payment',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'confirmation/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent)
      },
      {
        path: 'my-bookings',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
      },
      {
        path: 'my-orders',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      { path: 'resources', loadComponent: () => import('./pages/resources/resources.component').then(m => m.ResourcesComponent) }
    ]
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./admin/manage-events/manage-events.component').then(m => m.ManageEventsComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./admin/manage-products/manage-products.component').then(m => m.ManageProductsComponent)
      },
      {
        path: 'resources',
        loadComponent: () => import('./admin/manage-resources/manage-resources.component').then(m => m.ManageResourcesComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
