import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { KidsExerciseService } from './exercise/kids-exercise.service';
import { SkillProgress } from './exercise/exercise.models';

interface Milestone {
  stars: number;
  emoji: string;
}

interface SkillMeta {
  emoji: string;
  name: string;
}

/**
 * Kids "achievements" as a step-by-step journey: the child climbs a path of star
 * milestones that light up one by one as stars are earned, plus a per-skill
 * mastery view. Deliberately visual and celebratory rather than statistical.
 */
@Component({
  selector: 'app-kids-achievements',
  standalone: true,
  template: `
    <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>

    <div class="kids-h1" style="margin-top:10px;">ჩემი ჯილდოები 🏆</div>
    <p class="kids-sub">დააგროვე ვარსკვლავები და ახვედი ბილიკზე!</p>

    <!-- Star journey: milestones light up step by step -->
    <div class="kids-panel" style="text-align:left;">
      <div style="font-weight:800; margin-bottom:14px;">⭐ {{ total() }} ვარსკვლავი</div>
      <div class="kids-journey">
        @for (m of milestones; track m.stars; let i = $index) {
          <div class="kj-step" [class.reached]="total() >= m.stars" [class.current]="isCurrent(i)">
            <div class="kj-node">{{ total() >= m.stars ? m.emoji : '🔒' }}</div>
            <div class="kj-label">{{ m.stars }}</div>
            @if (!last(i)) { <div class="kj-line" [class.on]="total() >= milestones[i + 1].stars"></div> }
          </div>
        }
      </div>
    </div>

    <!-- Skill mastery -->
    <div style="margin-top:22px; font-weight:800; padding-left:4px;">უნარები</div>
    <div class="kids-skills">
      @for (s of skills(); track s.skill) {
        <div class="kids-skill">
          <div class="ks-emoji">{{ meta(s.skill).emoji }}</div>
          <div style="flex:1; min-width:0;">
            <div class="ks-name">{{ meta(s.skill).name }}</div>
            <div class="ks-bar"><span [style.width.%]="s.level / 12 * 100"></span></div>
          </div>
          <div class="ks-level">დონე {{ s.level }}</div>
        </div>
      } @empty {
        <div class="kids-sub" style="padding:20px; text-align:center;">
          ჯერ არ გითამაშია — დაიწყე რომელიმე სამყაროდან! 🎮
        </div>
      }
    </div>
  `
})
export class KidsAchievementsComponent implements OnInit {
  private readonly api = inject(KidsExerciseService);
  private readonly router = inject(Router);

  readonly milestones: Milestone[] = [
    { stars: 5, emoji: '🌱' },
    { stars: 15, emoji: '🌟' },
    { stars: 30, emoji: '🎈' },
    { stars: 50, emoji: '🏅' },
    { stars: 80, emoji: '🏆' },
    { stars: 120, emoji: '👑' }
  ];

  private readonly skillMeta: Record<string, SkillMeta> = {
    counting: { emoji: '🍎', name: 'დათვლა' },
    comparison: { emoji: '🥕', name: 'მეტი და ნაკლები' },
    patterns: { emoji: '🌈', name: 'პატერნები' },
    classification: { emoji: '🧸', name: 'დაჯგუფება' },
    addition: { emoji: '🚀', name: 'შეკრება' },
    attention: { emoji: '🐠', name: 'ყურადღება' },
    memory: { emoji: '🧠', name: 'მეხსიერება' },
    speed: { emoji: '⭐', name: 'სისწრაფე' }
  };

  readonly skills = signal<SkillProgress[]>([]);
  readonly total = computed(() => this.skills().reduce((sum, s) => sum + (s.score ?? 0), 0));

  ngOnInit(): void {
    this.api.progress().subscribe({ next: (r) => this.skills.set(r), error: () => {} });
  }

  meta(skill: string): SkillMeta {
    return this.skillMeta[skill] ?? { emoji: '🎯', name: skill };
  }

  last(i: number): boolean {
    return i === this.milestones.length - 1;
  }

  isCurrent(i: number): boolean {
    const t = this.total();
    const reached = t >= this.milestones[i].stars;
    const nextNotReached = this.last(i) || t < this.milestones[i + 1].stars;
    return reached && nextNotReached;
  }

  back(): void {
    this.router.navigate(['/kids']);
  }
}
