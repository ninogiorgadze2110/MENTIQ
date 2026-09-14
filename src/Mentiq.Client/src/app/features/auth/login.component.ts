import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly mode = signal<'login' | 'register'>('login');
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  toggleMode(): void {
    const next = this.mode() === 'login' ? 'register' : 'login';
    this.mode.set(next);

    const displayName = this.form.controls.displayName;
    if (next === 'register') {
      displayName.setValidators([Validators.required]);
    } else {
      displayName.clearValidators();
    }
    displayName.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password, displayName } = this.form.getRawValue();

    const request$ =
      this.mode() === 'login'
        ? this.auth.login({ email, password })
        : this.auth.register({ email, displayName, password });

    request$.subscribe({
      next: () => {
        this.notifications.success('Welcome to Mentiq!');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
