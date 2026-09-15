import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ---- Public marketing / auth ----
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent)
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./features/pricing/pricing.component').then((m) => m.PricingComponent)
  },

  // ---- Authenticated full-screen focus modes (no sidebar) ----
  {
    path: 'practice',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/practice/practice.component').then((m) => m.PracticeComponent)
  },
  {
    path: 'results',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/results/results.component').then((m) => m.ResultsComponent)
  },

  // ---- Authenticated app shell (sidebar) ----
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'levels',
        loadComponent: () =>
          import('./features/levels/levels.component').then((m) => m.LevelsComponent)
      },
      {
        path: 'learn',
        loadComponent: () =>
          import('./features/learn/learn.component').then((m) => m.LearnComponent)
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/progress/progress.component').then((m) => m.ProgressComponent)
      },
      {
        path: 'competition',
        loadComponent: () =>
          import('./features/competition/competition.component').then((m) => m.CompetitionComponent)
      },
      {
        path: 'achievements',
        loadComponent: () =>
          import('./features/achievements/achievements.component').then((m) => m.AchievementsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
