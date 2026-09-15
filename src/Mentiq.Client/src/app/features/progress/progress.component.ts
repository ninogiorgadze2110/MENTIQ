import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProgressResponse, ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">შენი ისტორია</div>
        <h2>პროგრესი</h2>
      </div>
    </div>

    @if (loading()) {
      <p class="muted">იტვირთება…</p>
    } @else {
      @if (data(); as d) {
      @if (d.totalSessions === 0) {
        <div class="card elev-sm" style="max-width:460px; padding:36px; align-items:flex-start; gap:10px;">
          <div style="font-family:var(--ge-serif); font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ჯერ ცარიელია</div>
          <h3 style="font-family:var(--ge-serif); font-size:26px; margin:0; font-weight:500;">დაიწყე ვარჯიში</h3>
          <p style="font-size:13.5px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 8px;">ყოველი დასრულებული სესია აქ დაგროვდება — ზედიზედ დღეები, სიზუსტე, საშუალო დრო.</p>
          <a routerLink="/practice" class="btn btn-primary" style="padding:12px 22px;">დაიწყე ვარჯიში →</a>
        </div>
      } @else {
        <!-- Top: streak + weekly activity -->
        <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:20px;">
          <div style="border:1px solid var(--hair); background:#fff; padding:28px 30px; display:flex; align-items:center; gap:24px;">
            <div style="width:150px; height:150px; position:relative; display:grid; place-items:center; flex-shrink:0;">
              <svg viewBox="0 0 100 100" style="width:100%; height:100%; transform:rotate(-90deg);">
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hair)" stroke-width="2"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"
                  [attr.stroke-dasharray]="276"
                  [attr.stroke-dashoffset]="276 - Math.min(d.dayStreak / 7, 1) * 276"/>
              </svg>
              <div style="position:absolute; text-align:center;">
                <div style="font-family:var(--ge-serif); font-size:44px; color:var(--gold); line-height:1;">{{ d.dayStreak }}</div>
                <div style="font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">დღე ზედიზედ</div>
              </div>
            </div>
            <div>
              <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— სერია</div>
              <div style="font-family:var(--ge-serif); font-size:20px; margin:6px 0 2px;">ყოველ დღე ივარჯიშე</div>
              <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent);">საუკეთესო სერია სესიაში: ×{{ d.bestStreak }}</div>
            </div>
          </div>

          <div style="border:1px solid var(--hair); background:#fff; padding:24px 28px;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:16px;">ბოლო 7 დღე</div>
            <div style="display:flex; gap:10px; align-items:flex-end; height:96px;">
              @for (day of week(); track $index) {
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;">
                  <div [style.height.%]="day.h" [style.background]="day.count > 0 ? 'var(--gold)' : 'var(--hair)'" style="width:100%; min-height:4px;"></div>
                  <span style="font-size:10px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ day.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Metric row -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:20px; margin-top:20px;">
          <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო სიზუსტე</div>
            <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 2px; font-feature-settings:'tnum';">{{ d.avgAccuracy }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">%</span></div>
            <svg viewBox="0 0 200 40" style="width:100%; margin-top:10px;"><polyline [attr.points]="trendPoints()" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>
          </div>
          <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო დრო</div>
            <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 2px; font-feature-settings:'tnum';">{{ d.avgSeconds }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">კითხვაზე</div>
          </div>
          <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სულ ვარჯიშები</div>
            <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 2px; color:var(--gold); font-feature-settings:'tnum';">{{ d.totalSessions }}</div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">დასრულებული სესია</div>
          </div>
          <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სულ კითხვები</div>
            <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 2px; font-feature-settings:'tnum';">{{ d.totalQuestions }}</div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">ამოხსნილი</div>
          </div>
        </div>

        <!-- Recent sessions -->
        <div style="margin-top:32px;">
          <div style="display:flex; align-items:baseline; padding-bottom:12px; border-bottom:1px solid var(--hair);">
            <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">ბოლო სესიები</h4>
            <a routerLink="/practice" style="margin-left:auto; font-size:12px; color:var(--gold);">ახალი ვარჯიში →</a>
          </div>
          <table class="table">
            <thead>
              <tr><th>ვარჯიში</th><th>სიზუსტე</th><th>ქულა</th><th style="text-align:right;">როდის</th></tr>
            </thead>
            <tbody>
              @for (r of d.recentSessions; track r.completedAtUtc) {
                <tr>
                  <td style="font-family:var(--ge-serif); font-size:15px;">{{ r.title }}</td>
                  <td style="font-feature-settings:'tnum';">{{ r.accuracy }}% <span class="muted" style="font-size:12px;">({{ r.correctCount }}/{{ r.totalQuestions }})</span></td>
                  <td style="font-feature-settings:'tnum'; color:var(--gold); font-family:var(--ge-serif);">{{ r.score }}</td>
                  <td style="text-align:right; color:color-mix(in srgb, var(--ink) 55%, transparent); font-size:12.5px;">{{ when(r.completedAtUtc) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      } @else {
        <p class="muted">ვერ ჩაიტვირთა. სცადე თავიდან.</p>
      }
    }
  `
})
export class ProgressComponent {
  private readonly service = inject(ProgressService);
  readonly Math = Math;

  readonly loading = signal(true);
  readonly data = signal<ProgressResponse | null>(null);

  private readonly kaDayLetters = ['კ', 'ო', 'ს', 'ო', 'ხ', 'პ', 'შ'];

  constructor() {
    this.service.getProgress().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  readonly week = computed(() => {
    const w = this.data()?.weeklyActivity ?? [];
    const max = Math.max(1, ...w);
    const today = new Date();
    return w.map((count, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      return { count, h: Math.max(6, (count / max) * 100), label: this.kaDayLetters[day.getDay()] };
    });
  });

  readonly trendPoints = computed(() => {
    const t = this.data()?.accuracyTrend ?? [];
    if (t.length === 0) return '';
    if (t.length === 1) return `0,${40 - (t[0] / 100) * 36} 200,${40 - (t[0] / 100) * 36}`;
    return t
      .map((v, i) => `${(i / (t.length - 1)) * 200},${40 - (v / 100) * 36}`)
      .join(' ');
  });

  when(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (days <= 0) return 'დღეს';
    if (days === 1) return 'გუშინ';
    if (days < 7) return `${days} დღის წინ`;
    return `${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}
