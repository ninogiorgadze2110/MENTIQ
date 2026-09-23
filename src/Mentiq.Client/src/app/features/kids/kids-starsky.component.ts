import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { KidsCompanionComponent } from './kids-companion.component';
import { SkillProgress } from './exercise/exercise.models';
import { isMastered, MASTERY_CORRECT } from './kids-mastery';
import { KIDS_WORLDS } from './kids-worlds.data';

interface Star {
  icon: string;
  label: string;
  hint: string;
  done: boolean;
  /** The exercise theme a themed star mission uses to advance this milestone.
   *  Undefined → a mixed review (reserved for the meta / final stars). */
  type?: string;
  /** For "count to N" stars: cap the counting range at this number. */
  cap?: number;
  /** Progress toward lighting this star. */
  cur: number;
  goal: number;
  x: number;
  y: number;
}

/**
 * "Star Sky" (ტომი II) — the long-horizon goal beyond the rainbow. A night sky
 * that fills, star by star, as the child reaches lasting milestones (streaks,
 * mastered tours, personal bests). A months-long constellation to complete.
 */
@Component({
  selector: 'app-kids-starsky',
  standalone: true,
  imports: [KidsCompanionComponent],
  template: `
    <div class="kids-top-row">
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>
      <div>
        <div class="kids-kicker" style="margin:0;">— ტომი II · გრძელვადიანი მიზანი</div>
        <div class="kids-h1" style="margin:2px 0 0; font-size:22px;">ვარსკვლავებით სავსე ცა</div>
      </div>
    </div>

    @if (!unlocked()) {
      <!-- Volume II opens only after Volume I (the map) is fully completed. -->
      <div class="sky-lock">
        <div class="sky-lock-ic">🔒</div>
        <div class="sky-lock-t">ცა ჯერ ჩაკეტილია</div>
        <p class="sky-lock-s">ჯერ დაასრულე <b>— ტომი I · მოგზაურობის რუკა</b> (ყველა 8 ტერიტორია), მერე ვარსკვლავებით სავსე ცა გაიხსნება.</p>
        <div class="sky-lock-bar"><span [style.width.%]="tourPct()"></span></div>
        <div class="sky-lock-n">{{ toursMastered() }} / {{ totalTours }} ტერიტორია დასრულებულია</div>
        <button type="button" class="kids-btn" style="margin-top:16px;" (click)="goMap()">რუკაზე დაბრუნება →</button>
      </div>
    } @else {
    <div class="sky-badges">
      <span class="sky-badge">✦ {{ earned() }} / {{ stars().length }} ანთია</span>
      <span class="sky-badge streak">🔥 {{ streak() }} დღიანი სერია</span>
    </div>

    <!-- Constellation -->
    <div class="sky-panel">
      <svg viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet">
        <!-- edges: bright only between two lit stars -->
        @for (e of edges(); track $index) {
          <line [attr.x1]="stars()[e[0]].x" [attr.y1]="stars()[e[0]].y"
                [attr.x2]="stars()[e[1]].x" [attr.y2]="stars()[e[1]].y"
                [class.lit]="stars()[e[0]].done && stars()[e[1]].done" class="sky-edge" />
        }
        <!-- stars -->
        @for (s of stars(); track s.label; let i = $index) {
          <g [class.done]="s.done" [class.next]="i === nextIndex()">
            <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.done ? 6 : 3" class="sky-star" />
            @if (i === nextIndex()) { <circle [attr.cx]="s.x" [attr.cy]="s.y" r="11" class="sky-pulse" /> }
          </g>
        }
      </svg>
      <span class="sky-moon"></span>
      <div class="sky-comp"><app-kids-companion [type]="companion()" mood="idle" /></div>
      @if (nextIndex() >= 0) {
        <div class="sky-next">— შემდეგი: {{ stars()[nextIndex()].label }}</div>
      }
    </div>

    <!-- One clear next step (thematic; mixed only once all themes are done) -->
    <button type="button" class="kids-btn" style="width:100%; margin-top:14px;" (click)="play(targetStar())">
      ⭐ {{ ctaText() }} →
    </button>
    <p class="kids-sub" style="text-align:center; margin:10px 0 4px; font-size:12px;">
      აირჩიე ვარსკვლავი და ითამაშე მისი მისია — ⭐ თითოეული ცალკე ინთება.
    </p>

    <!-- Milestone tiles — each is a playable star mission -->
    <div class="sky-grid">
      @for (s of stars(); track s.label) {
        <button type="button" class="sky-tile" [class.on]="s.done" (click)="play(s)">
          <div class="sky-tile-ic">{{ s.done ? s.icon : '✦' }}</div>
          <div class="sky-tile-nm">{{ s.label }}</div>
          <div class="sky-tile-hint">{{ s.done ? 'მოპოვებულია' : s.hint }}</div>
          @if (!s.done) {
            <div class="sky-tile-bar"><span [style.width.%]="pct(s)"></span></div>
            <div class="sky-tile-go">{{ min(s.cur, s.goal) }} / {{ s.goal }} · თამაში ▸</div>
          } @else {
            <div class="sky-tile-go">გამეორება ▸</div>
          }
        </button>
      }
    </div>
    }
  `
})
export class KidsStarskyComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(KidsExerciseService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  readonly progress = signal<SkillProgress[]>([]);
  readonly streak = this.profile.streak;

  /** The highest number the child has correctly counted. */
  private maxCount(): number {
    return this.progress().find((p) => p.skill === 'counting')?.maxCorrectValue ?? 0;
  }

  /** Correct answers for a skill earned inside the Star Sky only (independent
   *  of the Volume I map tours). */
  private correctFor(skill: string): number {
    return this.progress().find((p) => p.skill === skill)?.skyCorrectCount ?? 0;
  }
  private skyTotalCorrect(): number {
    return this.progress().reduce((s, p) => s + (p.skyCorrectCount ?? 0), 0);
  }
  private skyMastered(skill: string): boolean {
    return this.correctFor(skill) >= MASTERY_CORRECT;
  }

  /** A gentle wave of positions across the sky — works for any milestone count. */
  private position(i: number, n: number): { x: number; y: number } {
    const x = 28 + (n <= 1 ? 0 : (i / (n - 1)) * 284);
    const y = 110 + Math.sin(i * 1.15) * 66 + (i % 2 ? 8 : -8);
    return { x, y };
  }

  /** Edges link consecutive milestones into one wandering constellation. */
  readonly edges = computed<[number, number][]>(() =>
    this.stars().slice(1).map((_, i) => [i, i + 1] as [number, number])
  );

  private speedBest(): number {
    try {
      const raw = localStorage.getItem(`mentiq.kids.speed.${this.auth.user()?.id ?? 'anon'}`);
      return raw ? (JSON.parse(raw).best ?? 0) : 0;
    } catch {
      return 0;
    }
  }

  readonly stars = computed<Star[]>(() => {
    const st = this.streak();
    const speed = this.speedBest();
    const maxCount = this.maxCount();

    const M = MASTERY_CORRECT;
    const skyTotal = this.skyTotalCorrect();
    // The final star lights when every themed star (the skill masteries) is lit.
    const skyMasteredCount = ['patterns', 'comparison', 'addition', 'attention', 'memory']
      .filter((s) => this.skyMastered(s)).length;
    const base: Omit<Star, 'x' | 'y'>[] = [
      { icon: '🌱', label: 'პირველი ნაბიჯი', hint: '10 სწორი პასუხი', done: skyTotal >= 10, type: 'counting', cap: 10, cur: skyTotal, goal: 10 },
      { icon: '🔟', label: 'თვლა 10-მდე', hint: 'დაითვალე 10-მდე', done: maxCount >= 10, type: 'counting', cap: 10, cur: maxCount, goal: 10 },
      { icon: '🔢', label: 'თვლა 20-მდე', hint: 'დაითვალე 20-მდე', done: maxCount >= 20, type: 'counting', cap: 20, cur: maxCount, goal: 20 },
      { icon: '💯', label: 'თვლა 100-მდე', hint: 'დაითვალე 100-მდე', done: maxCount >= 100, type: 'counting', cap: 100, cur: maxCount, goal: 100 },
      { icon: '🎨', label: 'ფერების ოსტატი', hint: 'ვარსკვლავების ფერები', done: this.skyMastered('patterns'), type: 'patterns', cur: this.correctFor('patterns'), goal: M },
      { icon: '⭐', label: 'შედარების ოსტატი', hint: 'რომელ ცაშია მეტი?', done: this.skyMastered('comparison'), type: 'comparison', cur: this.correctFor('comparison'), goal: M },
      { icon: '➕', label: 'შეკრების ოსტატი', hint: 'ტომის ვარსკვლავები', done: this.skyMastered('addition'), type: 'addition', cur: this.correctFor('addition'), goal: M },
      { icon: '🔭', label: 'ყურადღების თვალი', hint: 'იპოვე ვარსკვლავი', done: this.skyMastered('attention'), type: 'attention', cur: this.correctFor('attention'), goal: M },
      { icon: '🧠', label: 'მეხსიერების ოსტატი', hint: 'დამალული ვარსკვლავი', done: this.skyMastered('memory'), type: 'memory', cur: this.correctFor('memory'), goal: M },
      { icon: '⚡', label: 'სწრაფი გონება', hint: '20 პასუხი 60 წამში', done: speed >= 20, type: 'speed', cur: speed, goal: 20 },
      { icon: '🔥', label: '7-დღიანი სერია', hint: '7 დღე ზედიზედ', done: st >= 7, cur: st, goal: 7 },
      { icon: '🔥', label: '30-დღიანი სერია', hint: '30 დღე ზედიზედ', done: st >= 30, cur: st, goal: 30 },
      { icon: '🌈', label: 'ფინალი · შერეული', hint: 'ყველა ვარსკვლავი აანთე', done: skyMasteredCount >= 5, cur: skyMasteredCount, goal: 5 }
    ];
    const n = base.length;
    return base.map((b, i) => ({ ...b, ...this.position(i, n) }));
  });

  readonly earned = computed(() => this.stars().filter((s) => s.done).length);
  readonly nextIndex = computed(() => this.stars().findIndex((s) => !s.done));

  /** Volume II unlocks only when Volume I (all 8 map tours) is mastered. Each
   *  future volume follows the same rule: gated behind the one before it. */
  readonly totalTours = KIDS_WORLDS.length;
  readonly toursMastered = computed(() =>
    KIDS_WORLDS.filter((w) => isMastered(this.progress().find((p) => p.skill === w.skill))).length
  );
  readonly unlocked = computed(() => this.toursMastered() >= this.totalTours);
  tourPct(): number {
    return Math.round((this.toursMastered() / this.totalTours) * 100);
  }
  goMap(): void {
    this.router.navigate(['/kids/map']);
  }

  /** The next thematic star to work on (mixed final only once themes are done). */
  readonly targetStar = computed(() =>
    this.stars().find((s) => !s.done && s.type) ??
    this.stars().find((s) => !s.done) ??
    this.stars()[this.stars().length - 1]
  );
  readonly ctaText = computed(() => {
    const s = this.targetStar();
    return s.type ? `დაიწყე: ${s.label}` : 'ფინალური შერეული მისია';
  });

  /** Launch a themed star mission for this milestone (mixed if it has no theme). */
  play(s: Star): void {
    if (s.type === 'speed') {
      this.router.navigate(['/kids/world', 'speed', 'play']);
    } else if (s.type) {
      const queryParams: Record<string, string | number> = { t: s.type };
      if (s.cap) queryParams['max'] = s.cap;
      this.router.navigate(['/kids/world', 'sky', 'play'], { queryParams });
    } else {
      this.router.navigate(['/kids/world', 'sky', 'play']); // mixed final review
    }
  }

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  companion() {
    return this.profile.companion() ?? 'bunny';
  }

  pct(s: Star): number {
    return s.goal > 0 ? Math.min(100, Math.round((s.cur / s.goal) * 100)) : 0;
  }
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
