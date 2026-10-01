import { Component, Input } from '@angular/core';

import { Belt } from './belt-badge.component';

/** ოსტატობის რგოლი — კომპაქტური წრიული ვარიანტი. */
@Component({
  selector: 'app-mastery-ring',
  standalone: true,
  template: `
    <div class="mastery-ring" [attr.data-belt]="belt">
      <svg viewBox="0 0 44 44">
        <circle class="mr-track" cx="22" cy="22" [attr.r]="r" />
        <circle
          class="mr-fill"
          cx="22"
          cy="22"
          [attr.r]="r"
          [attr.stroke-dasharray]="circ"
          [attr.stroke-dashoffset]="offset()"
        />
      </svg>
      @if (showValue) {
        <div class="mr-val">{{ clamped() }}</div>
      }
    </div>
  `
})
export class MasteryRingComponent {
  @Input() value = 0;
  @Input() belt: Belt | null = null;
  @Input() showValue = true;

  readonly r = 20;
  readonly circ = 2 * Math.PI * 20;

  clamped(): number {
    return Math.max(0, Math.min(100, Math.round(this.value)));
  }

  offset(): number {
    return this.circ * (1 - this.clamped() / 100);
  }
}
