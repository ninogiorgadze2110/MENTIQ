import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="page-head">
      <h1>Welcome back{{ user() ? ', ' + user()!.displayName : '' }} 👋</h1>
      <p class="muted">Here's a snapshot of your learning so far.</p>
    </header>

    <section class="stat-grid">
      @for (stat of stats; track stat.label) {
        <div class="card stat">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label muted">{{ stat.label }}</span>
        </div>
      }
    </section>

    <section class="card cta">
      <div>
        <h2>Ready for today's practice?</h2>
        <p class="muted">Keep your streak alive with a quick session.</p>
      </div>
      <a routerLink="/practice" class="btn btn-primary">Start practising</a>
    </section>
  `,
  styles: [
    `
      .page-head {
        margin-bottom: var(--space-6);
      }
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .stat-value {
        font-size: 1.9rem;
        font-weight: 700;
        color: var(--brand-600);
      }
      .cta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        flex-wrap: wrap;
      }
    `
  ]
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;

  readonly stats = [
    { label: 'Lessons completed', value: 0 },
    { label: 'Current streak', value: '0 days' },
    { label: 'Achievements', value: 0 },
    { label: 'Accuracy', value: '—' }
  ];
}
