import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <aside class="side">
        <div class="brand">MENTIQ <small>ka</small></div>
        <nav class="side-nav">
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">
              <span class="n-ic" aria-hidden="true">{{ item.icon }}</span> {{ item.label }}
            </a>
          }
          @if (isAdmin()) {
            <a routerLink="/admin/subscriptions" routerLinkActive="active">
              <span class="n-ic" aria-hidden="true">⚙</span> ადმინი
            </a>
          }
        </nav>
        <div class="side-foot">
          <div class="u">
            <div class="av">{{ initial() }}</div>
            <div>
              <div style="color:var(--ink); font-size:13px;">{{ displayName() }}</div>
              <div style="font-size:11px;">უფასო გეგმა</div>
            </div>
          </div>
          <a routerLink="/pricing" style="color:var(--gold); font-size:12px;">↗ განახლდი Pro-ზე</a>
          <div style="margin-top:10px;">
            <a href="javascript:void(0)" (click)="logout()" style="color:color-mix(in srgb, var(--ink) 55%, transparent); font-size:12px;">→ გამოსვლა</a>
          </div>
        </div>
      </aside>

      <div class="main">
        <router-outlet />
      </div>
    </div>

    <div class="toasts">
      @for (n of notifications.notifications(); track n.id) {
        <div class="toast" [class]="'toast-' + n.kind">
          <span>{{ n.message }}</span>
          <button type="button" class="toast-close" (click)="notifications.dismiss(n.id)">×</button>
        </div>
      }
    </div>
  `
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly notifications = inject(NotificationService);

  readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'მთავარი', icon: '◈' },
    { path: '/practice', label: 'ვარჯიში', icon: '◐' },
    { path: '/learn', label: 'ისწავლე', icon: '☰' },
    { path: '/competition', label: 'შეჯიბრი', icon: '⚑' },
    { path: '/achievements', label: 'მიღწევები', icon: '★' },
    { path: '/pricing', label: 'ფასი', icon: '₾' }
  ];

  readonly isAdmin = this.auth.isAdmin;

  displayName(): string {
    return this.auth.user()?.displayName ?? 'სტუმარი';
  }

  initial(): string {
    return (this.displayName().charAt(0) || 'გ').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
