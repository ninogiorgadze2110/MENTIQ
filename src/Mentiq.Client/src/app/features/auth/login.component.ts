import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  readonly mode = signal<'login' | 'register'>('login');
  readonly submitting = signal(false);

  readonly grades = Array.from({ length: 12 }, (_, i) => i + 1);

  readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    grade: [1, [Validators.required, Validators.min(1), Validators.max(12)]]
  });

  constructor() {
    if (this.route.snapshot.queryParamMap.get('register') != null) {
      this.setMode('register');
    }
  }

  toggleMode(): void {
    this.setMode(this.mode() === 'login' ? 'register' : 'login');
  }

  private setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    const displayName = this.form.controls.displayName;
    if (mode === 'register') {
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
    const { email, password, displayName, grade } = this.form.getRawValue();

    const request$ =
      this.mode() === 'login'
        ? this.auth.login({ email, password })
        : this.auth.register({ email, displayName, password, grade: Number(grade) });

    request$.subscribe({
      next: () => {
        this.notifications.success('კეთილი იყოს შენი მობრძანება MENTIQ-ში!');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
