import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { ExerciseRendererComponent } from './exercise/exercise-renderer.component';
import { Exercise, SubmitExerciseResult } from './exercise/exercise.models';

/**
 * A short Kids session: fetch → answer → grade → gentle feedback → next, until a
 * handful of exercises are completed, then a celebration. Wrong answers never
 * "fail" the child — they simply retry the same exercise.
 */
@Component({
  selector: 'app-kids-session',
  standalone: true,
  imports: [ExerciseRendererComponent],
  template: `
    <button type="button" class="kids-round" (click)="quit()" aria-label="უკან">←</button>

    <!-- progress dots -->
    <div class="ex-progress">
      @for (i of dots(); track i) {
        <span class="ex-dot" [class.on]="i < completed()"></span>
      }
    </div>

    <div class="kids-panel" style="margin-top:12px; position:relative; overflow:hidden;">
      @if (done()) {
        <div class="ex-celebrate">
          <div style="font-size:64px;">🎉</div>
          <div class="kids-h1" style="margin-top:6px;">დღევანდელი მისია დასრულებულია!</div>
          <p class="kids-sub">შენ დააგროვე ⭐ {{ earned() }} ვარსკვლავი</p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:8px;">
            <button type="button" class="kids-btn" (click)="restart()">კიდევ ერთხელ ▶</button>
            <button type="button" class="kids-btn secondary" (click)="quit()">სახლში 🏠</button>
          </div>
        </div>
      } @else {
        @if (exercise(); as ex) {
          <app-exercise-renderer [exercise]="ex" [disabled]="locked()" (answered)="answer($event)" />

          @if (feedback(); as f) {
            <div class="ex-feedback" [class.good]="f.isCorrect" [class.bad]="!f.isCorrect">
              <div style="font-size:56px;">{{ f.isCorrect ? '⭐' : '🙈' }}</div>
              <div class="ex-fb-text">{{ f.feedback }}</div>
              @if (!f.isCorrect) {
                <button type="button" class="kids-btn" style="margin-top:12px;" (click)="retry()">კიდევ სცადე 🔁</button>
              }
            </div>
          }
        } @else {
          <div class="kids-sub" style="margin:0;">იტვირთება…</div>
        }
      }
    </div>
  `
})
export class KidsSessionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(KidsExerciseService);
  private readonly audio = inject(AudioService);

  private readonly target = 5;
  private readonly world = this.route.snapshot.paramMap.get('id');

  readonly exercise = signal<Exercise | null>(null);
  readonly feedback = signal<SubmitExerciseResult | null>(null);
  readonly locked = signal(false);
  readonly completed = signal(0);
  readonly done = signal(false);
  readonly earned = signal(0);

  private attemptNumber = 1;
  private shownAt = 0;

  readonly dots = computed(() => Array.from({ length: this.target }, (_, i) => i));

  ngOnInit(): void {
    this.loadNext();
  }

  private loadNext(): void {
    this.feedback.set(null);
    this.locked.set(false);
    this.attemptNumber = 1;
    this.exercise.set(null);
    this.api.next(this.world).subscribe({
      next: (ex) => {
        this.exercise.set(ex);
        this.shownAt = Date.now();
      },
      error: () => {}
    });
  }

  answer(value: string): void {
    const ex = this.exercise();
    if (!ex || this.locked()) return;
    this.locked.set(true);
    this.audio.blip();

    this.api
      .submit({
        token: ex.token,
        answer: value,
        responseTimeMs: Date.now() - this.shownAt,
        attemptNumber: this.attemptNumber
      })
      .subscribe({
        next: (res) => {
          this.feedback.set(res);
          this.audio.cue(res.feedbackAudioKey);
          if (res.isCorrect) {
            this.earned.update((s) => s + res.starsAwarded);
            setTimeout(() => this.afterCorrect(), 1300);
          }
          // On a wrong answer we wait for the child to tap "try again" (retry()).
        },
        error: () => this.locked.set(false)
      });
  }

  private afterCorrect(): void {
    const next = this.completed() + 1;
    this.completed.set(next);
    if (next >= this.target) {
      this.done.set(true);
      this.audio.cue('finished');
    } else {
      this.loadNext();
    }
  }

  retry(): void {
    this.attemptNumber++;
    this.feedback.set(null);
    this.locked.set(false);
    this.shownAt = Date.now();
  }

  restart(): void {
    this.completed.set(0);
    this.earned.set(0);
    this.done.set(false);
    this.loadNext();
  }

  quit(): void {
    this.audio.stop();
    this.router.navigate(['/kids']);
  }
}
