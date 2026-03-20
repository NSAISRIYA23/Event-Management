import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api/api.service';
import { Product } from '../../core/api/api.models';
import { ProductDialogComponent } from '../dialogs/product-dialog/product-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    EmptyStateComponent,
    LoadingBlockComponent
  ],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css'
})
export class ManageProductsComponent {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  loading = signal(true);
  products = signal<Product[]>([]);
  readonly displayedColumns = ['name', 'price', 'stock', 'actions'];

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.products().subscribe({
      next: items => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
        this.snack.open('Failed to load products', 'Dismiss', { duration: 2500 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(ProductDialogComponent, { width: '860px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.api.createProduct(payload).subscribe({
        next: () => {
          this.snack.open('Product created', 'OK', { duration: 2000 });
          this.refresh();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Create failed', 'Dismiss', { duration: 3000 })
      });
    });
  }

  openEdit(p: Product) {
    const ref = this.dialog.open(ProductDialogComponent, { width: '860px', data: { mode: 'edit', product: p } });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.api.updateProduct(p.id, payload).subscribe({
        next: () => {
          this.snack.open('Product updated', 'OK', { duration: 2000 });
          this.refresh();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Update failed', 'Dismiss', { duration: 3000 })
      });
    });
  }

  delete(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => {
        this.snack.open('Product deleted', 'OK', { duration: 2000 });
        this.refresh();
      },
      error: err => this.snack.open(err?.error?.message ?? 'Delete failed', 'Dismiss', { duration: 3000 })
    });
  }
}

