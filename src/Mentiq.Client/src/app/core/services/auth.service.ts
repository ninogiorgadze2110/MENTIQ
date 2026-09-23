import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../models/auth.model';
import { SubscriptionService } from './subscription.service';

const TOKEN_KEY = 'mentiq.access_token';
const USER_KEY = 'mentiq.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly subscriptions = inject(SubscriptionService);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  private readonly _user = signal<UserDto | null>(this.readStoredUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Administrator');

  /** MENTIQ experience segment of the signed-in user. */
  readonly educationLevel = computed(() => this._user()?.educationLevel ?? 'school');
  readonly grade = computed(() => this._user()?.grade ?? -1);
  readonly isKid = computed(() => this.educationLevel() === 'preschool');

  /**
   * First-graders (school, grade 1 — around 6 years old) can use BOTH the Kids
   * world and the school app, and get a view switch to move between them.
   */
  readonly isFirstGrade = computed(() => this.educationLevel() === 'school' && this.grade() === 1);
  readonly canUseKids = computed(() => this.isKid() || this.isFirstGrade());
  readonly canSwitchView = computed(() => this.isFirstGrade());

  /** Where a user should land after authenticating. Kids-capable users
   *  (preschool and first-graders) start in the Kids world by default. */
  homeRoute(): string {
    return this.canUseKids() ? '/kids' : '/dashboard';
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.subscriptions.clear();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this._user.set(response.user);
  }

  private readStoredUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  }
}
