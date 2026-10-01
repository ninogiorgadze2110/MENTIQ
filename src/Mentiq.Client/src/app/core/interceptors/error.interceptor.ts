import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../models/auth.model';

/**
 * Centralized, Georgian, user-friendly handling of API errors. Backend messages
 * are English, so for known cases we show a clear Georgian message instead.
 *
 * A failed login/registration (401/409 on the auth endpoints) is NOT a session
 * problem — show a precise message and let the user retry, without logging out
 * or redirecting. A 401 anywhere else means the session expired.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  const isAuthEndpoint = /\/auth\/(login|register)/.test(req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiError | undefined;
      const serverMessage = apiError?.message;

      switch (error.status) {
        case 0:
          notifications.error('სერვერთან კავშირი ვერ ხერხდება. შეამოწმე ინტერნეტ-კავშირი.');
          break;

        case 400:
          notifications.error('მოთხოვნა არასწორია. შეამოწმე მონაცემები და სცადე თავიდან.');
          break;

        case 401:
          if (isAuthEndpoint) {
            // Wrong email/password on a login attempt — stay on the page.
            notifications.error('ელ-ფოსტა ან პაროლი არასწორია.');
          } else {
            auth.logout();
            router.navigate(['/login']);
            notifications.error('სესიის დრო ამოიწურა. გთხოვ, თავიდან შედი.');
          }
          break;

        case 403:
          notifications.error('ამ მოქმედების უფლება არ გაქვს.');
          break;

        case 404:
          notifications.error('მოთხოვნილი ვერ მოიძებნა.');
          break;

        case 409:
          notifications.error(isAuthEndpoint ? 'ამ ელ-ფოსტით ანგარიში უკვე არსებობს.' : 'მონაცემები უკვე არსებობს.');
          break;

        case 422:
          notifications.error('შეავსე ველები სწორად და სცადე თავიდან.');
          break;

        default:
          if (error.status >= 500) {
            notifications.error('რაღაც ვერ მოხერხდა. სცადე მოგვიანებით.');
          } else if (serverMessage) {
            notifications.error(serverMessage);
          } else {
            notifications.error('მოხდა შეცდომა. სცადე თავიდან.');
          }
          break;
      }

      return throwError(() => error);
    })
  );
};
