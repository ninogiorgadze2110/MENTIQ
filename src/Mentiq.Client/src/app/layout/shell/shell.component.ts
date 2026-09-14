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
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly notifications = inject(NotificationService);

  readonly user = this.auth.user;

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '◈' },
    { path: '/practice', label: 'Practice', icon: '◎' },
    { path: '/learn', label: 'Learn', icon: '◍' },
    { path: '/progress', label: 'Progress', icon: '◔' },
    { path: '/achievements', label: 'Achievements', icon: '★' },
    { path: '/profile', label: 'Profile', icon: '◑' }
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
