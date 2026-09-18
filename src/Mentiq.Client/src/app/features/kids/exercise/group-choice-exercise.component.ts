import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise, ExerciseOption } from './exercise.models';

/**
 * "Tap the right group" exercises (e.g. More/Less). Each option is drawn as a
 * group of objects; the child taps one. Reused by any type whose options are
 * groups rather than single tokens.
 */
@Component({
  selector: 'app-group-choice-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-groups">
      @for (o of exercise.options; track o.value) {
        <button type="button" class="ex-group" [disabled]="disabled" (click)="answered.emit(o.value)">
          <span class="ex-group-objs">
            @for (i of groupItems(o); track i) {
              <span class="ex-obj sm">{{ o.emoji }}</span>
            }
          </span>
        </button>
      }
    </div>
  `
})
export class GroupChoiceExerciseComponent implements OnChanges {
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

  groupItems(o: ExerciseOption): number[] {
    return Array.from({ length: o.count ?? 0 }, (_, i) => i);
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }
}
