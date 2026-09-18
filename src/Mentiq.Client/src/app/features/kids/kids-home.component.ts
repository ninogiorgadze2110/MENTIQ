import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AudioService } from '../../core/services/audio.service';
import { KIDS_WORLDS, KidsWorld } from './kids-worlds.data';

/**
 * Kids home: a big, friendly grid of "worlds". Minimal text; a spoken greeting
 * plays on entry. Tapping a world opens it. (Exercises arrive in STEP 4.)
 */
@Component({
  selector: 'app-kids-home',
  standalone: true,
  template: `
    <div class="kids-h1">გამარჯობა, {{ firstName() }}! 👋</div>
    <p class="kids-sub">აირჩიე სამყარო და დავიწყოთ თამაში.</p>

    <div class="kids-grid">
      @for (w of worlds; track w.id) {
        <button type="button" class="kids-card" (click)="open(w)">
          <span class="k-emoji" [style.background]="tint(w.color)">{{ w.emoji }}</span>
          <span class="k-name">{{ w.name }}</span>
          <span class="k-tag">{{ w.tagline }}</span>
        </button>
      }
    </div>
  `
})
export class KidsHomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly audio = inject(AudioService);
  private readonly router = inject(Router);

  readonly worlds = KIDS_WORLDS;

  ngOnInit(): void {
    this.audio.speak(`გამარჯობა, ${this.firstName()}! აირჩიე სამყარო.`);
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'მეგობარო').split(' ')[0];
  }

  tint(color: string): string {
    return `color-mix(in srgb, ${color} 16%, #fff)`;
  }

  open(world: KidsWorld): void {
    this.audio.play(`world.${world.id}.intro`, world.audioIntro);
    this.router.navigate(['/kids/world', world.id]);
  }
}
