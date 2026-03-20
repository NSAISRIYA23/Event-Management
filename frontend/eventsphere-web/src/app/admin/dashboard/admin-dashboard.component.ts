import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  private readonly api = inject(ApiService);
  readonly stats$ = this.api.adminStats();
}