import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { adminGuard } from './core/guards/admin.guard';

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
  // Premium: require an active trial or paid subscription (backend-enforced).
  {
    path: 'practice',
    canActivate: [authGuard, subscriptionGuard],
    loadComponent: () =>
      import('./features/practice/practice.component').then((m) => m.PracticeComponent)
  },
  {
    path: 'results',
    canActivate: [authGuard, subscriptionGuard],
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
        path: 'learn',
        canActivate: [subscriptionGuard],
        loadComponent: () =>
          import('./features/learn/learn.component').then((m) => m.LearnComponent)
      },
      {
        path: 'progress',
        canActivate: [subscriptionGuard],
        loadComponent: () =>
          import('./features/progress/progress.component').then((m) => m.ProgressComponent)
      },
      {
        path: 'competition',
        canActivate: [subscriptionGuard],
        loadComponent: () =>
          import('./features/competition/competition.component').then((m) => m.CompetitionComponent)
      },
      {
        path: 'achievements',
        canActivate: [subscriptionGuard],
        loadComponent: () =>
          import('./features/achievements/achievements.component').then((m) => m.AchievementsComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then((m) => m.ContactComponent)
      },
      {
        path: 'admin/subscriptions',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-subscriptions.component').then((m) => m.AdminSubscriptionsComponent)
      },
      {
        path: 'admin/contact',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-contact.component').then((m) => m.AdminContactComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
