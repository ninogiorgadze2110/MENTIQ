import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ProgressResponse, ProgressService } from '../../core/services/progress.service';
import { SubscriptionBannerComponent } from '../../shared/subscription-banner.component';
import { DailyChallengeCardComponent } from './daily-challenge-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SubscriptionBannerComponent, DailyChallengeCardComponent],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ today() }}</div>
        <h2>გამარჯობა, {{ firstName() }}.</h2>
      </div>
      <div class="spacer"></div>
    </div>

    <app-subscription-banner />

    <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; align-items:stretch;">
      <!-- Daily challenge (self-contained) -->
      <div style="border:1px solid var(--hair); background:#fff; padding:32px;">
        <app-daily-challenge-card />
      </div>

      <!-- Streak (separate card) -->
      <div style="border:1px solid var(--hair); background:#fff; padding:28px 30px; display:flex; flex-direction:column;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">— შენი სერია</div>
        <div style="flex:1; display:grid; place-items:center; padding:12px 0;">
          <div style="width:150px; height:150px; position:relative; display:grid; place-items:center;">
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; transform:rotate(-90deg);">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hair)" stroke-width="2"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="2" [attr.stroke-dasharray]="276" [attr.stroke-dashoffset]="ringOffset()" stroke-linecap="round"/>
            </svg>
            <div style="position:absolute; text-align:center;">
              <div style="font-family:var(--ge-serif); font-size:44px; color:var(--gold); line-height:1;">{{ dayStreak() }}</div>
              <div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">დღიანი სერია</div>
            </div>
          </div>
        </div>
        <div style="padding-top:14px; border-top:1px solid var(--hair); display:flex; justify-content:space-between; align-items:center; font-size:12.5px;">
          <span style="color:color-mix(in srgb, var(--ink) 60%, transparent);">საუკეთესო: <strong style="color:var(--ink); font-feature-settings:'tnum';">×{{ bestStreak() }}</strong></span>
          <a routerLink="/achievements" style="color:var(--gold);">★ მიღწევები →</a>
        </div>
      </div>
    </div>

    <!-- Three metrics (real progress data) -->
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-top:20px;">
      <!-- Accuracy -->
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო სიზუსტე</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ avgAccuracy() }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">%</span></div>
        <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ totalSessions() }} ვარჯიშის მიხედვით</div>
        <svg viewBox="0 0 200 40" style="width:100%; margin-top:14px;"><polyline [attr.points]="accPoints()" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>
      </div>
      <!-- Time -->
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო დრო</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ avgSeconds() }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
        <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">კითხვაზე</div>
        <svg viewBox="0 0 200 40" style="width:100%; margin-top:14px;"><polyline [attr.points]="secPoints()" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>
      </div>
      <!-- Weekly -->
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">კვირის ვარჯიშები</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ weekActive() }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> / 7</span></div>
        <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">აქტიური დღე ამ კვირაში</div>
        <div style="display:flex; gap:6px; margin-top:14px;">
          @for (d of week(); track $index) {
            <span style="flex:1; height:24px;" [style.background]="d ? 'var(--gold)' : 'var(--hair)'"></span>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly progressSvc = inject(ProgressService);

  private readonly p = signal<ProgressResponse | null>(null);

  private readonly kaDays = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
  private readonly kaMonths = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

  constructor() {
    this.progressSvc.getProgress().subscribe({ next: (d) => this.p.set(d) });
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'გიორგი').split(' ')[0];
  }

  today(): string {
    const d = new Date();
    return `${this.kaDays[d.getDay()]}, ${d.getDate()} ${this.kaMonths[d.getMonth()]}`;
  }

  readonly dayStreak = computed(() => this.p()?.dayStreak ?? 0);
  readonly bestStreak = computed(() => this.p()?.bestStreak ?? 0);
  readonly totalSessions = computed(() => this.p()?.totalSessions ?? 0);
  readonly avgAccuracy = computed(() => this.p()?.avgAccuracy ?? 0);
  readonly avgSeconds = computed(() => this.p()?.avgSeconds ?? 0);
  readonly week = computed(() => (this.p()?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0]).map((n) => n > 0));
  readonly weekActive = computed(() => this.week().filter(Boolean).length);

  readonly ringPct = computed(() => Math.min(100, (this.dayStreak() / 30) * 100));
  readonly ringOffset = computed(() => 276 - (this.ringPct() / 100) * 276);

  readonly accPoints = computed(() => this.line(this.p()?.accuracyTrend ?? [], 100));
  readonly secPoints = computed(() => {
    const t = this.p()?.secondsTrend ?? [];
    return this.line(t, Math.max(1, ...t));
  });

  private line(values: number[], max: number): string {
    if (values.length === 0) return '';
    if (values.length === 1) {
      const y = 40 - (values[0] / max) * 30 - 4;
      return `0,${y} 200,${y}`;
    }
    return values
      .map((v, i) => `${(i / (values.length - 1)) * 200},${40 - (v / max) * 30 - 4}`)
      .join(' ');
  }
}
