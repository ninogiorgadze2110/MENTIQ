import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject, signal } from '@angular/core';

import { AudioService } from '../../../core/services/audio.service';
import { Exercise } from './exercise.models';

interface Tile {
  emoji: string;
  value: string;
  x: number;
  y: number;
}

/**
 * SPEED / target search: after a short random wait, the star and several decoy
 * objects appear scattered around the field. The child must find and tap the
 * STAR — tapping a decoy is wrong. Response time is measured by the session.
 */
@Component({
  selector: 'app-speed-exercise',
  standalone: true,
  template: `
    <button type="button" class="ex-instruction" (click)="replay()">🔊 {{ exercise.instruction }}</button>

    <div class="ex-speed">
      @if (ready()) {
        @for (t of tiles(); track $index) {
          <button type="button" class="ex-item" [class.star]="t.value === 'go'"
                  [style.left.%]="t.x" [style.top.%]="t.y"
                  [disabled]="disabled" (click)="tap(t)">{{ t.emoji }}</button>
        }
      } @else {
        <div class="ex-wait">მოემზადე…</div>
      }
    </div>
  `
})
export class SpeedExerciseComponent implements OnChanges, OnDestroy {
  private readonly audio = inject(AudioService);

  @Input({ required: true }) exercise!: Exercise;
  @Input() disabled = false;
  @Output() answered = new EventEmitter<string>();

  readonly ready = signal(false);
  readonly tiles = signal<Tile[]>([]);
  private timer?: ReturnType<typeof setTimeout>;
  private lastId = '';

  ngOnChanges(): void {
    if (this.exercise && this.exercise.id !== this.lastId) {
      this.lastId = this.exercise.id;
      this.replay();
      this.arm();
    }
  }

  private arm(): void {
    this.ready.set(false);
    this.tiles.set([]);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.tiles.set(this.buildTiles());
      this.ready.set(true);
    }, 700 + Math.random() * 1200);
  }

  /** Star + decoys at spaced random positions. */
  private buildTiles(): Tile[] {
    const decoys = this.exercise.visual.items ?? [];
    const items: { emoji: string; value: string }[] = [
      { emoji: this.exercise.visual.emoji ?? '⭐', value: 'go' },
      ...decoys.map((e) => ({ emoji: e, value: e }))
    ].sort(() => Math.random() - 0.5);

    const placed: Tile[] = [];
    for (const it of items) {
      let x = 50;
      let y = 45;
      for (let attempt = 0; attempt < 24; attempt++) {
        x = 10 + Math.random() * 80;
        y = 12 + Math.random() * 74;
        if (placed.every((p) => Math.hypot(p.x - x, p.y - y) > 20)) break;
      }
      placed.push({ ...it, x, y });
    }
    return placed;
  }

  tap(t: Tile): void {
    if (!this.ready() || this.disabled) return;
    this.answered.emit(t.value); // "go" for the star, the emoji for a decoy (wrong)
  }

  replay(): void {
    this.audio.play(this.exercise.instructionAudioKey, this.exercise.instruction);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
