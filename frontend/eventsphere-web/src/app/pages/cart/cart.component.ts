import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/cart/cart.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly lines = this.cart.lines;
  readonly total = this.cart.total;
  readonly isLoggedIn = this.auth.isLoggedIn;

  placing = signal(false);
  msg = signal('');

  placeOrder() {
    if (!this.isLoggedIn()) {
      this.msg.set('Please log in to place an order.');
      this.router.navigateByUrl('/login');
      return;
    }
    if (this.lines().length === 0) return;
    this.router.navigateByUrl('/payment?mode=order');
  }

  remove(productId: string) {
    this.cart.remove(productId);
  }

  setQty(productId: string, qty: number) {
    this.cart.setQuantity(productId, qty);
  }
}

