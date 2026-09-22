import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { KidsCompanionComponent } from './kids-companion.component';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS, KidsWorld } from './kids-worlds.data';
import { masteryPct } from './kids-mastery';

/**
 * Child Home (design 02): one clear action — "start today's mission" — over a
 * calm context of streak, journey and skills. The rest is quiet.
 */
@Component({
  selector: 'app-kids-home',
  standalone: true,
  imports: [RouterLink, KidsCompanionComponent],
  template: `
    <!-- greeting + streak -->
    <div class="kh-top">
      <span class="kids-avatar">{{ initial() }}</span>
      <div>
        <div class="kids-greet-k">{{ greeting() }},</div>
        <div class="kids-greet-name">{{ firstName() }}</div>
      </div>
      <span class="kh-streak">🔥 <b>{{ streak() }}</b></span>
    </div>

    @if (current(); as w) {
      <!-- daily mission card -->
      <div class="kh-mission">
        <div class="kh-mission-orb"></div>
        <div style="position:relative;">
          <div class="kids-kicker" style="margin:0;">— დღის მისია</div>
          <h2 class="kh-mission-title">{{ w.name }}</h2>
          <div class="kh-mission-meta">5 კითხვა · ~ 3 წუთი · {{ w.tagline }}</div>
          <div class="kh-mission-illo">
            <span class="kh-illo-comp" [style.background]="tint(w.color)"><app-kids-companion [type]="companion()" mood="idle" /></span>
            <div class="kh-dots">
              @for (d of [0,1,2,3,4]; track d) { <span [style.background]="w.color"></span> }
            </div>
          </div>
          <button type="button" class="kids-btn" style="width:100%; margin-top:16px; padding:15px; font-size:15px;" (click)="start(w)">დაიწყე მისია →</button>
        </div>
      </div>

      <!-- journey summary: a strip of territories (design 02) -->
      <div class="kh-journey">
        <div class="kh-row-head"><span class="kids-kicker" style="margin:0;">— შენი მოგზაურობა</span><a routerLink="/kids/map" class="kh-link">სრული რუკა →</a></div>
        <div class="kh-terrs">
          @for (t of strip(); track t.world.id) {
            <div class="kh-terr-card" [class.locked]="!t.unlocked">
              <div class="kh-terr-ic">{{ t.world.emoji }}</div>
              <div class="kh-terr-nm">{{ shortName(t.world) }}</div>
              @if (t.unlocked) {
                <div class="kh-terr-pc">{{ t.pct }}%</div>
              } @else {
                <div class="kh-terr-lk">🔒</div>
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- skill cards -->
    <div class="kh-skills">
      @for (s of topSkills(); track s.world.id) {
        <button type="button" class="kh-skill" (click)="start(s.world)">
          <span class="kh-skill-ic" [style.background]="s.world.color">{{ s.world.emoji }}</span>
          <div class="kh-skill-name">{{ shortName(s.world) }}</div>
          <div class="kh-skill-stat">{{ s.progress ? skillPct(s.progress) + '% ★' : 'ახალი' }}</div>
        </button>
      }
    </div>
  `
})
export class KidsHomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(KidsExerciseService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  private readonly worlds = [...KIDS_WORLDS].sort((a, b) => a.order - b.order);
  private readonly unlockAt = [0, 5, 13, 22, 32, 44, 58, 74];

  readonly progress = signal<SkillProgress[]>([]);
  readonly streak = this.profile.streak;

  readonly total = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly current = computed(() => {
    const unlocked = this.worlds.filter((_, i) => this.total() >= (this.unlockAt[i] ?? Infinity));
    return unlocked[unlocked.length - 1] ?? this.worlds[0];
  });

  /** A 4-territory window starting at the current world (design 02 strip). */
  readonly strip = computed(() => {
    const idx = this.worlds.indexOf(this.current());
    return this.worlds.slice(idx, idx + 4).map((world, k) => ({
      world,
      unlocked: this.total() >= (this.unlockAt[idx + k] ?? Infinity),
      pct: this.mastery(world)
    }));
  });

  /** Three skills to surface — the current world and the two around it. */
  readonly topSkills = computed(() => {
    const idx = this.worlds.indexOf(this.current());
    return [this.worlds[idx], this.worlds[idx + 1] ?? this.worlds[0], this.worlds[idx + 2] ?? this.worlds[1]]
      .filter((w, i, arr) => w && arr.indexOf(w) === i)
      .slice(0, 3)
      .map((world) => ({ world, progress: this.progress().find((p) => p.skill === world.skill) ?? null }));
  });

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  companion() {
    return this.profile.companion() ?? 'bunny';
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'მეგობარო').split(' ')[0];
  }

  initial(): string {
    return (this.firstName().charAt(0) || 'მ').toUpperCase();
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 11) return 'დილა მშვიდობისა';
    if (h < 18) return 'გამარჯობა';
    return 'საღამო მშვიდობისა';
  }

  /** Skill-card growth %, consistent with the mastery bars. */
  skillPct(p: SkillProgress): number {
    return masteryPct(p);
  }

  mastery(w: KidsWorld): number {
    return masteryPct(this.progress().find((x) => x.skill === w.skill));
  }

  shortName(w: KidsWorld): string {
    return w.name.split(' ')[0];
  }

  tint(color: string): string {
    return `color-mix(in srgb, ${color} 16%, #fff)`;
  }

  start(w: KidsWorld): void {
    this.router.navigate(['/kids/world', w.id, 'play']);
  }
}
