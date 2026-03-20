import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly qty = signal(1);
  readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  readonly event$ = this.api.event(this.id());
  readonly isLoggedIn = this.auth.isLoggedIn;

  bookingState = signal<'idle' | 'saving' | 'done'>('idle');
  bookingMsg = signal<string>('');

  book(eventId: string) {
    if (!this.isLoggedIn()) {
      this.bookingMsg.set('Please log in to book.');
      return;
    }
    this.bookingState.set('saving');
    this.bookingMsg.set('');

    // Payment page will simulate processing, then create the booking + PDF confirmation.
    this.router.navigateByUrl(
      `/payment?eventId=${encodeURIComponent(eventId)}&quantity=${encodeURIComponent(String(this.qty()))}`
    );
  }
}

