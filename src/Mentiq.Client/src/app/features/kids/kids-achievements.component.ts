import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { KidsExerciseService } from './exercise/kids-exercise.service';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS } from './kids-worlds.data';
import { isMastered, masteryPct } from './kids-mastery';

interface RainbowBand {
  id: string;
  name: string;
  topic: string;
  color: string;
  skill: string;
  status: 'done' | 'current' | 'locked';
}

interface GrowBar {
  name: string;
  topic: string;
  color: string;
  pct: number;
}

/**
 * Design 06 — "Rainbow Path · My Skills". The long-horizon reward: each world is
 * a colour of a rainbow the child fills in as they progress, plus a calm,
 * visual view of how each skill is growing. Progression mirrors the journey map
 * (unlocked-by-stars), so all three screens tell one consistent story.
 */
@Component({
  selector: 'app-kids-achievements',
  standalone: true,
  template: `
    <div class="kids-top-row">
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>
      <div>
        <div class="kids-kicker" style="margin:0;">— მოგზაურობის ჯილდო</div>
        <div class="kids-h1" style="margin:2px 0 0; font-size:22px;">ცისარტყელას ბილიკი</div>
      </div>
    </div>

    <!-- Collected count -->
    <div class="rain-count">
      <span class="rc-big">{{ collected() }}</span><span class="rc-sub"> / {{ bands().length }}</span>
      <div class="rc-label">ფერი შეგროვდა</div>
    </div>

    <!-- Rainbow -->
    <div class="rain-wrap">
      <svg viewBox="0 0 340 210" preserveAspectRatio="xMidYMax meet">
        @for (b of bands(); track b.id; let i = $index) {
          <path [attr.d]="arc(i)" fill="none" [attr.stroke]="b.color" stroke-width="13" stroke-linecap="round"
                [attr.stroke-dasharray]="b.status === 'locked' ? '3 9' : null"
                [attr.opacity]="b.status === 'locked' ? 0.35 : 1" />
        }
      </svg>
    </div>

    <!-- Colour rows -->
    <div class="rain-rows">
      @for (b of bands(); track b.id) {
        <div class="rain-row" [class.current]="b.status === 'current'" [class.locked]="b.status === 'locked'">
          <span class="rr-dot" [style.background]="b.color"></span>
          <div class="rr-name">{{ b.name }} · <span>{{ b.topic }}</span></div>
          @switch (b.status) {
            @case ('done') { <span class="rr-status done">✓ შესრულდა</span> }
            @case ('current') { <span class="rr-status cur">— მიმდინარე</span> }
            @default { <span class="rr-status">🔒</span> }
          }
        </div>
      }
    </div>

    <!-- My growth (skill bars) -->
    <div class="kids-kicker" style="margin:26px 2px 12px;">— ჩემი ზრდა</div>
    <div class="grow-bars">
      @for (g of growth(); track g.name) {
        <div class="gbar">
          <div class="gb-lbl"><span class="gb-dot" [style.background]="g.color"></span>{{ g.topic }}</div>
          <div class="gb-track"><span [style.width.%]="g.pct" [style.background]="g.color"></span></div>
          <div class="gb-num">{{ g.pct }}</div>
        </div>
      }
    </div>
  `
})
export class KidsAchievementsComponent implements OnInit {
  private readonly api = inject(KidsExerciseService);
  private readonly router = inject(Router);

  private readonly worlds = [...KIDS_WORLDS].sort((a, b) => a.order - b.order);
  /** Same star gates as the journey map, so the three screens agree. */

  // Short topic label shown after the colour name ("წითელი · რიცხვები").
  private readonly topics: Record<string, string> = {
    counting: 'რიცხვები',
    comparison: 'შედარება',
    patterns: 'პატერნები',
    classification: 'დაჯგუფება',
    addition: 'შეკრება',
    attention: 'ყურადღება',
    memory: 'მეხსიერება',
    speed: 'სისწრაფე'
  };

  readonly progress = signal<SkillProgress[]>([]);
  readonly total = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));

  private mastered(skill: string): boolean {
    return isMastered(this.progress().find((p) => p.skill === skill));
  }

  /** The first tour not yet mastered — the one currently in progress. */
  private readonly currentIndex = computed(() => {
    const idx = this.worlds.findIndex((w) => !this.mastered(w.skill));
    return idx === -1 ? this.worlds.length : idx;
  });

  readonly bands = computed<RainbowBand[]>(() =>
    this.worlds.map((w, i) => ({
      id: w.id,
      name: this.colorName(w.color, i),
      topic: this.topics[w.skill] ?? w.tagline,
      color: w.color,
      skill: w.skill,
      status: this.mastered(w.skill) ? 'done' : i === this.currentIndex() ? 'current' : 'locked'
    }))
  );

  /** Collected = tours actually mastered. */
  readonly collected = computed(() => this.worlds.filter((w) => this.mastered(w.skill)).length);

  readonly growth = computed<GrowBar[]>(() =>
    this.worlds.map((w) => {
      const p = this.progress().find((x) => x.skill === w.skill);
      return { name: w.name, topic: this.topics[w.skill] ?? w.tagline, color: w.color, pct: masteryPct(p) };
    })
  );

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  /** A rainbow arc for band i — outer bands are widest. */
  arc(i: number): string {
    const n = this.worlds.length;
    const x = 22 + i * (120 / n);
    const peak = 40 + i * (120 / n);
    return `M${x} 200 Q 170 ${peak} ${340 - x} 200`;
  }

  private colorName(_hex: string, i: number): string {
    // Georgian rainbow colour names, in journey order.
    const names = ['წითელი', 'იისფერი', 'ნარინჯისფერი', 'ვარდისფერი', 'ლურჯი', 'ცისფერი', 'მწვანე', 'ყვითელი'];
    return names[i] ?? 'ფერი';
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
