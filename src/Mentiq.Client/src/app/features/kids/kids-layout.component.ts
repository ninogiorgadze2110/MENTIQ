import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { AudioService } from '../../core/services/audio.service';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { KidsExerciseService } from './exercise/kids-exercise.service';
import { KidsProfileService } from './kids-profile.service';

/**
 * Chrome for the whole MENTIQ Kids area: the playful scoped theme, a top bar
 * (brand, sound toggle, live star count, menu) and the routed child screen.
 * The star total is the sum of stars earned across every skill.
 */
@Component({
  selector: 'app-kids-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="kids-scope" [class.has-nav]="showNav()">
      <div class="kids-wrap">
        <div class="kids-top">
          <div class="kids-brand">MENTIQ <small>Kids</small></div>
          <button type="button" class="kids-round" style="margin-left:auto;"
                  [attr.aria-label]="audio.muted() ? 'ხმის ჩართვა' : 'ხმის გამორთვა'"
                  (click)="audio.toggleMute()">
            {{ audio.muted() ? '🔇' : '🔊' }}
          </button>
          <div class="kids-stars">⭐ {{ stars() }}</div>
          @if (canSwitchView()) {
            <button type="button" class="kids-round" aria-label="1 კლასის ვერსია" title="1 კლასის ვერსია" (click)="go('/dashboard')">🎓</button>
          }
          <button type="button" class="kids-round" aria-label="მენიუ" (click)="menu.set(!menu())">☰</button>
        </div>

        @if (showNav() && betaMode()) {
          <div class="ktrial" style="cursor:default;">
            <span class="ktrial-ic">🎉</span>
            <div class="ktrial-tx">
              <div class="ktrial-t">ბეტა — უფასო წვდომა</div>
              <div class="ktrial-s">MENTIQ Kids ამჟამად უფასოა ტესტირების პერიოდში — ითამაშე ყველაფერი!</div>
            </div>
          </div>
        } @else if (showNav() && trial()) {
          <a class="ktrial" routerLink="/pricing">
            <span class="ktrial-ic">🌈</span>
            <div class="ktrial-tx">
              <div class="ktrial-t">უფასო მოგზაურობა — დარჩა {{ trialDays() }} დღე</div>
              <div class="ktrial-s">გააგრძელე, რომ {{ companionName() }}-მა და შენ ცისარტყელა დაასრულოთ →</div>
            </div>
          </a>
        }

        @if (menu()) {
          <div class="kids-menu" (click)="menu.set(false)">
            <div class="kids-menu-card" (click)="$event.stopPropagation()">
              <button type="button" class="kids-menu-item" (click)="go('/kids/map')">🗺️ რუკა</button>
              <button type="button" class="kids-menu-item" (click)="go('/kids/my-world')">🏰 ჩემი სამყარო</button>
              <button type="button" class="kids-menu-item" (click)="go('/kids/achievements')">🌈 ჯილდოები</button>
              <!-- <button type="button" class="kids-menu-item" (click)="go('/kids/sky')">🌌 ვარსკვლავებით სავსე ცა</button> -->
              <button type="button" class="kids-menu-item" (click)="go('/kids/friend')">🐰 მეგობარი</button>
              <button type="button" class="kids-menu-item" (click)="go('/kids/parent')">👪 მშობლის ხედი</button>
              @if (canSwitchView()) {
                <button type="button" class="kids-menu-item" (click)="go('/dashboard')">🎓 1 კლასის ვერსია</button>
              }
              <button type="button" class="kids-menu-item danger" (click)="logout()">🚪 გასვლა</button>
            </div>
          </div>
        }

        <router-outlet />
      </div>

      @if (showNav()) {
        <nav class="knav">
          <a routerLink="/kids" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }" class="knav-item"><span class="knav-ic">◐</span>მთავარი</a>
          <a routerLink="/kids/map" routerLinkActive="on" class="knav-item"><span class="knav-ic">◇</span>რუკა</a>
          <a routerLink="/kids/achievements" routerLinkActive="on" class="knav-item"><span class="knav-ic">★</span>ჯილდოები</a>
          <a routerLink="/kids/friend" routerLinkActive="on" class="knav-item"><span class="knav-ic">☺</span>მეგობარი</a>
        </nav>
      }
    </div>
  `
})
export class KidsLayoutComponent implements OnDestroy {
  readonly audio = inject(AudioService);
  private readonly api = inject(KidsExerciseService);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(KidsProfileService);
  private readonly subs = inject(SubscriptionService);
  private readonly router = inject(Router);

  readonly stars = signal(0);
  readonly menu = signal(false);
  /** The bottom nav is hidden inside a mission (its own chrome). */
  readonly showNav = signal(true);

  /** Warm, journey-framed trial reminder (only while on the free trial). */
  readonly betaMode = computed(() => this.subs.status()?.betaFreeAccess === true || this.subs.status()?.status === 'Beta');
  readonly trial = computed(() => this.subs.isTrial());
  readonly trialDays = computed(() => Math.max(0, this.subs.daysRemaining()));
  /** First-graders can hop to the school version. */
  readonly canSwitchView = this.auth.canSwitchView;
  companionName(): string {
    return this.profile.companionName();
  }

  private readonly sub: Subscription;

  constructor() {
    if (!this.subs.status()) this.subs.loadStatus().subscribe({ error: () => {} });
    this.refreshStars();
    this.updateNav(this.router.url);
    // Refresh stars on each Kids screen, and send first-run children to pick a
    // companion before anything else.
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.refreshStars();
        this.updateNav(e.urlAfterRedirects);
        if (!this.profile.hasCompanion() && !e.urlAfterRedirects.startsWith('/kids/choose')) {
          this.router.navigateByUrl('/kids/choose');
        }
      });
  }

  private updateNav(url: string): void {
    this.showNav.set(!url.includes('/play'));
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
