import { Component, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { AudioService } from '../../core/services/audio.service';
import { AuthService } from '../../core/services/auth.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';

/**
 * Chrome for the whole MENTIQ Kids area: the playful scoped theme, a top bar
 * (brand, sound toggle, live star count, menu) and the routed child screen.
 * The star total is the sum of stars earned across every skill.
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
          <div class="kids-stars">⭐ {{ stars() }}</div>
          <button type="button" class="kids-round" aria-label="მენიუ" (click)="menu.set(!menu())">☰</button>
        </div>

        @if (menu()) {
          <div class="kids-menu" (click)="menu.set(false)">
            <div class="kids-menu-card" (click)="$event.stopPropagation()">
              <button type="button" class="kids-menu-item" (click)="go('/kids')">🏠 მთავარი</button>
              <button type="button" class="kids-menu-item" (click)="go('/kids/achievements')">🏆 ჯილდოები</button>
              <button type="button" class="kids-menu-item danger" (click)="logout()">🚪 გასვლა</button>
            </div>
          </div>
        }

        <router-outlet />
      </div>
    </div>
  `
})
export class KidsLayoutComponent implements OnDestroy {
  readonly audio = inject(AudioService);
  private readonly api = inject(KidsExerciseService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly stars = signal(0);
  readonly menu = signal(false);

  private readonly sub: Subscription;

  constructor() {
    this.refreshStars();
    // Refresh the total whenever we land back on a Kids screen (e.g. after a session).
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.refreshStars());
  }

  private refreshStars(): void {
    this.api.progress().subscribe({
      next: (rows) => this.stars.set(rows.reduce((sum, r) => sum + (r.score ?? 0), 0)),
      error: () => {}
    });
  }

  go(url: string): void {
    this.menu.set(false);
    this.router.navigateByUrl(url);
  }

  logout(): void {
    this.menu.set(false);
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
