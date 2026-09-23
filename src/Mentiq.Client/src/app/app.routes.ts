import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { adminGuard } from './core/guards/admin.guard';
import { kidsGuard } from './core/guards/kids.guard';

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

  // ---- MENTIQ Kids (0 კლასი) — separate full-screen experience ----
  {
    path: 'kids',
    canActivate: [authGuard, subscriptionGuard, kidsGuard],
    loadComponent: () =>
      import('./features/kids/kids-layout.component').then((m) => m.KidsLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/kids/kids-home.component').then((m) => m.KidsHomeComponent)
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/kids/kids-journey.component').then((m) => m.KidsJourneyComponent)
      },
      {
        path: 'choose',
        loadComponent: () =>
          import('./features/kids/kids-companion-picker.component').then((m) => m.KidsCompanionPickerComponent)
      },
      {
        path: 'world/:id',
        loadComponent: () =>
          import('./features/kids/kids-world.component').then((m) => m.KidsWorldComponent)
      },
      {
        // The speed world is a calm, personal 60-second challenge (design 08),
        // not the generic mission runner. Static path wins over ':id' below.
        path: 'world/speed/play',
        loadComponent: () =>
          import('./features/kids/kids-speed-challenge.component').then((m) => m.KidsSpeedChallengeComponent)
      },
      {
        path: 'world/:id/play',
        loadComponent: () =>
          import('./features/kids/kids-session.component').then((m) => m.KidsSessionComponent)
      },
      {
        path: 'achievements',
        loadComponent: () =>
          import('./features/kids/kids-achievements.component').then((m) => m.KidsAchievementsComponent)
      },
      {
        path: 'friend',
        loadComponent: () =>
          import('./features/kids/kids-friend.component').then((m) => m.KidsFriendComponent)
      },
      {
        path: 'my-world',
        loadComponent: () =>
          import('./features/kids/kids-my-world.component').then((m) => m.KidsMyWorldComponent)
      },
      {
        path: 'parent',
        loadComponent: () =>
          import('./features/kids/kids-parent.component').then((m) => m.KidsParentComponent)
      },
      {
        path: 'sky',
        loadComponent: () =>
          import('./features/kids/kids-starsky.component').then((m) => m.KidsStarskyComponent)
      }
    ]
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
