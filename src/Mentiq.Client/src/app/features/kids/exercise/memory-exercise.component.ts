import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject, signal } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * MEMORY CARDS: show an ordered set of cards, hide them after a moment, then the
 * child rebuilds the same order by tapping the shuffled cards into the slots.
 * (Tap-to-place rather than HTML5 drag — far more reliable on tablets/touch.)
 */
@Component({
  selector: 'app-memory-exercise',
  standalone: true,
  template: `
    @if (phase() === 'show') {
      <div class="ex-instruction static">👀 დაიმახსოვრე</div>
      <div class="ex-mem-show">
        @for (it of exercise.visual.items ?? []; track $index) {
          <span class="ex-mem-card">{{ it }}</span>
        }
      </div>
    } @else {
      <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

      <div class="ex-mem-slots">
        @for (s of slots(); track $index) {
          <span class="ex-mem-slot" [class.filled]="!!s">{{ s || '' }}</span>
        }
      </div>

      <div class="ex-mem-bank">
        @for (o of exercise.options; track $index; let i = $index) {
          <button type="button" class="ex-mem-card tappable" [disabled]="disabled || used().has(i)"
                  [class.used]="used().has(i)" (click)="place(i)">{{ o.label }}</button>
        }
      </div>

      @if (placed() > 0 && placed() < total()) {
        <button type="button" class="kids-btn secondary" style="margin-top:14px; padding:10px 22px; font-size:16px;" (click)="reset()">↺ თავიდან</button>
      }
    }
  `
})
export class MemoryExerciseComponent implements OnChanges, OnDestroy {
  private readonly audio = inject(AudioService);

  @Input({ required: true }) exercise!: Exercise;
  @Input() disabled = false;
  @Output() answered = new EventEmitter<string>();

  readonly phase = signal<'show' | 'recall'>('show');
  readonly slots = signal<string[]>([]);
  readonly used = signal<Set<number>>(new Set());

  private timer?: ReturnType<typeof setTimeout>;
  private lastId = '';

  ngOnChanges(): void {
    if (this.exercise && this.exercise.id !== this.lastId) {
      this.lastId = this.exercise.id;
      this.begin();
    }
  }

  total(): number {
    return this.exercise.visual.items?.length ?? 0;
  }

  placed(): number {
    return this.slots().filter(Boolean).length;
  }

  private begin(): void {
    this.phase.set('show');
    this.slots.set(Array.from({ length: this.total() }, () => ''));
    this.used.set(new Set());
    this.audio.cue('encouragement');
    if (this.timer) clearTimeout(this.timer);
    // Show ~0.9s per card so 3–4 cards get a fair look.
    this.timer = setTimeout(() => this.phase.set('recall'), 900 + this.total() * 650);
  }

  place(i: number): void {
    if (this.disabled || this.used().has(i)) return;
    const idx = this.slots().findIndex((s) => !s);
    if (idx < 0) return;

    this.audio.blip();
    const next = [...this.slots()];
    next[idx] = this.exercise.options[i].value;
    this.slots.set(next);
    this.used.set(new Set(this.used()).add(i));

    if (next.every(Boolean)) {
      this.answered.emit(next.join(','));
    }
  }

  reset(): void {
    this.slots.set(Array.from({ length: this.total() }, () => ''));
    this.used.set(new Set());
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
