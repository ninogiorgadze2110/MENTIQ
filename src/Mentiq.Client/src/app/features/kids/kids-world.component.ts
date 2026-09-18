import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';
import { KIDS_WORLDS } from './kids-worlds.data';

/**
 * A single world screen. For STEP 3 this is the world's entry: hero, spoken
 * intro and a big start button. The start action will launch the exercise
 * session once the exercise engine lands (STEP 4).
 */
@Component({
  selector: 'app-kids-world',
  standalone: true,
  template: `
    @if (world(); as w) {
      <button type="button" class="kids-round" (click)="back()" aria-label="უკან">←</button>

      <div class="kids-panel" style="margin-top:16px;">
        <div class="k-emoji" style="width:120px; height:120px; border-radius:32px; font-size:64px; margin:0 auto 14px;"
             [style.background]="tint(w.color)">{{ w.emoji }}</div>
        <div class="kids-h1" style="margin-top:0;">{{ w.name }}</div>
        <p class="kids-sub">{{ w.tagline }}</p>

        <button type="button" class="kids-btn big" [style.background]="w.color" (click)="start()">
          დაწყება ▶
        </button>

        <div style="margin-top:18px; color:var(--k-muted); font-size:13px;">
          🚧 სავარჯიშოები მალე დაემატება
        </div>
      </div>
    } @else {
      <div class="kids-panel" style="margin-top:16px;">
        <p class="kids-sub" style="margin:0;">სამყარო ვერ მოიძებნა.</p>
        <button type="button" class="kids-btn secondary" style="margin-top:16px;" (click)="back()">← უკან</button>
      </div>
    }
  `
})
export class KidsWorldComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);

  private readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly world = computed(() => KIDS_WORLDS.find((w) => w.id === this.id()) ?? null);

  ngOnInit(): void {
    const w = this.world();
    if (w) this.audio.play(`world.${w.id}.intro`, w.audioIntro);
  }

  tint(color: string): string {
    return `color-mix(in srgb, ${color} 16%, #fff)`;
  }

  start(): void {
    const w = this.world();
    if (w) this.router.navigate(['/kids/world', w.id, 'play']);
  }

  back(): void {
    this.audio.stop();
    this.router.navigate(['/kids']);
  }
}
