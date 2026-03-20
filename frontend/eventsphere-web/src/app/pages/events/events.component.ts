import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/api/api.service';
import { LoadingBlockComponent } from '../../shared/ui/loading-block/loading-block.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingBlockComponent,
    EmptyStateComponent
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  private readonly api = inject(ApiService);
  readonly events$ = this.api.events();
  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800';
  }
  getEventImage(index: number): string {
    const images = [
      'https://images.unsplash.com/photo-1558008258-3256797b43f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGVjaCUyMGV2ZW50fGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1511578314322-379afb476865',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3liZXJzZWN1cml0eXxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      'https://images.unsplash.com/photo-1503428593586-e225b39bddfe',
      'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmluYW5jZSUyMGFuZCUyMGdyb3d0aHxlbnwwfHwwfHx8MA%3D%3D'
    ];
    return images[index % images.length];
  }
}

