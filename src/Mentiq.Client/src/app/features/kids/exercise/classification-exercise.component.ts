import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

/**
 * CLASSIFICATION: a row of objects, one different — tap the odd one out.
 * Each option is itself a tappable object (value = its position).
 */
@Component({
  selector: 'app-classification-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-tiles">
      @for (o of exercise.options; track o.value) {
        <button type="button" class="ex-tile" [disabled]="disabled" (click)="answered.emit(o.value)">{{ o.label }}</button>
      }
    </div>
  `
})
export class ClassificationExerciseComponent implements OnChanges {
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
