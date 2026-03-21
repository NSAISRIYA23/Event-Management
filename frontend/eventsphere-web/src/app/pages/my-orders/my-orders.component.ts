import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api/api.service';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';
import { InvoiceService } from '../../core/pdf/invoice.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [AsyncPipe, DatePipe, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, LoadingBlockComponent, EmptyStateComponent],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent {
  private readonly api = inject(ApiService);
  private readonly invoice = inject(InvoiceService);
  readonly orders$ = this.api.myOrders();
  readonly itemsCount = computed(() => (o: any) => (o.items ?? []).reduce((a: number, b: any) => a + (b.quantity ?? 0), 0));
  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));

  downloadInvoice(o: any) {
    this.invoice.downloadOrderInvoice({
      orderId: o.id,
      createdAtUtc: o.createdAtUtc,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
      lines: (o.items ?? []).map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal
      }))
    });
  }
}

