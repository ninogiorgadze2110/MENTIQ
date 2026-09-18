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

    <div class="ex-objects">
      @for (i of objects(); track i) {
        <span class="ex-obj">{{ exercise.visual.emoji }}</span>
      }
    </div>

    <div class="ex-options">
      @for (o of exercise.options; track o.value) {
        <button type="button" class="kids-opt with-dots" [disabled]="disabled" (click)="answered.emit(o.value)">
          <span class="opt-num">{{ o.label }}</span>
          <span class="opt-dots">
            @for (d of dots(o.value); track d) { <span class="opt-obj">{{ exercise.visual.emoji }}</span> }
          </span>
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

  /** One dot per unit of the option's number, so pre-readers can count too. */
  dots(value: string): number[] {
    const n = Math.min(12, Math.max(0, parseInt(value, 10) || 0));
    return Array.from({ length: n }, (_, i) => i);
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }
}
