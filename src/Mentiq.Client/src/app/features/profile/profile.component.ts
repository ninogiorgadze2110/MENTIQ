import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <header class="page-head">
      <h1>Profile</h1>
      <p class="muted">Your account details.</p>
    </header>

    @if (user(); as u) {
      <div class="card profile">
        <span class="avatar-lg">{{ u.displayName.charAt(0).toUpperCase() }}</span>
        <div class="rows">
          <div class="row">
            <span class="muted">Name</span>
            <strong>{{ u.displayName }}</strong>
          </div>
          <div class="row">
            <span class="muted">Email</span>
            <strong>{{ u.email }}</strong>
          </div>
          <div class="row">
            <span class="muted">User ID</span>
            <code>{{ u.id }}</code>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .page-head {
        margin-bottom: var(--space-6);
      }
      .profile {
        display: flex;
        align-items: flex-start;
        gap: var(--space-5);
        max-width: 560px;
      }
      .avatar-lg {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--brand-600);
        color: #fff;
        font-size: 1.6rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        width: 100%;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: var(--space-4);
        padding-bottom: var(--space-3);
        border-bottom: 1px solid var(--border);
      }
      code {
        font-size: 0.85rem;
      }
    `
  ]
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
}
