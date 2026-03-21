import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api/api.service';
import { environment } from '../../../environments/environment';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { InvoiceService } from '../../core/pdf/invoice.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    LoadingBlockComponent,
    EmptyStateComponent
  ],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent {
  private readonly api = inject(ApiService);
  private readonly invoice = inject(InvoiceService);
  readonly bookings$ = this.api.myBookings();

  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));

  downloadInvoice(b: {
    id: string;
    createdAtUtc: string;
    paymentMethod: string;
    quantity: number;
    totalAmount: number;
  }) {
    this.invoice.downloadBookingInvoice({
      bookingId: b.id,
      createdAtUtc: b.createdAtUtc,
      paymentMethod: b.paymentMethod,
      quantity: b.quantity,
      totalAmount: b.totalAmount
    });
  }
}

