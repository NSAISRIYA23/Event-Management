import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../api/api.models';

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

const CART_KEY = 'es_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _lines = signal<CartLine[]>(this.load());

  readonly lines = computed(() => this._lines());
  readonly count = computed(() => this._lines().reduce((a, b) => a + b.quantity, 0));
  readonly total = computed(() => this._lines().reduce((a, b) => a + b.quantity * b.unitPrice, 0));

  add(product: Product, quantity = 1) {
    const qty = Math.max(1, Math.floor(quantity));
    const lines = [...this._lines()];
    const existing = lines.find(l => l.productId === product.id);
    if (existing) existing.quantity += qty;
    else
      lines.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty
      });
    this.set(lines);
  }

  setQuantity(productId: string, quantity: number) {
    const qty = Math.max(0, Math.floor(quantity));
    const lines = [...this._lines()].map(l => (l.productId === productId ? { ...l, quantity: qty } : l));
    this.set(lines.filter(l => l.quantity > 0));
  }

  remove(productId: string) {
    this.set(this._lines().filter(l => l.productId !== productId));
  }

  clear() {
    this.set([]);
  }

  private set(lines: CartLine[]) {
    this._lines.set(lines);
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }

  private load(): CartLine[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }
}

