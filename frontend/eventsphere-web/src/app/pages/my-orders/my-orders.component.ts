import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api/api.service';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [AsyncPipe, DatePipe, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, LoadingBlockComponent, EmptyStateComponent],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent {
  private readonly api = inject(ApiService);
  readonly orders$ = this.api.myOrders();
  readonly itemsCount = computed(() => (o: any) => (o.items ?? []).reduce((a: number, b: any) => a + (b.quantity ?? 0), 0));
  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));
}

