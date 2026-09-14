import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'practice',
        loadComponent: () =>
          import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
        data: {
          title: 'Practice',
          description: 'Sharpen your skills with targeted practice sessions.',
          icon: '◎'
        }
      },
      {
        path: 'learn',
        loadComponent: () =>
          import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
        data: {
          title: 'Learn',
          description: 'Work through structured lessons and levels.',
          icon: '◍'
        }
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
        data: {
          title: 'Progress',
          description: 'Track how far you have come over time.',
          icon: '◔'
        }
      },
      {
        path: 'achievements',
        loadComponent: () =>
          import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
        data: {
          title: 'Achievements',
          description: 'Celebrate the milestones you have unlocked.',
          icon: '★'
        }
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
