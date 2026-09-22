import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';
import { KidsCompanionComponent } from './kids-companion.component';
import { SkillProgress } from './exercise/exercise.models';
import { CompanionType, KIDS_COMPANIONS } from './kids-companions.data';

/**
 * Design 07.b — the companion profile. The friend that travels with the child:
 * their mood reflects the current streak, and three quiet stats show the bond
 * (days together, questions answered, stars earned). Cosmetic accessories are a
 * later reward; today the child can re-choose their friend.
 */
@Component({
  selector: 'app-kids-friend',
  standalone: true,
  imports: [KidsCompanionComponent],
  template: `
    <div class="kids-top-row">
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>
      <div>
        <div class="kids-kicker" style="margin:0;">— მეგობარი</div>
        <div class="kids-h1" style="margin:2px 0 0; font-size:22px;">{{ def().name }}, {{ def().species }}</div>
      </div>
    </div>

    <div style="text-align:center; margin-top:14px;">
      <div class="friend-halo"><app-kids-companion [type]="type()" [mood]="mood()" /></div>
      <div style="font-family:var(--ge-serif); font-size:26px; margin-top:6px;">{{ def().name }}</div>
      <div class="kids-sub" style="margin:2px 0 0;">{{ moodLine() }}</div>
    </div>

    <div class="friend-stats">
      <div class="fstat"><div class="fs-num">{{ streak() }}</div><div class="fs-lbl">დღე ერთად</div></div>
      <div class="fstat"><div class="fs-num">{{ questions() }}</div><div class="fs-lbl">კითხვა</div></div>
      <div class="fstat"><div class="fs-num">{{ stars() }}</div><div class="fs-lbl">ვარსკვლავი</div></div>
    </div>

    <button type="button" class="kids-btn secondary" style="width:100%; margin-top:24px;" (click)="change()">
      მეგობრის შეცვლა →
    </button>
  `
})
export class KidsFriendComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(KidsExerciseService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  readonly progress = signal<SkillProgress[]>([]);
  readonly streak = this.profile.streak;

  readonly type = computed<CompanionType>(() => this.profile.companion() ?? 'bunny');
  readonly def = computed(() => KIDS_COMPANIONS.find((c) => c.type === this.type()) ?? KIDS_COMPANIONS[0]);
  readonly mood = computed(() => (this.streak() > 0 ? 'happy' : 'idle'));

  readonly stars = computed(() => this.progress().reduce((s, p) => s + (p.score ?? 0), 0));
  readonly questions = computed(() => this.progress().reduce((s, p) => s + (p.totalAttempts ?? 0), 0));

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.progress.set(r), error: () => {} });
  }

  moodLine(): string {
    const s = this.streak();
    if (s >= 2) return `დღეს ბედნიერია — ${s} დღიანი სერიაა.`;
    if (s === 1) return 'დღეს ერთად ვისწავლეთ — ყოჩაღ!';
    return `${this.firstName()}, დღეს ერთად ვისწავლოთ?`;
  }

  private firstName(): string {
    return (this.auth.user()?.displayName ?? 'მეგობარო').split(' ')[0];
  }

  change(): void {
    this.router.navigate(['/kids/choose']);
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
