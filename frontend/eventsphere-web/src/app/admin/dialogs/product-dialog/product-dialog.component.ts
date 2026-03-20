import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/api/api.models';

export type ProductDialogData = {
  mode: 'create' | 'edit';
  product?: Product;
};

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.css'
})
export class ProductDialogComponent {
  private readonly ref = inject(MatDialogRef<ProductDialogComponent>);
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required]],
    stock: [100, [Validators.required]],
    imageUrl: [''],
    isActive: [true]
  });

  constructor() {
    if (this.data.product) {
      this.form.patchValue({
        name: this.data.product.name,
        description: this.data.product.description,
        price: this.data.product.price,
        stock: this.data.product.stock,
        imageUrl: this.data.product.imageUrl ?? '',
        isActive: this.data.product.isActive
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue());
  }

  cancel() {
    this.ref.close(null);
  }
}

