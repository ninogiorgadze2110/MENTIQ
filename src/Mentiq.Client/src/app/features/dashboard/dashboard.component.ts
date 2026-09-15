import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ProgressResponse, ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ today() }}</div>
        <h2>გამარჯობა, {{ firstName() }}.</h2>
      </div>
      <div class="spacer"></div>
    </div>

    <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:20px;">
      <!-- Daily card -->
      <div style="border:1px solid var(--hair); background:#fff; padding:32px; display:flex; gap:32px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:220px;">
          <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— დღის ვარჯიში</div>
          <h3 style="font-family:var(--ge-serif); font-size:32px; margin:10px 0 6px; font-weight:500; line-height:1.05;">შერეული, დროზე</h3>
          <p style="font-size:13.5px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 20px; line-height:1.55;">დაასრულე დღევანდელი ვარჯიში და დაიცავი სერია.</p>
          <div style="display:flex; gap:10px; align-items:center;">
            <a routerLink="/practice" class="btn btn-primary" style="padding:12px 22px;">დაიწყე ვარჯიში →</a>
            <span style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">~ 7 წუთი</span>
          </div>
        </div>
        <div style="width:170px; height:170px; position:relative; display:grid; place-items:center;">
          <svg viewBox="0 0 100 100" style="width:100%; height:100%; transform:rotate(-90deg);">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hair)" stroke-width="2"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="2" [attr.stroke-dasharray]="276" [attr.stroke-dashoffset]="ringOffset()" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute; text-align:center;">
            <div style="font-family:var(--ge-serif); font-size:46px; color:var(--gold); line-height:1;">{{ dayStreak() }}</div>
            <div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">დღიანი სერია</div>
          </div>
        </div>
      </div>
      <!-- Level card -->
      <div style="border:1px solid var(--hair); background:#fff; padding:28px 30px;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">— შენი დონე</div>
        <div style="display:flex; align-items:baseline; gap:12px; margin-top:8px;">
          <div style="font-family:var(--ge-serif); font-size:66px; color:var(--gold); line-height:1;">IV</div>
          <div><div style="font-family:var(--ge-serif); font-size:20px;">შუალედური</div><div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ totalSessions() }} ვარჯიში</div></div>
        </div>
        <div style="margin-top:22px;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;"><span>საუკეთესო სერია</span><span style="font-feature-settings:'tnum';">×{{ bestStreak() }}</span></div>
          <div style="height:4px; background:var(--hair); position:relative;"><div [style.width.%]="ringPct()" style="height:100%; background:var(--gold);"></div></div>
        </div>
        <div style="margin-top:18px; padding-top:16px; border-top:1px solid var(--hair); font-size:12.5px; color:color-mix(in srgb, var(--ink) 65%, transparent);">
          <a routerLink="/achievements" style="color:var(--gold);">★ ნახე მიღწევები →</a>
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

    <!-- Continue learning -->
    <div style="margin-top:32px;">
      <div style="display:flex; align-items:baseline; padding-bottom:12px; border-bottom:1px solid var(--hair);">
        <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">გააგრძელე სწავლა</h4>
        <a routerLink="/learn" style="margin-left:auto; font-size:12px; color:var(--gold);">ყველა ხრიკი →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0;">
        <a routerLink="/practice" [queryParams]="{ trick: 'mul11' }" style="padding:18px 22px 18px 0; border-right:1px solid var(--hair); text-decoration:none; color:inherit;">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 04</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">გამრავლება 11-ზე</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">10 კითხვა · 2 წუთი</div>
        </a>
        <a routerLink="/learn" style="padding:18px 22px; border-right:1px solid var(--hair); text-decoration:none; color:inherit;">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 07</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">15%-ის გამოთვლა თავში</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">ახალი · 3 წუთი</div>
        </a>
        <a routerLink="/learn" style="padding:18px 0 18px 22px; text-decoration:none; color:inherit;">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 11</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">5-ით დამთავრებული კვადრატი</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">კვადრატები</div>
        </a>
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
