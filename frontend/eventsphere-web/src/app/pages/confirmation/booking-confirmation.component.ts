import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/api/api.service';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { InvoiceService } from '../../core/pdf/invoice.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    EmptyStateComponent
  ],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css'
})
export class BookingConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly invoice = inject(InvoiceService);

  private readonly bookingId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));

  readonly booking$ = this.api.myBookings().pipe(
    map(items => items.find(b => b.id === this.bookingId) ?? null)
  );

  readonly event$ = this.booking$.pipe(
    switchMap(b => (b ? this.api.event(b.eventId) : of(null)))
  );

  backToBookings() {
    this.router.navigateByUrl('/my-bookings');
  }

  downloadInvoice(booking: any, event: any | null) {
    this.invoice.downloadBookingInvoice({
      bookingId: booking.id,
      createdAtUtc: booking.createdAtUtc,
      paymentMethod: booking.paymentMethod,
      quantity: booking.quantity,
      totalAmount: booking.totalAmount,
      eventTitle: event?.title,
      eventLocation: event?.location,
      eventStartUtc: event?.startUtc
    });
  }
}

