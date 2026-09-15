import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Restricts admin routes to Administrator accounts. This only hides UI — the
 * admin API independently requires the Administrator role and returns 403 to
 * anyone else, so route visibility is never a security boundary on its own.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
