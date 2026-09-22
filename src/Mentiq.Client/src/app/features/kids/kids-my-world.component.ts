import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { SkillProgress } from './exercise/exercise.models';

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

    <!-- Living illustration: grows as pieces are earned -->
    <div class="mw-scene">
      <span class="mw-sun"></span>
      <span class="mw-cloud"></span>
      <span class="mw-hills"></span>
      @if (owns('🏠')) { <span class="mw-house"></span> }
      @if (owns('🌳')) { <span class="mw-tree a"></span><span class="mw-tree b"></span> }
      @if (owns('🌸')) { <span class="mw-flower a"></span><span class="mw-flower b"></span> }
      <span class="mw-next">{{ nextPiece() }}</span>
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

  /** A skill counts as "mastered" once it reaches this level (of 12). */
  private readonly masteryLevel = 6;

  readonly progress = signal<SkillProgress[]>([]);

  readonly stars = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly totalCorrect = computed(() => this.progress().reduce((s, p) => s + (p.correctAttempts ?? 0), 0));
  readonly mastered = computed(() => this.progress().filter((p) => p.level >= this.masteryLevel).length);
  readonly day = computed(() => Math.max(1, this.profile.streak()));

  /** The economy: every collectible is earned by a concrete action. */
  readonly items = computed<Collectible[]>(() => {
    const stars = this.stars();
    const correct = this.totalCorrect();
    const days = this.profile.streak();
    const mastered = this.mastered();
    const allMastered = mastered >= this.progress().length && this.progress().length > 0;
    return [
      { emoji: '🧱', name: 'აგური', source: 'ყოველი ⭐', count: stars },
      { emoji: '🌳', name: 'ხე', source: '5 სწორ პასუხზე', count: Math.floor(correct / 5) },
      { emoji: '🌸', name: 'ყვავილი', source: 'აქტიური დღე', count: days },
      { emoji: '🏠', name: 'სახლი', source: 'უნარის დაუფლება', count: mastered },
      { emoji: '🌉', name: 'ხიდი', source: '2 უნარი', count: Math.floor(mastered / 2) },
      { emoji: '⛲', name: 'შადრევანი', source: '60 ⭐', count: stars >= 60 ? 1 : 0 },
      { emoji: '☀️', name: 'მზე', source: '100 ⭐', count: stars >= 100 ? 1 : 0 },
      { emoji: '🌈', name: 'ცისარტყელა', source: 'ყველა უნარი', count: allMastered ? 1 : 0 }
    ];
  });

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  owns(emoji: string): boolean {
    return (this.items().find((it) => it.emoji === emoji)?.count ?? 0) > 0;
  }

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
