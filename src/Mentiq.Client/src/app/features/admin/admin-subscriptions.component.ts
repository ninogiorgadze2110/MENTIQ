import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import {
  AdminSubscriptionDetail,
  AdminSubscriptionRow,
  Plan
} from '../../core/models/subscription.model';

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold);">— ადმინი</div>
        <h2>გამოწერების მართვა</h2>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- Search -->
    <div style="display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap;">
      <input class="input" style="max-width:320px;" placeholder="ძებნა ელფოსტით ან სახელით…"
             [(ngModel)]="query" (keyup.enter)="search()" />
      <button type="button" class="btn btn-secondary" (click)="search()">ძებნა</button>
      <button type="button" class="btn btn-ghost" (click)="query.set(''); search()">გასუფთავება</button>
    </div>

    <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:20px; align-items:start;">
      <!-- Users table -->
      <div style="border:1px solid var(--hair); background:#fff; overflow-x:auto;">
        <table class="table" style="min-width:520px;">
          <thead>
            <tr>
              <th>მომხმარებელი</th><th>სტატუსი</th><th>ტრიალი მთავრდება</th><th>გეგმა</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (u of rows(); track u.userId) {
              <tr [style.background]="selectedId() === u.userId ? 'color-mix(in srgb, var(--gold) 8%, transparent)' : 'transparent'">
                <td>
                  <div style="font-size:13px;">{{ u.displayName }}</div>
                  <div style="font-size:11px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ u.email }}</div>
                </td>
                <td>{{ badge(u) }}</td>
                <td style="font-size:12px;">{{ shortDate(u.trialEndDate) }}</td>
                <td style="font-size:12px;">{{ u.plan || '—' }}</td>
                <td><button type="button" class="btn btn-ghost" style="font-size:12px;" (click)="select(u)">მართვა →</button></td>
              </tr>
            } @empty {
              <tr><td colspan="5" style="text-align:center; color:color-mix(in srgb, var(--ink) 50%, transparent); padding:24px;">მომხმარებელი ვერ მოიძებნა</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Detail / actions -->
      <div style="border:1px solid var(--hair); background:#fff; padding:22px; position:sticky; top:20px;">
        @if (detail(); as d) {
          <div style="font-family:var(--ge-serif); font-size:18px;">{{ d.displayName }}</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:14px;">{{ d.email }}</div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; font-size:12.5px; padding:14px 0; border-top:1px solid var(--hair); border-bottom:1px solid var(--hair);">
            <div style="color:color-mix(in srgb, var(--ink) 55%, transparent);">სტატუსი</div><div><strong>{{ d.status.status }}</strong> ({{ d.status.hasAccess ? 'წვდომა' : 'ჩაკეტილი' }})</div>
            <div style="color:color-mix(in srgb, var(--ink) 55%, transparent);">საცდელი ვერსია</div><div>{{ shortDate(d.status.trialStartDate) }} → {{ shortDate(d.status.trialEndDate) }}</div>
            <div style="color:color-mix(in srgb, var(--ink) 55%, transparent);">გეგმა</div><div>{{ d.current.plan || '—' }}</div>
            <div style="color:color-mix(in srgb, var(--ink) 55%, transparent);">გამოწერა</div><div>{{ d.current.startDate ? (shortDate(d.current.startDate) + ' → ' + shortDate(d.current.endDate)) : '—' }}</div>
          </div>

          <!-- Activate / change -->
          <div style="margin-top:16px;">
            <div style="font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:8px;">გააქტიურება / გეგმის შეცვლა</div>
            <div class="field" style="margin-bottom:8px;">
              <label>გეგმა</label>
              <select class="input" [(ngModel)]="planCode" (ngModelChange)="onPlanChange()">
                @for (p of plans(); track p.code) {
                  <option [value]="p.code">{{ p.name }} — {{ p.price }} {{ p.currency }} / {{ p.period }}</option>
                }
              </select>
            </div>
            <div style="display:flex; gap:8px;">
              <div class="field" style="flex:1;"><label>დაწყება</label><input class="input" type="date" [(ngModel)]="startDate" (ngModelChange)="recomputeEnd()" /></div>
              <div class="field" style="flex:1;"><label>დასრულება</label><input class="input" type="date" [(ngModel)]="endDate" /></div>
            </div>
            <div class="field" style="margin-top:8px;"><label>შენიშვნა</label><input class="input" [(ngModel)]="notes" placeholder="გადახდა დადასტურდა" /></div>
            <button type="button" class="btn btn-primary btn-block" style="margin-top:10px;" [disabled]="busy()" (click)="activate()">გააქტიურება</button>
          </div>

          <!-- Extend / cancel -->
          <div style="display:flex; gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid var(--hair);">
            <div class="field" style="flex:1;"><label>გახანგრძლივება (დღე)</label><input class="input" type="number" min="1" [(ngModel)]="extendDays" /></div>
            <button type="button" class="btn btn-secondary" style="align-self:flex-end; height:40px;" [disabled]="busy()" (click)="extend()">გახანგრძლივება</button>
          </div>
          <button type="button" class="btn btn-ghost btn-block" style="margin-top:10px; color:#b22;" [disabled]="busy()" (click)="cancel()">გამოწერის გაუქმება</button>

          <!-- History -->
          @if (d.history.length) {
            <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--hair);">
              <div style="font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:8px;">ისტორია</div>
              @for (h of d.history; track $index) {
                <div style="font-size:11.5px; padding:6px 0; border-bottom:1px solid var(--hair); display:flex; justify-content:space-between; gap:8px;">
                  <span><strong>{{ h.action }}</strong> · {{ h.plan }} · {{ h.status }}</span>
                  <span style="color:color-mix(in srgb, var(--ink) 50%, transparent); white-space:nowrap;">{{ shortDate(h.createdAtUtc) }}</span>
                </div>
              }
            </div>
          }
        } @else {
          <div style="text-align:center; color:color-mix(in srgb, var(--ink) 50%, transparent); padding:40px 12px; font-size:13px;">
            აირჩიე მომხმარებელი მარცხნიდან მისი გამოწერის სამართავად.
          </div>
        }
      </div>
    </div>
  `
})
export class AdminSubscriptionsComponent {
  private readonly subs = inject(SubscriptionService);
  private readonly notify = inject(NotificationService);

  readonly query = signal('');
  readonly rows = signal<AdminSubscriptionRow[]>([]);
  readonly plans = signal<Plan[]>([]);
  readonly detail = signal<AdminSubscriptionDetail | null>(null);
  readonly selectedId = computed(() => this.detail()?.current.userId ?? null);
  readonly busy = signal(false);

  planCode = 'monthly';
  startDate = this.todayIso();
  endDate = '';
  notes = '';
  extendDays = 30;

  constructor() {
    this.subs.getPlans().subscribe((r) => {
      this.plans.set(r.plans);
      if (r.plans.length && !r.plans.some((p) => p.code === this.planCode)) {
        this.planCode = r.plans[0].code;
      }
      this.recomputeEnd();
    });
    this.search();
  }

  search(): void {
    this.subs.adminList(this.query() || undefined).subscribe((r) => this.rows.set(r.items));
  }

  select(row: AdminSubscriptionRow): void {
    this.subs.adminGet(row.userId).subscribe((d) => {
      this.detail.set(d);
      // Prefill the activation form from the current subscription, if any.
      this.planCode = d.current.plan || this.planCode;
      this.startDate = this.todayIso();
      this.notes = '';
      this.recomputeEnd();
    });
  }

  onPlanChange(): void {
    this.recomputeEnd();
  }

  recomputeEnd(): void {
    const plan = this.plans().find((p) => p.code === this.planCode);
    const days = plan?.durationDays ?? 30;
    const start = this.startDate ? new Date(this.startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    this.endDate = end.toISOString().slice(0, 10);
  }

  activate(): void {
    const d = this.detail();
    if (!d) return;
    this.busy.set(true);
    this.subs
      .adminActivate(d.current.userId, {
        plan: this.planCode,
        startDate: this.toUtcIso(this.startDate, false),
        endDate: this.toUtcIso(this.endDate, true),
        provider: 'Manual',
        notes: this.notes || null
      })
      .subscribe({
        next: (res) => this.afterChange(res, 'გამოწერა გააქტიურდა'),
        error: () => this.busy.set(false)
      });
  }

  extend(): void {
    const d = this.detail();
    if (!d) return;
    this.busy.set(true);
    this.subs
      .adminExtend(d.current.userId, { addDays: Number(this.extendDays) || 0, notes: this.notes || null })
      .subscribe({
        next: (res) => this.afterChange(res, 'გამოწერა გახანგრძლივდა'),
        error: () => this.busy.set(false)
      });
  }

  cancel(): void {
    const d = this.detail();
    if (!d) return;
    this.busy.set(true);
    this.subs.adminCancel(d.current.userId, { notes: this.notes || null }).subscribe({
      next: (res) => this.afterChange(res, 'გამოწერა გაუქმდა'),
      error: () => this.busy.set(false)
    });
  }

  private afterChange(res: AdminSubscriptionDetail, message: string): void {
    this.detail.set(res);
    this.busy.set(false);
    this.notify.success(message);
    this.search();
  }

  badge(u: AdminSubscriptionRow): string {
    return u.status + (u.hasAccess ? ' ✓' : '');
  }

  shortDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('ka-GE', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** Converts a yyyy-mm-dd input to a UTC ISO instant (start or end of day). */
  private toUtcIso(dateOnly: string, endOfDay: boolean): string {
    const time = endOfDay ? 'T23:59:59.000Z' : 'T00:00:00.000Z';
    return `${dateOnly}${time}`;
  }
}
