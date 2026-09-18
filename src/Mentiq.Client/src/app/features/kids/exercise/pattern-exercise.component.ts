import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * PATTERNS: show a sequence ending in "?", the child taps what comes next.
 */
@Component({
  selector: 'app-pattern-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-sequence">
      @for (it of exercise.visual.items ?? []; track $index) {
        <span class="ex-seq">{{ it }}</span>
      }
      <span class="ex-seq q">❓</span>
    </div>

    <div class="ex-options">
      @for (o of exercise.options; track o.value) {
        <button type="button" class="kids-opt emoji" [disabled]="disabled" (click)="answered.emit(o.value)">
          {{ o.label }}
        </button>
      }
    </div>
  `
})
export class PatternExerciseComponent implements OnChanges {
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

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }
}
