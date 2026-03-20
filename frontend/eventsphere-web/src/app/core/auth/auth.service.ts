import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, AuthUser } from './auth.models';

type RegisterRequest = { name: string; email: string; password: string; isAdmin: boolean };
type LoginRequest = { email: string; password: string };

const TOKEN_KEY = 'es_token';
const USER_KEY = 'es_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(
    (() => {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    })()
  );

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.isAdmin === true);

  register(req: RegisterRequest) {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/auth/register`, req);
  }

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, req);
  }

  setSession(res: LoginResponse) {
    this._token.set(res.token);
    this._user.set(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

