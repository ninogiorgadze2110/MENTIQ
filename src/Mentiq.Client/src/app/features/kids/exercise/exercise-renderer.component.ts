import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CountingExerciseComponent } from './counting-exercise.component';
import { GroupChoiceExerciseComponent } from './group-choice-exercise.component';
import { PatternExerciseComponent } from './pattern-exercise.component';
import { AdditionExerciseComponent } from './addition-exercise.component';
import { ClassificationExerciseComponent } from './classification-exercise.component';
import { AttentionExerciseComponent } from './attention-exercise.component';
import { MemoryExerciseComponent } from './memory-exercise.component';
import { SpeedExerciseComponent } from './speed-exercise.component';
import { Exercise } from './exercise.models';

/**
 * Renders the right exercise component for an exercise's `type`. New exercise
 * types (STEP 5) are added as extra @switch cases here — the session runner and
 * API stay unchanged.
 */
@Component({
  selector: 'app-exercise-renderer',
  standalone: true,
  imports: [
    CountingExerciseComponent,
    GroupChoiceExerciseComponent,
    PatternExerciseComponent,
    AdditionExerciseComponent,
    ClassificationExerciseComponent,
    AttentionExerciseComponent,
    MemoryExerciseComponent,
    SpeedExerciseComponent
  ],
  template: `
    @switch (exercise.type) {
      @case ('counting') {
        <app-counting-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('comparison') {
        <app-group-choice-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('patterns') {
        <app-pattern-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('addition') {
        <app-addition-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('classification') {
        <app-classification-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('attention') {
        <app-attention-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('memory') {
        <app-memory-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @case ('speed') {
        <app-speed-exercise [exercise]="exercise" [disabled]="disabled" (answered)="answered.emit($event)" />
      }
      @default {
        <div class="kids-sub">ეს სავარჯიშო მალე დაემატება.</div>
      }
    }
  `
})
export class ExerciseRendererComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Input() disabled = false;
  @Output() answered = new EventEmitter<string>();
}
