import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-block',
  standalone: true,
  imports: [MatProgressBarModule],
  template: `
    <div class="wrap" [class.inline]="inline">
      <mat-progress-bar mode="indeterminate" />
    </div>
  `,
  styles: [
    `
      .wrap {
        margin: 12px 0;
        border-radius: 999px;
        overflow: hidden;
      }
      .wrap.inline {
        margin: 0;
      }
    `
  ]
})
export class LoadingBlockComponent {
  @Input() inline = false;
}

