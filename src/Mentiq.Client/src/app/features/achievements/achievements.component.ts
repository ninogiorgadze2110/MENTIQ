import { Component, computed, inject, signal } from '@angular/core';

import { Achievement, AchievementService } from '../../core/services/achievement.service';
import { NotificationService } from '../../core/services/notification.service';

interface Group {
  key: string;
  label: string;
  items: Achievement[];
}

const CATEGORY_LABELS: Record<string, string> = {
  streak: '🔥 სერია',
  competition: '🏆 შეჯიბრი',
  speed: '⚡ სიჩქარე',
  accuracy: '🎯 სიზუსტე',
  volume: '📚 ვარჯიში'
};
const CATEGORY_ORDER = ['streak', 'competition', 'speed', 'accuracy', 'volume'];

@Component({
  selector: 'app-achievements',
  standalone: true,
  styles: [
    `
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 12px; }
      .badge {
        border: 1px solid var(--hair); background: #fff; padding: 20px 12px; text-align: center;
        cursor: pointer; transition: border-color .12s ease, transform .05s ease; position: relative;
      }
      .badge:hover { border-color: var(--gold); }
      .badge:active { transform: translateY(1px); }
      .badge.on { border-color: var(--gold); background: color-mix(in srgb, var(--gold) 6%, transparent); }
      .badge .emoji { font-size: 40px; line-height: 1; display: block; }
      .badge.locked .emoji { filter: grayscale(1); opacity: .45; }
      .badge .nm { font-size: 12px; margin-top: 8px; color: var(--ink); line-height: 1.3; }
      .badge.locked .nm { color: color-mix(in srgb, var(--ink) 45%, transparent); }
      .lockicon { position: absolute; top: 8px; right: 8px; font-size: 11px; opacity: .5; }
      .backdrop { position: fixed; inset: 0; background: color-mix(in srgb, var(--color-neutral-900) 45%, transparent); display: grid; place-items: center; z-index: 60; padding: 20px; }
      .modal { width: min(380px, 100%); background: var(--paper); border: 1px solid var(--hair); box-shadow: var(--shadow-lg); padding: 32px; text-align: center; }
    `
  ],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">Trophy Cabinet</div>
        <h2>მიღწევები</h2>
      </div>
    </div>

    @if (loading()) {
      <p class="muted">იტვირთება…</p>
    } @else {
      @if (data(); as d) {
      <!-- summary -->
      <div style="border:1px solid var(--hair); background:#fff; padding:22px 26px; margin-bottom:26px; display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
        <div>
          <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— გახსნილი</div>
          <div style="font-family:var(--ge-serif); font-size:44px; line-height:1; margin-top:4px; font-feature-settings:'tnum';">{{ d.unlockedCount }}<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> / {{ d.total }}</span></div>
        </div>
        <div style="flex:1; min-width:180px;">
          <div style="height:6px; background:var(--hair); position:relative;"><div [style.width.%]="pct()" style="height:100%; background:var(--gold); transition:width .3s;"></div></div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:8px;">შეაგროვე ყველა ბეჯი — ივარჯიშე, გაიმარჯვე შეჯიბრებში და დაიცავი სერია.</div>
        </div>
      </div>

      @for (g of groups(); track g.key) {
        <div style="display:flex; align-items:baseline; padding-bottom:10px; border-bottom:1px solid var(--hair); margin:26px 0 16px;">
          <h4 style="font-family:var(--ge-serif); font-size:17px; margin:0; font-weight:500;">{{ g.label }}</h4>
          <span style="margin-left:auto; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ unlockedIn(g) }} / {{ g.items.length }}</span>
        </div>
        <div class="grid">
          @for (a of g.items; track a.code) {
            <button type="button" class="badge" [class.locked]="!a.unlocked" (click)="selected.set(a)">
              @if (!a.unlocked) { <span class="lockicon">🔒</span> }
              <span class="emoji">{{ a.unlocked ? a.emoji : (a.secret ? '❔' : a.emoji) }}</span>
              <div class="nm">{{ a.unlocked || !a.secret ? a.name : '???' }}</div>
              @if (!a.unlocked && !a.secret && a.target > 1) {
                <div style="font-size:10px; color:color-mix(in srgb, var(--ink) 45%, transparent); margin-top:3px; font-feature-settings:'tnum';">{{ a.progress }} / {{ a.target }}</div>
              }
            </button>
          }
        </div>
      }
      } @else {
        <p class="muted">ვერ ჩაიტვირთა.</p>
      }
    }

    <!-- detail modal -->
    @if (selected(); as a) {
      <div class="backdrop" (click)="selected.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div style="font-size:64px; line-height:1;" [style.filter]="a.unlocked ? 'none' : 'grayscale(1)'" [style.opacity]="a.unlocked ? 1 : 0.5">{{ a.unlocked ? a.emoji : (a.secret ? '❔' : a.emoji) }}</div>
          <h3 style="font-family:var(--ge-serif); font-size:24px; margin:16px 0 6px; font-weight:500;">{{ a.unlocked || !a.secret ? a.name : 'საიდუმლო მიღწევა' }}</h3>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 68%, transparent); margin:0 0 16px;">{{ a.unlocked || !a.secret ? a.description : 'რაღაც განსაკუთრებული გელოდება…' }}</p>

          @if (a.target > 1) {
            <div style="height:5px; background:var(--hair); position:relative; margin-bottom:8px;"><div [style.width.%]="(a.progress / a.target) * 100" style="height:100%; background:var(--gold);"></div></div>
            <div style="font-size:13px; font-feature-settings:'tnum'; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ a.progress }} / {{ a.target }}</div>
          }

          @if (a.unlocked) {
            <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--hair); font-size:12.5px; color:var(--gold); font-family:var(--ge-serif); font-style:italic;">✓ გახსნილი {{ dateStr(a.unlockedAtUtc) }}</div>
          } @else {
            <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--hair); font-size:12.5px; color:color-mix(in srgb, var(--ink) 50%, transparent);">🔒 ჯერ არ არის გახსნილი</div>
          }

          <button type="button" class="btn btn-secondary" style="margin-top:20px; padding:10px 22px;" (click)="selected.set(null)">დახურვა</button>
        </div>
      </div>
    }
  `
})
export class AchievementsComponent {
  private readonly service = inject(AchievementService);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(true);
  readonly data = signal<{ unlockedCount: number; total: number; achievements: Achievement[] } | null>(null);
  readonly selected = signal<Achievement | null>(null);

  readonly pct = computed(() => {
    const d = this.data();
    return d && d.total ? (d.unlockedCount / d.total) * 100 : 0;
  });

  readonly groups = computed<Group[]>(() => {
    const items = this.data()?.achievements ?? [];
    return CATEGORY_ORDER
      .map((key) => ({ key, label: CATEGORY_LABELS[key] ?? key, items: items.filter((a) => a.category === key) }))
      .filter((g) => g.items.length > 0);
  });

  constructor() {
    this.service.get().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        const map = new Map(res.achievements.map((a) => [a.code, a]));
        for (const code of res.newlyUnlocked) {
          const a = map.get(code);
          if (a) this.notify.success(`🎉 მიღწევა გახსნილია: ${a.emoji} ${a.name}`);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  unlockedIn(g: Group): number {
    return g.items.filter((a) => a.unlocked).length;
  }

  dateStr(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  }
}
