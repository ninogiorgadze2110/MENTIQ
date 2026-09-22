import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * COUNTING exercise: show N objects, ask "how many?", pick a number.
 * Purely presentational — the parent session grades via the API. The instruction
 * is spoken on show and can be replayed by tapping it.
 */
@Component({
  selector: 'app-counting-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">
      🔊 {{ exercise.instruction }}
    </button>

    @if (exercise.visual.count > 10) {
      <!-- Larger amounts are grouped in rows of ten, so they stay countable. -->
      <div class="ex-objects grouped">
        @for (row of rows(); track $index) {
          <div class="ex-orow">
            @for (i of row; track i) { <span class="ex-obj tiny">{{ exercise.visual.emoji }}</span> }
          </div>
        }
      </div>
    } @else {
      <div class="ex-objects">
        @for (i of objects(); track i) {
          <span class="ex-obj">{{ exercise.visual.emoji }}</span>
        }
      </div>
    }

    <div class="ex-options">
      @for (o of exercise.options; track o.value) {
        <button type="button" class="kids-opt" [class.with-dots]="showDots(o.value)"
                [disabled]="disabled" (click)="answered.emit(o.value)">
          <span class="opt-num">{{ o.label }}</span>
          @if (showDots(o.value)) {
            <span class="opt-dots">
              @for (d of dots(o.value); track d) { <span class="opt-obj">{{ exercise.visual.emoji }}</span> }
            </span>
          }
        </button>
      }
    </div>
  `
})
export class CountingExerciseComponent implements OnChanges {
  private readonly audio = inject(AudioService);

  @Input({ required: true }) exercise!: Exercise;
  @Input() disabled = false;
  @Output() answered = new EventEmitter<string>();

  private lastSpokenId = '';

  ngOnChanges(): void {
    // Speak the instruction once per new exercise.
    if (this.exercise && this.exercise.id !== this.lastSpokenId) {
      this.lastSpokenId = this.exercise.id;
      this.replay();
    }
  }

  objects(): number[] {
    return Array.from({ length: this.exercise.visual.count }, (_, i) => i);
  }

  /** Objects split into rows of ten for larger amounts (10-frame counting). */
  rows(): number[][] {
    const all = this.objects();
    const out: number[][] = [];
    for (let i = 0; i < all.length; i += 10) out.push(all.slice(i, i + 10));
    return out;
  }

  /** One dot per unit of the option's number, so pre-readers can count too. */
  dots(value: string): number[] {
    const n = Math.min(12, Math.max(0, parseInt(value, 10) || 0));
    return Array.from({ length: n }, (_, i) => i);
  }

  /** Object-dots only help for small numbers; big numbers show just the digit. */
  showDots(value: string): boolean {
    return (parseInt(value, 10) || 0) <= 10;
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }
}
