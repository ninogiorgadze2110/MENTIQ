import { Component, Input } from '@angular/core';

import { Belt } from './belt-badge.component';

/** ოსტატობის ზოლი — სიზუსტე/პროგრესი შემდეგ ქამრამდე. */
@Component({
  selector: 'app-mastery-bar',
  standalone: true,
  template: `
    <div class="mastery-bar" [attr.data-belt]="belt">
      <div class="mb-track">
        <div class="mb-fill" [style.width.%]="clamped()"></div>
      </div>
      @if (showValue) {
        <div class="mb-val">{{ clamped() }}%</div>
      }
    </div>
  `
})
export class MasteryBarComponent {
  @Input() value = 0;
  @Input() belt: Belt | null = null;
  @Input() showValue = true;

  clamped(): number {
    return Math.max(0, Math.min(100, Math.round(this.value)));
  }
}
