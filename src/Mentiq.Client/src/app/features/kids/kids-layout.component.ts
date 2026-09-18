import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';

/**
 * Chrome for the whole MENTIQ Kids area: the playful scoped theme, a minimal
 * top bar (brand, sound toggle, star count) and the routed child screen.
 * Deliberately free of the adult sidebar/nav — this is a separate experience.
 */
@Component({
  selector: 'app-kids-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="kids-scope">
      <div class="kids-wrap">
        <div class="kids-top">
          <div class="kids-brand">MENTIQ <small>Kids</small></div>
          <button type="button" class="kids-round" style="margin-left:auto;"
                  [attr.aria-label]="audio.muted() ? 'ხმის ჩართვა' : 'ხმის გამორთვა'"
                  (click)="audio.toggleMute()">
            {{ audio.muted() ? '🔇' : '🔊' }}
          </button>
          <div class="kids-stars">⭐ {{ stars }}</div>
        </div>

        <router-outlet />
      </div>
    </div>
  `
})
export class KidsLayoutComponent {
  readonly audio = inject(AudioService);

  // Placeholder until the reward/progression system (STEP 6) supplies real stars.
  readonly stars = 0;
}
