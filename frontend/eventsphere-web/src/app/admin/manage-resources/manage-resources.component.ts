import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api/api.service';
import { environment } from '../../../environments/environment';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EventItem, ResourceItem } from '../../core/api/api.models';

@Component({
  selector: 'app-manage-resources',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    EmptyStateComponent,
    LoadingBlockComponent
  ],
  templateUrl: './manage-resources.component.html',
  styleUrl: './manage-resources.component.css'
})
export class ManageResourcesComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  loading = signal(true);
  resources = signal<ResourceItem[]>([]);
  events = signal<EventItem[]>([]);
  readonly displayedColumns = ['title', 'event', 'file', 'created', 'actions'];

  saving = signal(false);
  msg = signal('');
  file = signal<File | null>(null);

  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    eventId: ['']
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.events().subscribe({
      next: evs => this.events.set(evs),
      error: () => this.events.set([])
    });
    this.api.resources().subscribe({
      next: items => {
        this.resources.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.resources.set([]);
        this.loading.set(false);
        this.snack.open('Failed to load resources', 'Dismiss', { duration: 2500 });
      }
    });
  }

  eventTitle(eventId: string) {
    if (!eventId) return '—';
    return this.events().find(e => e.id === eventId)?.title ?? 'Unknown';
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }

  upload() {
    if (this.form.invalid) return;
    const f = this.file();
    if (!f) {
      this.msg.set('Please select a file.');
      return;
    }
    this.saving.set(true);
    this.msg.set('');
    const v = this.form.getRawValue();
    this.api.uploadResource({ ...v, file: f }).subscribe({
      next: () => {
        this.saving.set(false);
        this.msg.set('');
        this.snack.open('Resource uploaded', 'OK', { duration: 2000 });
        this.refresh();
        this.file.set(null);
      },
      error: err => {
        this.saving.set(false);
        this.msg.set(err?.error?.message ?? 'Upload failed.');
      }
    });
  }

  del(id: string) {
    this.api.deleteResource(id).subscribe({
      next: () => {
        this.snack.open('Resource deleted', 'OK', { duration: 2000 });
        this.refresh();
      },
      error: () => {}
    });
  }
}

