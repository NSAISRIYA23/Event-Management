import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api/api.service';
import { environment } from '../../../environments/environment';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    LoadingBlockComponent,
    EmptyStateComponent
  ],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent {
  private readonly api = inject(ApiService);
  readonly resources$ = this.api.resources();
  readonly origin = computed(() => environment.apiBaseUrl.replace(/\/api\/?$/, ''));
  private readonly isPhone =
    typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  fileHref(fileUrl: string) {
    if (!fileUrl) return '#';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return `${this.origin()}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
  }

  fileTarget() {
    return this.isPhone ? '_self' : '_blank';
  }
}

