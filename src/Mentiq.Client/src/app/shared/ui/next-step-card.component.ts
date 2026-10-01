import { Component, Input } from '@angular/core';

import { Belt } from './belt-badge.component';

/**
 * „შემდეგი ნაბიჯი" — primary ბარათი ქამრის აქცენტით.
 * CTA გადაეცემა content projection-ით (მაგ. routerLink ღილაკი) [ns-cta] სლოტში.
 */
@Component({
  selector: 'app-next-step-card',
  standalone: true,
  template: `
    <div class="ui-card card-primary next-step-card" [attr.data-belt]="belt">
      <div class="ns-body">
        @if (kicker) {
          <div class="ge-label on-belt">{{ kicker }}</div>
        }
        <div class="ns-title">{{ title }}</div>
        @if (sub) {
          <div class="ns-sub">{{ sub }}</div>
        }
      </div>
      <ng-content select="[ns-cta]"></ng-content>
    </div>
  `
})
export class NextStepCardComponent {
  @Input() title = '';
  @Input() sub = '';
  @Input() kicker = '';
  @Input() belt: Belt | null = null;
}
