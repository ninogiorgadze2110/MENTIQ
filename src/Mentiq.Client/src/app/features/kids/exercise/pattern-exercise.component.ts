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

    @if (exercise.visual.kind === 'colors') {
      <!-- "Which star is <colour>?" — four coloured stars, tap the named one. -->
      <div class="color-grid">
        @for (o of exercise.options; track o.value) {
          <button type="button" class="color-cell" [disabled]="disabled" (click)="answered.emit(o.value)">
            <svg viewBox="0 0 100 100" width="72" height="72" aria-hidden="true">
              <path d="M50 4 L61 39 L96 50 L61 61 L50 96 L39 61 L4 50 L39 39 Z" [attr.fill]="o.label" />
            </svg>
          </button>
        }
      </div>
    } @else {
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
    }
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
