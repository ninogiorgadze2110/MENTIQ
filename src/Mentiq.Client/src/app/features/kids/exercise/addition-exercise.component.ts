import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * Simple visual ADDITION: object groups joined by "+", asking for the total.
 * Numbers stay concrete (objects) rather than abstract equations.
 */
@Component({
  selector: 'app-addition-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-addition">
      @for (a of exercise.visual.addends ?? []; track $index; let last = $last) {
        <span class="ex-addend">
          @for (i of range(a); track i) { <span class="ex-obj sm">{{ exercise.visual.emoji }}</span> }
        </span>
        @if (!last) { <span class="ex-plus">+</span> }
      }
      <span class="ex-plus">=</span>
      <span class="ex-qmark">❓</span>
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
export class AdditionExerciseComponent implements OnChanges {
  private readonly audio = inject(AudioService);

  @Input({ required: true }) exercise!: Exercise;
  @Input() disabled = false;
  @Output() answered = new EventEmitter<string>();

  private lastSpokenId = '';

  ngOnChanges(): void {
    if (this.exercise && this.exercise.id !== this.lastSpokenId) {
      this.lastSpokenId = this.exercise.id;
      this.replay();
    }
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
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
