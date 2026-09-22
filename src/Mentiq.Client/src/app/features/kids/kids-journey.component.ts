import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { KidsExerciseService } from './exercise/kids-exercise.service';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS, KidsWorld } from './kids-worlds.data';
import { isMastered, masteryPct } from './kids-mastery';

/**
 * Journey map (design 03) — a clean vertical trail of territories. Progress is
 * mastery-based and sequential: the next tour opens only when the current one is
 * mastered (volume + several days). So the map always shows exactly where the
 * child is, what's done, and what's still ahead — no "8/8 in one sitting".
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
      <span class="kids-chip">{{ masteredCount() }} / {{ worlds.length }} დასრულებული</span>
    </div>

    <div class="jtrail">
      @for (w of worlds; track w.id; let i = $index) {
        <div class="jt-stop" [class.done]="stateOf(i) === 'done'"
             [class.current]="stateOf(i) === 'current'" [class.locked]="stateOf(i) === 'locked'">
          <div class="jt-rail">
            <span class="jt-node" [style.background]="stateOf(i) === 'locked' ? '#ece9f5' : tint(w.color)">
              @switch (stateOf(i)) {
                @case ('done') { <span class="jt-check">✓</span> }
                @case ('locked') { 🔒 }
                @default { {{ w.emoji }} }
              }
            </span>
          </div>

          @if (stateOf(i) === 'current') {
            <button type="button" class="jt-card cur" (click)="open(w)">
              <span class="jt-here">აქ ხარ</span>
              <div class="jt-name">{{ w.name }}</div>
              <div class="jt-sub">{{ w.tagline }}</div>
              <div class="jt-progress">
                <div class="jt-track"><span [style.width.%]="mastery(w)" [style.background]="w.color"></span></div>
                <span class="jt-pct">{{ mastery(w) }}%</span>
              </div>
              <span class="jt-go">გააგრძელე →</span>
            </button>
          } @else if (stateOf(i) === 'done') {
            <button type="button" class="jt-card" (click)="open(w)">
              <div class="jt-name">{{ w.name }}</div>
              <div class="jt-sub done">✓ დასრულებულია · კიდევ ითამაშე</div>
            </button>
          } @else {
            <div class="jt-card locked">
              <div class="jt-name">{{ w.name }}</div>
              <div class="jt-sub">🔒 {{ lockHint(i) }}</div>
            </div>
          }
        </div>
      }

      <!-- Next volume: the long-horizon Star Sky -->
      <div class="jt-stop tome2">
        <div class="jt-rail"><span class="jt-node t2">🌌</span></div>
        <button type="button" class="jt-card t2card" (click)="openSky()">
          <div class="kids-kicker" style="margin:0 0 2px;">— ტომი II</div>
          <div class="jt-name" style="color:#fff;">ვარსკვლავებით სავსე ცა</div>
          <div class="jt-sub" style="color:rgba(255,255,255,.72);">
            {{ allMastered() ? '🌈 ტომი I დასრულდა — ცა გელოდება!' : 'გრძელვადიანი მიზანი · ანთე ვარსკვლავები →' }}
          </div>
        </button>
      </div>
    </div>
  `
})
export class KidsJourneyComponent implements OnInit {
  private readonly api = inject(KidsExerciseService);
  private readonly router = inject(Router);

  readonly worlds = [...KIDS_WORLDS].sort((a, b) => a.order - b.order);
  readonly progress = signal<SkillProgress[]>([]);

  readonly masteredCount = computed(() => this.worlds.filter((_, i) => this.mastered(i)).length);
  readonly allMastered = computed(() => this.masteredCount() >= this.worlds.length);
  /** The first reachable, not-yet-mastered tour. */
  readonly currentIndex = computed(() => {
    for (let i = 0; i < this.worlds.length; i++) {
      if (this.unlocked(i) && !this.mastered(i)) return i;
    }
    return this.worlds.length; // everything mastered
  });

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  private mastered(i: number): boolean {
    return isMastered(this.progress().find((p) => p.skill === this.worlds[i].skill));
  }

  /** Sequential: a tour opens once the previous one is mastered. */
  unlocked(i: number): boolean {
    return i === 0 || this.mastered(i - 1);
  }

  stateOf(i: number): 'done' | 'current' | 'locked' {
    if (this.mastered(i)) return 'done';
    if (i === this.currentIndex()) return 'current';
    return 'locked';
  }

  lockHint(i: number): string {
    const prev = this.worlds[i - 1];
    return prev ? `ჯერ დაასრულე „${prev.name}"` : 'ჯერ ჩაკეტილია';
  }

  mastery(w: KidsWorld): number {
    return masteryPct(this.progress().find((x) => x.skill === w.skill));
  }

  tint(color: string): string {
    return `color-mix(in srgb, ${color} 18%, #fff)`;
  }

  open(w: KidsWorld): void {
    this.router.navigate(['/kids/world', w.id]);
  }

  openSky(): void {
    this.router.navigate(['/kids/sky']);
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
