import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { SkillProgress } from './exercise/exercise.models';
import { KIDS_WORLDS } from './kids-worlds.data';

interface SkillRow {
  topic: string;
  color: string;
  pct: number;
  correct: number;
  total: number;
}

/**
 * Design 09 — the Parent view (mobile). Calm and editorial, never gamified: one
 * idea per block, supportive rather than evaluative language. Built entirely on
 * the child's real skill progress, so it stays truthful and in sync.
 */
@Component({
  selector: 'app-kids-parent',
  standalone: true,
  template: `
    <div class="kids-top-row">
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>
      <div>
        <div class="kids-kicker" style="margin:0;">— მიმოხილვა</div>
        <div class="kids-h1" style="margin:2px 0 0; font-size:22px;">{{ firstName() }}ს პროგრესი</div>
      </div>
      <span class="pv-child">
        <span class="pv-ava">{{ initial() }}</span>{{ firstName() }}
      </span>
    </div>

    <!-- 2×2 key numbers -->
    <div class="pv-grid">
      <div class="pv-cell br bb"><div class="kids-kicker" style="margin:0;">— სავარჯიშო</div><div class="pv-num">{{ attempts() }}</div></div>
      <div class="pv-cell bb"><div class="kids-kicker" style="margin:0;">— აქტ. დღე</div><div class="pv-num">{{ streak() }}<span> / 7</span></div></div>
      <div class="pv-cell br"><div class="kids-kicker" style="margin:0;">— სიზუსტე</div><div class="pv-num">{{ accuracy() }}<span>%</span></div></div>
      <div class="pv-cell"><div class="kids-kicker" style="margin:0;">— ვარსკვლავი</div><div class="pv-num">{{ stars() }}</div></div>
    </div>

    <!-- Skills -->
    <div class="pv-card">
      <div class="kids-kicker" style="margin:0 0 6px;">— უნარები</div>
      @for (s of skills(); track s.topic) {
        <div class="pv-sbar">
          <div class="pv-lbl">{{ s.topic }}</div>
          <div class="pv-track"><span [style.width.%]="s.pct" [style.background]="s.color"></span></div>
          <div class="pv-val">{{ s.pct }}</div>
        </div>
      }
    </div>

    <!-- Supportive note -->
    <div class="pv-note">
      <div class="kids-kicker" style="margin:0;">— მოკლე შენიშვნა</div>
      <div class="pv-note-t">{{ note() }}</div>
    </div>

    <!-- Recent activity -->
    <div class="pv-card">
      <div class="kids-kicker" style="margin:0 0 6px;">— ბოლო აქტივობა</div>
      @for (s of recent(); track s.topic) {
        <div class="pv-recent">
          <span>{{ s.topic }}</span>
          <span class="pv-score" [class.good]="s.total > 0 && s.correct / s.total >= 0.7">{{ s.correct }} / {{ s.total }}</span>
        </div>
      } @empty {
        <div class="kids-sub" style="margin:8px 0 0; font-size:13px;">ჯერ არ დაწყებულა — მალე გამოჩნდება.</div>
      }
    </div>

    <!-- Rainbow progress -->
    <div class="pv-rainbow">
      <span class="pv-rb-ic">🌈</span>
      <div style="flex:1; min-width:0;">
        <div style="font-family:var(--ge-serif); font-size:14px;">ცისარტყელას ბილიკი · {{ collected() }}/{{ worldsCount }}</div>
        <div class="pv-rb-sub">{{ remainingColors() > 0 ? 'კიდევ ' + remainingColors() + ' ფერი დარჩა' : 'ცისარტყელა დასრულებულია! ★' }}</div>
      </div>
    </div>
  `
})
export class KidsParentComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(KidsExerciseService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  private readonly worlds = [...KIDS_WORLDS].sort((a, b) => a.order - b.order);
  private readonly unlockAt = [0, 5, 13, 22, 32, 44, 58, 74];
  readonly worldsCount = this.worlds.length;

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
  readonly streak = this.profile.streak;

  readonly attempts = computed(() => this.progress().reduce((s, p) => s + (p.totalAttempts ?? 0), 0));
  readonly correct = computed(() => this.progress().reduce((s, p) => s + (p.correctAttempts ?? 0), 0));
  readonly stars = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly accuracy = computed(() => (this.attempts() > 0 ? Math.round((this.correct() / this.attempts()) * 100) : 0));

  readonly skills = computed<SkillRow[]>(() =>
    this.worlds.map((w) => {
      const p = this.progress().find((x) => x.skill === w.skill);
      const pct = p ? (p.totalAttempts > 0 ? p.accuracy : Math.round((p.level / 12) * 100)) : 0;
      return {
        topic: this.topics[w.skill] ?? w.tagline,
        color: w.color,
        pct,
        correct: p?.correctAttempts ?? 0,
        total: p?.totalAttempts ?? 0
      };
    })
  );

  /** Skills the child has actually practised, most recent effort surfaced. */
  readonly recent = computed(() => this.skills().filter((s) => s.total > 0).slice(0, 5));

  readonly collected = computed(() => {
    let idx = 0;
    for (let i = 0; i < this.worlds.length; i++) {
      if (this.stars() >= (this.unlockAt[i] ?? Infinity)) idx = i;
    }
    return idx + 1;
  });
  readonly remainingColors = computed(() => Math.max(0, this.worldsCount - this.collected()));

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  /** A gentle, supportive note built from the weakest practised skill. */
  note(): string {
    const practised = this.skills().filter((s) => s.total > 0);
    if (!practised.length) return 'მოგზაურობა ახლა იწყება — მოკლე ყოველდღიური ვარჯიში საუკეთესო დასაწყისია.';
    const weakest = practised.reduce((a, b) => (b.pct < a.pct ? b : a));
    const strongest = practised.reduce((a, b) => (b.pct > a.pct ? b : a));
    return `${weakest.topic} მშვიდად უმჯობესდება. ${strongest.topic} უკვე მაღალ დონეზეა — მოკლე ყოველდღიური ვარჯიში კიდევ დააჩქარებდა.`;
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'ბავშვი').split(' ')[0];
  }

  initial(): string {
    return (this.firstName().charAt(0) || 'ბ').toUpperCase();
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
