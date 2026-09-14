import { Component, Input } from '@angular/core';

/**
 * Generic "coming soon" page used for feature areas that are part of the
 * application shell but not yet implemented. Inputs are bound from route data
 * via withComponentInputBinding().
 */
@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <header class="page-head">
      <h1>{{ title }}</h1>
      <p class="muted">{{ description }}</p>
    </header>

    <div class="card empty">
      <span class="empty-icon" aria-hidden="true">{{ icon }}</span>
      <h2>Coming soon</h2>
      <p class="muted">
        This section is part of the Mentiq foundation and is ready to be built out
        with features.
      </p>
    </div>
  `,
  styles: [
    `
      .page-head {
        margin-bottom: var(--space-6);
      }
      .empty {
        display: grid;
        place-items: center;
        gap: var(--space-2);
        text-align: center;
        padding: var(--space-8) var(--space-5);
      }
      .empty-icon {
        font-size: 2.4rem;
      }
    `
  ]
})
export class PlaceholderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '✦';
}
