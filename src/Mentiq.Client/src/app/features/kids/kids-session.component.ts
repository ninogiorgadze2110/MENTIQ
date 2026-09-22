import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';
import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { ExerciseRendererComponent } from './exercise/exercise-renderer.component';
import { KidsCompanionComponent } from './kids-companion.component';
import { KidsProfileService } from './kids-profile.service';
import { Exercise, SubmitExerciseResult } from './exercise/exercise.models';
import { KIDS_WORLDS } from './kids-worlds.data';

/**
 * A short Kids mission (design 04): a top bar with progress + hearts, a spoken
 * question, then a warm full-screen correct/wrong state with the companion.
 * Bounded — it ends at a fixed number of correct answers or when hearts run out.
 * Wrong answers never feel like failure.
 */
@Component({
  selector: 'app-kids-session',
  standalone: true,
  imports: [ExerciseRendererComponent, KidsCompanionComponent],
  template: `
   <div class="ex-shell" [class.presch]="preschool()">
    <!-- Top bar: quit · progress · hearts (hearts hidden for preschoolers) -->
    <div class="ex-top">
      <button type="button" class="ex-quit" (click)="quit()" aria-label="დახურვა">✕</button>
      <div class="ex-bar"><span [style.width.%]="barPct()"></span></div>
      <div class="ex-hearts">
        @for (h of [0,1,2]; track h) { <span>{{ h < hearts() ? '❤️' : '🤍' }}</span> }
      </div>
    </div>

    @if (!done()) {
      <div class="ex-kicker">
        <span class="kids-kicker" style="margin:0;">— მისია · {{ worldName() }}</span>
        <span class="ex-qn">კითხვა {{ completed() + 1 }} / {{ target }}</span>
      </div>
    }

    <div class="kids-panel" style="margin-top:12px; position:relative; overflow:hidden;">
      @if (done()) {
        <div class="ex-celebrate">
          <div style="display:grid; place-items:center; margin-bottom:10px;">
            <app-kids-companion [type]="companion()" mood="happy" />
          </div>
          <div class="kids-h1" style="margin-top:6px;">{{ heartsOut() ? 'კარგი მცდელობა!' : 'მისია დასრულებულია!' }}</div>
          <p class="kids-sub">შენ დააგროვე ⭐ {{ earned() }} ვარსკვლავი</p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:8px;">
            <button type="button" class="kids-btn" (click)="restart()">კიდევ ერთხელ ▶</button>
            <button type="button" class="kids-btn secondary" (click)="quit()">სახლში 🏠</button>
          </div>
        </div>
      } @else {
        @if (feedback(); as f) {
          @if (f.isCorrect) {
            <div class="ex-state good">
              <div class="ex-conf">
                @for (c of confetti; track $index) {
                  <span [style.left.%]="c.x" [style.background]="c.c" [style.animation-delay.ms]="c.d"></span>
                }
              </div>
              <div class="ex-comp-ring"><app-kids-companion [type]="companion()" mood="happy" /></div>
              <h2 class="ex-good-title">ყოჩაღ, {{ firstName() }}!</h2>
              <div class="ex-chips">
                <span class="ex-chip brand">+{{ f.starsAwarded * 6 }} XP</span>
                @if (f.starsAwarded > 0) { <span class="ex-chip">⭐ +{{ f.starsAwarded }}</span> }
              </div>
              <button type="button" class="kids-btn" style="min-width:180px;" (click)="advance()">შემდეგი →</button>
            </div>
          } @else {
            <div class="ex-state bad">
              <div class="ex-comp-sad"><app-kids-companion [type]="companion()" mood="sad" /></div>
              <h2 class="ex-bad-title">არა უშავს — <em>კიდევ ვცადოთ.</em></h2>
              @if (hintObjects(f.correctAnswer); as n) {
                <!-- Show the answer as objects (design 04.c) — count, don't read. -->
                <p class="kids-sub" style="margin:8px 0 10px;">სწორი პასუხია <strong>{{ f.correctAnswer }}</strong>:</p>
                <div class="ex-objects" style="margin:0 0 18px; min-height:0;">
                  @for (i of n; track i) { <span class="ex-obj sm">{{ hintEmoji() }}</span> }
                </div>
              } @else {
                <p class="kids-sub" style="margin:8px 0 18px;">სწორი პასუხი: <strong>{{ f.correctAnswer }}</strong></p>
              }
              <button type="button" class="kids-btn" style="min-width:180px;" (click)="advance()">შემდეგი →</button>
            </div>
          }
        } @else {
          @if (exercise(); as ex) {
            @if (preschool()) {
              <!-- Design 05: audio-first — one big play button, minimal text. -->
              <div class="presch-listen">
                <button type="button" class="presch-play" (click)="replay(ex)" aria-label="მოსმენა">
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <div class="presch-cap">— ისმინე —</div>
              </div>
            }
            <app-exercise-renderer [exercise]="ex" [disabled]="locked()" (answered)="answer($event)" />
          } @else {
            <div class="kids-sub" style="margin:0;">იტვირთება…</div>
          }
        }
      }
    </div>
   </div>
  `
})
export class KidsSessionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(KidsExerciseService);
  private readonly audio = inject(AudioService);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(KidsProfileService);

  readonly target = 5;
  private readonly world = this.route.snapshot.paramMap.get('id');

  readonly exercise = signal<Exercise | null>(null);
  readonly feedback = signal<SubmitExerciseResult | null>(null);
  readonly locked = signal(false);
  readonly completed = signal(0);
  readonly hearts = signal(3);
  readonly done = signal(false);
  readonly heartsOut = signal(false);
  readonly earned = signal(0);

  private shownAt = 0;
  private advanceTimer?: ReturnType<typeof setTimeout>;

  readonly confetti = Array.from({ length: 10 }, () => ({
    x: 10 + Math.random() * 80,
    c: ['#f4a83a', '#e97862', '#7cc79a', '#78b1e8', '#b892f3', '#5b4de0'][Math.floor(Math.random() * 6)],
    d: Math.round(Math.random() * 250)
  }));

  readonly barPct = computed(() => Math.round((this.completed() / this.target) * 100));

  /** Younger children (4–5) get the calmer, audio-first, larger layout (design 05). */
  readonly preschool = computed(() => {
    const age = this.auth.user()?.age;
    return age != null && age <= 5;
  });

  /** Replay the current question's audio (preschool big play button). */
  replay(ex: Exercise): void {
    this.audio.play(ex.instructionAudioKey, ex.instruction);
  }

  ngOnInit(): void {
    this.loadNext();
  }

  worldName(): string {
    return KIDS_WORLDS.find((w) => w.id === this.world)?.name ?? 'მისია';
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'მეგობარო').split(' ')[0];
  }

  companion() {
    return this.profile.companion() ?? 'bunny';
  }

  /** Object to draw in the hint (the current exercise's countable object). */
  hintEmoji(): string {
    return this.exercise()?.visual.emoji ?? '🍎';
  }

  /** If the correct answer is a small count, return an array to draw it as
   *  objects; otherwise null (answer isn't a countable number). */
  hintObjects(answer: string): number[] | null {
    const n = parseInt(answer, 10);
    if (!Number.isFinite(n) || String(n) !== answer.trim() || n < 1 || n > 12) return null;
    return Array.from({ length: n }, (_, i) => i);
  }

  private loadNext(): void {
    this.feedback.set(null);
    this.locked.set(false);
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
        attemptNumber: 1
      })
      .subscribe({
        next: (res) => {
          this.feedback.set(res);
          this.audio.cue(res.feedbackAudioKey);
          if (res.isCorrect) {
            this.earned.update((s) => s + res.starsAwarded);
          } else {
            this.hearts.update((h) => Math.max(0, h - 1));
          }
          // Correct auto-advances; a wrong answer waits for the child to tap.
          if (res.isCorrect) {
            this.advanceTimer = setTimeout(() => this.advance(), 1600);
          }
        },
        error: () => this.locked.set(false)
      });
  }

  /** Advance: correct answers count toward the mission; it ends on target or 0 hearts. */
  advance(): void {
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    const wasCorrect = this.feedback()?.isCorrect ?? false;

    if (wasCorrect) {
      const next = this.completed() + 1;
      this.completed.set(next);
      if (next >= this.target) return this.finish(false);
    } else if (this.hearts() <= 0) {
      return this.finish(true);
    }
    this.loadNext();
  }

  private finish(heartsOut: boolean): void {
    this.heartsOut.set(heartsOut);
    this.done.set(true);
    this.profile.recordActiveDay();
    this.audio.cue('finished');
  }

  restart(): void {
    this.completed.set(0);
    this.earned.set(0);
    this.hearts.set(3);
    this.heartsOut.set(false);
    this.done.set(false);
    this.loadNext();
  }

  quit(): void {
    this.audio.stop();
    this.router.navigate(['/kids']);
  }
}
