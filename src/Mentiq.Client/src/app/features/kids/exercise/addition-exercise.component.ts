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

    <!-- A clear equation with fruit groups and one blank box to fill. -->
    <div class="ex-eq">
      @switch (exercise.visual.kind) {
        @case ('makeN') {
          <span class="eq-grp">
            @for (i of range(exercise.visual.count); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
          <span class="eq-op">+</span>
          <span class="eq-blank">?</span>
          <span class="eq-op">=</span>
          <span class="eq-grp">
            @for (i of range(exercise.visual.target ?? 0); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
        }
        @case ('subtraction') {
          <span class="eq-grp">
            @for (i of range(addA()); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
          <span class="eq-op">−</span>
          <span class="eq-grp">
            @for (i of range(addB()); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
          <span class="eq-op">=</span>
          <span class="eq-blank">?</span>
        }
        @default {
          <span class="eq-grp">
            @for (i of range(addA()); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
          <span class="eq-op">+</span>
          <span class="eq-grp">
            @for (i of range(addB()); track i) { <span class="eq-obj">{{ exercise.visual.emoji }}</span> }
          </span>
          <span class="eq-op">=</span>
          <span class="eq-blank">?</span>
        }
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

  /** First / second operand for the addition & subtraction equations. */
  addA(): number {
    return this.exercise.visual.addends?.[0] ?? 0;
  }
  addB(): number {
    return this.exercise.visual.addends?.[1] ?? 0;
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
