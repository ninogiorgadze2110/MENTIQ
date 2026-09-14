import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../models/auth.model';

/**
 * Centralized handling for API error responses (401, 403, 404, 422, 500).
 * Internal details are never surfaced; the backend's ApiError message is used.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiError | undefined;
      const message = apiError?.message;

      switch (error.status) {
        case 0:
          notifications.error('Cannot reach the server. Please check your connection.');
          break;
        case 401:
          auth.logout();
          router.navigate(['/login']);
          notifications.error(message ?? 'Your session has expired. Please sign in again.');
          break;
        case 403:
          notifications.error(message ?? 'You do not have permission to do that.');
          break;
        case 404:
          notifications.error(message ?? 'The requested resource was not found.');
          break;
        case 422:
          notifications.error(message ?? 'Please correct the highlighted fields.');
          break;
        default:
          if (error.status >= 500) {
            notifications.error(message ?? 'Something went wrong. Please try again later.');
          } else if (message) {
            notifications.error(message);
          }
          break;
      }

      return throwError(() => error);
    })
  );
};
