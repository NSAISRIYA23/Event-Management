import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatOptionModule } from '@angular/material/core';
import { Order } from '../../core/api/api.models';
import { InvoiceService } from '../../core/pdf/invoice.service';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    LoadingBlockComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatOptionModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly invoice = inject(InvoiceService);

  readonly mode = this.route.snapshot.queryParamMap.get('mode') === 'order' ? 'order' : 'booking';
  private readonly eventId = this.route.snapshot.queryParamMap.get('eventId') ?? '';
  readonly quantity = Number(this.route.snapshot.queryParamMap.get('quantity') ?? '1');

  readonly event$ = this.api.event(this.eventId);
  readonly lines = this.cart.lines;
  readonly cartTotal = this.cart.total;
  readonly origin = environment.apiBaseUrl.replace(/\/api\/?$/, '');

  processing = false;
  msg = '';
  successMsg = '';
  receiptUrl = '';
  latestOrder: Order | null = null;

  paymentMethod: PaymentMethod = 'upi';

  // UPI
  upiId = 'demo.user@okicici';

  // Card
  cardNumber = '4111 1111 1111 1111';
  expiry = '12/30';
  cvv = '123';

  // Net banking
  bankCode = 'sbi';

  readonly paymentMethodLabel: Record<PaymentMethod, string> = {
    upi: 'UPI',
    card: 'Card',
    netbanking: 'Net Banking',
    cod: 'Cash on Delivery'
  };

  private validate(): string | null {
    if (this.mode === 'booking') {
      if (!this.eventId) return 'Missing event details. Please go back and try again.';
      if (this.quantity <= 0) return 'Quantity must be at least 1.';
    }

    if (this.mode === 'order' && this.lines().length === 0) return 'Cart is empty.';

    switch (this.paymentMethod) {
      case 'upi':
        return this.upiId.trim() ? null : 'UPI ID is required.';
      case 'card': {
        const card = this.cardNumber.replace(/\s+/g, '');
        if (card.length < 12 || card.length > 19) return 'Card number looks invalid.';
        if (!/^\d{2}\/\d{2}$/.test(this.expiry.trim())) return 'Expiry must be in MM/YY format.';
        if (!/^\d{3,4}$/.test(this.cvv.trim())) return 'CVV must be 3 or 4 digits.';
        return null;
      }
      case 'netbanking':
        return this.bankCode ? null : 'Select a bank to continue.';
      case 'cod':
        return null;
    }
  }

  payNow() {
    if (this.processing) return;
    this.msg = '';

    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const err = this.validate();
    if (err) {
      this.msg = err;
      return;
    }

    this.processing = true;
    const paymentMethodLabel = this.paymentMethodLabel[this.paymentMethod];

    // Simulate payment processing.
    setTimeout(() => {
      if (this.mode === 'booking') {
        this.api.createBooking(this.eventId, this.quantity, paymentMethodLabel).subscribe({
          next: b => {
            this.processing = false;
            this.router.navigateByUrl(`/confirmation/${encodeURIComponent(b.id)}`);
          },
          error: e => {
            this.processing = false;
            this.msg = e?.error?.message ?? 'Payment failed.';
          }
        });
        return;
      }

      const items = this.lines().map(l => ({ productId: l.productId, quantity: l.quantity }));
      this.api.createOrder(items, paymentMethodLabel).subscribe({
        next: order => {
          this.processing = false;
          this.successMsg = 'Payment successful. Order received.';
          this.receiptUrl = order.receiptPdfUrl ? this.origin + order.receiptPdfUrl : '';
          this.latestOrder = order;
          this.cart.clear();
        },
        error: e => {
          this.processing = false;
          this.msg = e?.error?.message ?? 'Payment failed.';
        }
      });
    }, 1200);
  }

  downloadOrderInvoice() {
    if (!this.latestOrder) return;
    this.invoice.downloadOrderInvoice({
      orderId: this.latestOrder.id,
      createdAtUtc: this.latestOrder.createdAtUtc,
      paymentMethod: this.latestOrder.paymentMethod,
      totalAmount: this.latestOrder.totalAmount,
      lines: this.latestOrder.items
    });
  }
}

