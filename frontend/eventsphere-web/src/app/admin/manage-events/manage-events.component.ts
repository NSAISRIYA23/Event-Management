import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/api/api.service';
import { EventDialogComponent } from '../dialogs/event-dialog/event-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { Category, EventItem } from '../../core/api/api.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DatePipe,
    EmptyStateComponent,
    LoadingBlockComponent,
    RouterModule
  ],
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css'
})
export class ManageEventsComponent {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  loading = signal(true);
  events = signal<EventItem[]>([]);
  categories = signal<Category[]>([]);

  readonly displayedColumns = ['title', 'schedule', 'location', 'category', 'price', 'capacity', 'actions'];
  private readonly snackSuccess = {
    duration: 2200,
    panelClass: ['es-snack-success']
  };
  private readonly snackError = {
    duration: 3000,
    panelClass: ['es-snack-error']
  };

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.categories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => this.categories.set([])
    });
    this.api.events().subscribe({
      next: items => {
        this.events.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
        this.snack.open('Failed to load events', 'Dismiss', this.snackError);
      }
    });
  }

  categoryName(categoryId: string) {
    return this.categories().find(c => c.id === categoryId)?.name ?? 'Uncategorized';
  }

  openCreate() {
    const ref = this.dialog.open(EventDialogComponent, {
      width: '900px',
      data: { mode: 'create', categories: this.categories() }
    });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.api.createEvent(payload).subscribe({
        next: () => {
          this.snack.open('Event created', 'OK', this.snackSuccess);
          this.refresh();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Create failed', 'Dismiss', this.snackError)
      });
    });
  }

  openEdit(ev: EventItem) {
    const ref = this.dialog.open(EventDialogComponent, {
      width: '900px',
      data: { mode: 'edit', event: ev, categories: this.categories() }
    });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.api.updateEvent(ev.id, payload).subscribe({
        next: () => {
          this.snack.open('Event updated', 'OK', this.snackSuccess);
          this.refresh();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Update failed', 'Dismiss', this.snackError)
      });
    });
  }

  delete(ev: EventItem) {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    this.api.deleteEvent(ev.id).subscribe({
      next: () => {
        this.snack.open('Event deleted', 'OK', this.snackSuccess);
        this.refresh();
      },
      error: err => this.snack.open(err?.error?.message ?? 'Delete failed', 'Dismiss', this.snackError)
    });
  }
}

