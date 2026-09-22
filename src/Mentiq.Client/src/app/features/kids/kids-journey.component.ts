import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { KidsExerciseService } from './exercise/kids-exercise.service';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS, KidsWorld } from './kids-worlds.data';

/**
 * Journey map (design 03): the worlds laid out as territories along a winding
 * trail. Territories unlock gradually with total stars; the newest unlocked one
 * is the child's current spot ("აქ ხარ"). A calm path, not a list.
 */
@Component({
  selector: 'app-kids-journey',
  standalone: true,
  template: `
    <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>

    <div class="kids-journey-head">
      <div>
        <div class="kids-kicker" style="margin:0;">— ტომი I</div>
        <div class="kids-h1" style="font-size:26px; margin:4px 0 0;">მოგზაურობის რუკა</div>
      </div>
      <span class="kids-chip">{{ unlockedCount() }} / {{ worlds.length }} ტერიტორია</span>
    </div>

    <div class="kids-trail">
      @for (w of worlds; track w.id; let i = $index) {
        <div class="kt-row" [class.right]="i % 2 === 1">
          @if (i === currentIndex()) {
            <div class="kt-card">
              <span class="kt-badge">აქ ხარ</span>
              <div class="kt-card-top">
                <span class="kt-node" [style.background]="tint(w.color)">{{ w.emoji }}</span>
                <div>
                  <div class="kt-name">{{ w.name }}</div>
                  <div class="kt-sub">{{ w.tagline }}</div>
                </div>
              </div>
              <div class="kt-progress">
                <div class="kt-track"><span [style.width.%]="mastery(w)" [style.background]="w.color"></span></div>
                <span class="kt-pct">{{ mastery(w) }}%</span>
              </div>
              <button type="button" class="kids-btn" style="width:100%; margin-top:12px; padding:12px; font-size:15px;" (click)="open(w)">გააგრძელე →</button>
            </div>
          } @else {
            <button type="button" class="kt-stop" [class.locked]="!unlocked(i)" [disabled]="!unlocked(i)" (click)="open(w)">
              <span class="kt-node sm" [style.background]="unlocked(i) ? tint(w.color) : '#ece9f5'">{{ unlocked(i) ? w.emoji : '🔒' }}</span>
              <div style="text-align:left;">
                <div class="kt-name" style="font-size:15px;">{{ w.name }}</div>
                <div class="kt-sub">{{ unlocked(i) ? w.tagline : lockHint(i) }}</div>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class KidsJourneyComponent implements OnInit {
  private readonly api = inject(KidsExerciseService);
  private readonly router = inject(Router);

  readonly worlds = [...KIDS_WORLDS].sort((a, b) => a.order - b.order);
  readonly progress = signal<SkillProgress[]>([]);

  /** Total stars needed to unlock each territory (gentle ramp). */
  private readonly unlockAt = [0, 5, 13, 22, 32, 44, 58, 74];

  readonly total = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly unlockedCount = computed(() => this.worlds.filter((_, i) => this.unlocked(i)).length);
  readonly currentIndex = computed(() => Math.max(0, this.unlockedCount() - 1));

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  unlocked(i: number): boolean {
    return this.total() >= (this.unlockAt[i] ?? Infinity);
  }

  lockHint(i: number): string {
    const need = (this.unlockAt[i] ?? 0) - this.total();
    return need > 0 ? `🔒 კიდევ ${need} ⭐` : '🔒';
  }

  mastery(w: KidsWorld): number {
    const p = this.progress().find((x) => x.skill === w.skill);
    return p ? Math.min(100, Math.round((p.level / 12) * 100)) : 0;
  }

  tint(color: string): string {
    return `color-mix(in srgb, ${color} 18%, #fff)`;
  }

  open(w: KidsWorld): void {
    this.router.navigate(['/kids/world', w.id]);
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
