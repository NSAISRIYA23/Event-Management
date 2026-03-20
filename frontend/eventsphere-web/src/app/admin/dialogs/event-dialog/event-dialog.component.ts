import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Category, EventItem } from '../../../core/api/api.models';

export type EventDialogData = {
  mode: 'create' | 'edit';
  event?: EventItem;
  categories: Category[];
};

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.css'
})
export class EventDialogComponent {
  private readonly ref = inject(MatDialogRef<EventDialogComponent>);
  readonly data = inject<EventDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.data.categories ?? [];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    location: [''],
    startUtc: [new Date().toISOString(), [Validators.required]],
    endUtc: [new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), [Validators.required]],
    price: [0, [Validators.required]],
    capacity: [100, [Validators.required]],
    categoryId: [''],
    coverImageUrl: [''],
    isActive: [true]
  });

  constructor() {
    if (this.data.event) {
      this.form.patchValue({
        title: this.data.event.title,
        description: this.data.event.description,
        location: this.data.event.location,
        startUtc: this.data.event.startUtc,
        endUtc: this.data.event.endUtc,
        price: this.data.event.price,
        capacity: this.data.event.capacity,
        categoryId: this.data.event.categoryId ?? '',
        coverImageUrl: this.data.event.coverImageUrl ?? '',
        isActive: this.data.event.isActive
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

