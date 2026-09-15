import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

/**
 * Gates premium routes behind an active trial or paid subscription. Access is
 * re-checked against the backend on every activation (the backend is the source
 * of truth); if it has lapsed the user is sent to /pricing with a returnUrl so
 * they can come back after activation. This guard is a UX convenience — the API
 * independently rejects premium calls, so it can never be bypassed by tampering.
 */
export const subscriptionGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const subscriptions = inject(SubscriptionService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const denied = router.createUrlTree(['/pricing'], { queryParams: { returnUrl: state.url } });

  return subscriptions.loadStatus().pipe(
    map((status) => (status.hasAccess ? true : denied)),
    // If the status check fails (e.g. network), fall back to denying access
    // rather than silently letting the user through; the API would reject anyway.
    catchError(() => of(denied))
  );
};
