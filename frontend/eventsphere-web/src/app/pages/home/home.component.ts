// import { Component } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
// })
// export class HomeComponent {
//   readonly brands = [
//     'Google',
//     'Microsoft',
//     'Amazon',
//     'Spotify',
//     'Netflix',
//     'Adobe',
//     'Meta',
//     'Tesla',
//     'Airbnb',
//     'Uber'
//   ];
// }


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/* ✅ MATERIAL IMPORTS */
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    /* ✅ REQUIRED */
    MatMenuModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  /* ✅ FIX USER */
  user() {
    return {
      name: 'Sriya',
      email: 'sriya1@gmail.com'
    };
  }

  /* ✅ FIX LOGOUT */
  logout() {
    console.log('logout clicked');
  }

  /* ✅ FIX BRANDS ERROR */
  brands = [
    'Google',
    'Microsoft',
    'Amazon',
    'Netflix',
    'Meta',
    'Spotify'
  ];
}