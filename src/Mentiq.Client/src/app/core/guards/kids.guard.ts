import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * MENTIQ Kids is for preschoolers (grade 0) and first-graders (grade 1, ~6y).
 * Older school pupils and adults are sent to the standard app instead.
 */
export const kidsGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.canUseKids() ? true : router.createUrlTree(['/dashboard']);
};
