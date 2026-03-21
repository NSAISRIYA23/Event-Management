import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, AuthUser } from './auth.models';
import { catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

type RegisterRequest = { name: string; email: string; password: string; isAdmin: boolean };
type LoginRequest = { email: string; password: string };

const TOKEN_KEY = 'es_token';
const USER_KEY = 'es_user';
const USERS_KEY = 'es_local_users';

type LocalUser = AuthUser & { password: string };

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
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/auth/register`, req).pipe(
      catchError(() => this.registerLocal(req))
    );
  }

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, req).pipe(
      catchError(() => this.loginLocal(req))
    );
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

  private readLocalUsers(): LocalUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as LocalUser[]) : [];
    } catch {
      return [];
    }
  }

  private writeLocalUsers(users: LocalUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private registerLocal(req: RegisterRequest): Observable<{ message: string }> {
    const users = this.readLocalUsers();
    const email = req.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === email)) {
      return throwError(() => ({ error: { message: 'Email already registered.' } }));
    }

    const user: LocalUser = {
      id: (crypto?.randomUUID?.() ?? `u_${Date.now()}`).toString(),
      name: req.name.trim(),
      email,
      isAdmin: !!req.isAdmin,
      password: req.password
    };
    users.push(user);
    this.writeLocalUsers(users);
    return of({ message: 'Registered successfully.' });
  }

  private loginLocal(req: LoginRequest): Observable<LoginResponse> {
    const email = req.email.trim().toLowerCase();
    const user = this.readLocalUsers().find(
      u => u.email.toLowerCase() === email && u.password === req.password
    );
    if (!user) {
      return throwError(() => ({ error: { message: 'Invalid email or password.' } }));
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };

    const token = btoa(`${authUser.id}:${Date.now()}`);
    return of({ token, user: authUser });
  }
}

