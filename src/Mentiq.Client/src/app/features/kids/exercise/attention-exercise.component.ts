import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * ATTENTION: count how many of a target object hide among mixed distractors.
 * The target is shown in the instruction and used for the option dots.
 */
@Component({
  selector: 'app-attention-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-mixed">
      @for (it of exercise.visual.items ?? []; track $index) {
        <span class="ex-obj sm">{{ it }}</span>
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
export class AttentionExerciseComponent implements OnChanges {
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

  dots(value: string): number[] {
    const n = Math.min(12, Math.max(0, parseInt(value, 10) || 0));
    return Array.from({ length: n }, (_, i) => i);
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }
}
