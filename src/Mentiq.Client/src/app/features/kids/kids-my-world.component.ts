import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS } from './kids-worlds.data';
import { isMastered, MASTERY_CORRECT, MASTERY_DAYS } from './kids-mastery';

interface Collectible {
  emoji: string;
  name: string;
  /** Where it comes from — shown so the child/parent sees how to earn it. */
  source: string;
  count: number;
}

/**
 * Design 07.a — "My World". Long-horizon motivation with a TRANSPARENT economy:
 * every piece is earned by a specific action (a star, correct answers, active
 * days, mastering a skill), and each tile shows exactly where it comes from.
 * Derived entirely from real progress — no new backend, always in sync.
 */
@Component({
  selector: 'app-kids-my-world',
  standalone: true,
  template: `
    <div class="kids-top-row">
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>
      <div>
        <div class="kids-kicker" style="margin:0;">— ჩემი სამყარო</div>
        <div class="kids-h1" style="margin:2px 0 0; font-size:22px;">{{ firstName() }}ს ველი</div>
      </div>
      <span class="mw-day">დღე {{ day() }}</span>
    </div>

    <!-- How it works — so it's clear from the very first visit -->
    <div class="mw-explain">
      <span class="mw-ex-ic">🌱</span>
      <div>
        <div class="mw-ex-t">როგორ იზრდება შენი სამყარო?</div>
        <div class="mw-ex-s">ითამაშე მისიები → დააგროვე ⭐ და ნივთები → ააშენე ველი. ქვემოთ ყოველი ბარათი გიჩვენებს <b>საიდან</b> მოდის ის.</div>
      </div>
    </div>

    <!-- Living illustration: assembles piece by piece as items are earned -->
    <div class="mw-scene">
      @if (owns('☀️')) { <span class="mw-sun"></span> }
      <span class="mw-cloud"></span>
      @if (owns('🌈')) { <span class="mw-rainbow">🌈</span> }
      <span class="mw-hills"></span>
      @for (it of sceneItems(); track it.key) {
        <span class="mw-piece" [style.left.%]="it.x" [style.font-size.px]="it.size"
              [style.animation-delay.ms]="it.delay">{{ it.emoji }}</span>
      }
      <span class="mw-slot" [style.font-size.px]="22">{{ nextPiece() }}</span>
    </div>

    <!-- Inventory: each tile shows the count AND how it's earned -->
    <div class="mw-inv-head">
      <span class="kids-kicker" style="margin:0;">— ინვენტარი</span>
      <span class="mw-inv-count">⭐ {{ stars() }}</span>
    </div>
    <div class="mw-inv">
      @for (it of items(); track it.emoji) {
        <div class="mw-item" [class.locked]="it.count === 0">
          <div class="mw-emoji">{{ it.emoji }}</div>
          <div class="mw-qty">{{ it.count > 0 ? '×' + it.count : '🔒' }}</div>
          <div class="mw-src">{{ it.source }}</div>
        </div>
      }
    </div>

    <p class="kids-sub" style="text-align:center; margin-top:18px;">
      ითამაშე, უპასუხე სწორად და დააგროვე — შენი სამყარო გაიზრდება! 🌱
    </p>
  `
})
export class KidsMyWorldComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(KidsExerciseService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  readonly progress = signal<SkillProgress[]>([]);

  readonly stars = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly totalCorrect = computed(() => this.progress().reduce((s, p) => s + (p.correctAttempts ?? 0), 0));
  readonly mastered = computed(() => this.progress().filter((p) => isMastered(p)).length);
  readonly day = computed(() => Math.max(1, this.profile.streak()));

  /** The economy: every collectible is earned by a concrete action. */
  readonly items = computed<Collectible[]>(() => {
    const stars = this.stars();
    const correct = this.totalCorrect();
    const days = this.profile.streak();
    const mastered = this.mastered();
    const total = KIDS_WORLDS.length; // always 8 tours
    const allMastered = mastered >= total;
    // Each source is concrete and spelled out so it's clear how a piece is earned.
    const tour = `ტურის დასრულება · ${MASTERY_CORRECT} სწორი + ${MASTERY_DAYS} დღე`;
    return [
      { emoji: '🧱', name: 'აგური', source: 'ყოველ ⭐-ზე', count: stars },
      { emoji: '🌳', name: 'ხე', source: 'ყოველ 5 სწორ პასუხზე', count: Math.floor(correct / 5) },
      { emoji: '🌸', name: 'ყვავილი', source: 'ყოველ აქტიურ დღეს', count: days },
      { emoji: '🏠', name: 'სახლი', source: `${tour} (${mastered}/${total})`, count: mastered },
      { emoji: '🌉', name: 'ხიდი', source: `2 ტურის დასრულება (${mastered}/2)`, count: Math.floor(mastered / 2) },
      { emoji: '⛲', name: 'შადრევანი', source: `60 ⭐ (${Math.min(stars, 60)}/60)`, count: stars >= 60 ? 1 : 0 },
      { emoji: '☀️', name: 'მზე', source: `100 ⭐ (${Math.min(stars, 100)}/100)`, count: stars >= 100 ? 1 : 0 },
      { emoji: '🌈', name: 'ცისარტყელა', source: `8 ტურის დასრულება (${mastered}/${total})`, count: allMastered ? 1 : 0 }
    ];
  });

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  owns(emoji: string): boolean {
    return (this.items().find((it) => it.emoji === emoji)?.count ?? 0) > 0;
  }

  /** The earned pieces laid out along the ground — more items appear as the
   *  child collects more, so the village literally assembles over time. */
  readonly sceneItems = computed(() => {
    const caps: Record<string, number> = { '🏠': 2, '🌳': 5, '🌸': 6 };
    const sizes: Record<string, number> = { '🏠': 38, '🌳': 32, '🌸': 20 };
    const built: { emoji: string; size: number }[] = [];
    for (const emoji of ['🏠', '🌳', '🌸']) {
      const n = Math.min(this.items().find((it) => it.emoji === emoji)?.count ?? 0, caps[emoji]);
      for (let k = 0; k < n; k++) built.push({ emoji, size: sizes[emoji] });
    }
    const n = built.length;
    return built.map((b, i) => ({
      key: b.emoji + i,
      emoji: b.emoji,
      size: b.size,
      x: n <= 1 ? 20 : 8 + (i * 70) / (n - 1),
      delay: i * 70
    }));
  });

  /** The next piece not yet earned — shown as a dashed placeholder in the scene. */
  nextPiece(): string {
    return this.items().find((it) => it.count === 0)?.emoji ?? '🌈';
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'მე').split(' ')[0];
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
