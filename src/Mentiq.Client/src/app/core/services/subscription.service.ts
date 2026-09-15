import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ActivateSubscriptionRequest,
  AdminSubscriptionDetail,
  AdminSubscriptionListResponse,
  CancelSubscriptionRequest,
  ExtendSubscriptionRequest,
  PlansResponse,
  SubscriptionStatus
} from '../models/subscription.model';

/**
 * Client mirror of the backend subscription state. The signals here drive UI
 * only (banners, locked states, countdown). Authorization is ALWAYS enforced by
 * the backend — this state is never the source of truth for access.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/subscription`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/subscriptions`;

  private readonly _status = signal<SubscriptionStatus | null>(null);
  private readonly _loading = signal(false);

  readonly status = this._status.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly hasAccess = computed(() => this._status()?.hasAccess ?? false);
  readonly isTrial = computed(() => this._status()?.isTrial ?? false);
  readonly daysRemaining = computed(() => this._status()?.daysRemaining ?? 0);
  readonly plan = computed(() => this._status()?.plan ?? null);
  readonly trialEndDate = computed(() => this._status()?.trialEndDate ?? null);
  readonly subscriptionEndDate = computed(() => this._status()?.subscriptionEndDate ?? null);

  /** Loads the effective status from the backend and caches it in signals. */
  loadStatus(): Observable<SubscriptionStatus> {
    this._loading.set(true);
    return this.http.get<SubscriptionStatus>(`${this.baseUrl}/status`).pipe(
      tap({
        next: (s) => {
          this._status.set(s);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      })
    );
  }

  /** Clears cached state, e.g. on logout. */
  clear(): void {
    this._status.set(null);
  }

  getPlans(): Observable<PlansResponse> {
    return this.http.get<PlansResponse>(`${this.baseUrl}/plans`);
  }

  // ---- Admin ----

  adminList(query?: string): Observable<AdminSubscriptionListResponse> {
    const url = query ? `${this.adminUrl}?q=${encodeURIComponent(query)}` : this.adminUrl;
    return this.http.get<AdminSubscriptionListResponse>(url);
  }

  adminGet(userId: string): Observable<AdminSubscriptionDetail> {
    return this.http.get<AdminSubscriptionDetail>(`${this.adminUrl}/${userId}`);
  }

  adminActivate(userId: string, req: ActivateSubscriptionRequest): Observable<AdminSubscriptionDetail> {
    return this.http.post<AdminSubscriptionDetail>(`${this.adminUrl}/${userId}/activate`, req);
  }

  adminExtend(userId: string, req: ExtendSubscriptionRequest): Observable<AdminSubscriptionDetail> {
    return this.http.post<AdminSubscriptionDetail>(`${this.adminUrl}/${userId}/extend`, req);
  }

  adminCancel(userId: string, req: CancelSubscriptionRequest): Observable<AdminSubscriptionDetail> {
    return this.http.post<AdminSubscriptionDetail>(`${this.adminUrl}/${userId}/cancel`, req);
  }
}
