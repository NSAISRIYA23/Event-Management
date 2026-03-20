import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { CartService } from '../../core/cart/cart.service';
import { Product } from '../../core/api/api.models';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    LoadingBlockComponent,
    EmptyStateComponent
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);

  readonly products$ = this.api.products();
  readonly imageOrigin = environment.apiBaseUrl.replace(/\/api\/?$/, '/');
  private readonly fallbackImage = this.imageOrigin + 'uploads/placeholder-product.svg';

  add(p: Product) {
    this.cart.add(p, 1);
  }

  imgSrc(imageUrl?: string) {
    const url = (imageUrl ?? '').trim();
    if (!url) return this.fallbackImage;
    if (/^https?:\/\//i.test(url)) return url;
    return this.imageOrigin + url.replace(/^\//, '');
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.fallbackImage;
  }

  getProductImage(index: number): string {
    const images = [
      'https://plus.unsplash.com/premium_photo-1729000859432-ea513184898b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmlwJTIwYWNjZXNzfGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1618354691714-7d92150909db?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dHNoaXJ0JTJCYmFkZ2V8ZW58MHx8MHx8fDA%3D',
      'https://plus.unsplash.com/premium_photo-1661962361950-dc99c0257825?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8d29ya3Nob3AlMjBraXQlMjBub3RlcyUyQnBlbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1764643588158-79ac8406f87b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VhdGluZyUyMHVwZ3JhZGUlMjBpbiUyMGNvbmNlcnRzfGVufDB8fDB8fHww',
      'https://media.istockphoto.com/id/1301603128/photo/happy-excited-black-man-jumping-in-neon-light-over-purple-background-full-length.webp?a=1&b=1&s=612x612&w=0&k=20&c=sEzu4jC_uzhSuMgwYmM2Ohh9rQjzGAeMtVl8Au1KKNQ=',
      'https://plus.unsplash.com/premium_photo-1700830328095-26c5a1c053b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVjaCUyMHN1bW1pdCUyMGJhZGdlfGVufDB8fDB8fHww',
      'https://plus.unsplash.com/premium_photo-1674571895797-3ca2aaf89eed?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29sbGVnZSUyMGxvZ298ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1578237493287-8d4d2b03591a?q=80&w=626&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://plus.unsplash.com/premium_vector-1719954748245-15d232e27437?w=352&dpr=2&h=367&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
      'https://images.unsplash.com/photo-1763770472374-b68e6729a46f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3VwcG9ydCUyMGtpdHxlbnwwfHwwfHx8MA%3D%3D'
    ];
    return images[index % images.length];
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  }
}

