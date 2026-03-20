import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatCardModule],
  template: `
    <mat-card class="es-card es-empty">
      <mat-card-content>
        <div class="row">
          <mat-icon>{{ icon }}</mat-icon>
          <div>
            <div class="title">{{ title }}</div>
            <div class="es-muted">{{ description }}</div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .es-empty {
        padding: 14px;
      }
      .row {
        display: flex;
        gap: 12px;
        align-items: start;
      }
      .title {
        font: var(--mat-sys-title-large);
      }
      mat-icon {
        margin-top: 2px;
      }
    `
  ]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description = 'Create your first item to get started.';
}

