import { Component, Input } from '@angular/core';

import { CompanionType } from './kids-companions.data';

/**
 * The child's companion, built from simple shapes (non-cartoon, per the design):
 * ბუნი (bunny), მელო (fox), პანდი (panda) or კოა (koala). Reacts with a mood.
 */
@Component({
  selector: 'app-kids-companion',
  standalone: true,
  template: `
    <div class="kc" [class]="'kc-' + type + ' ' + mood">
      @switch (type) {
        @case ('fox') {
          <span class="kc-ear tri l"></span><span class="kc-ear tri r"></span>
        }
        @case ('panda') {
          <span class="kc-ear circ l"></span><span class="kc-ear circ r"></span>
        }
        @case ('koala') {
          <span class="kc-ear round l"></span><span class="kc-ear round r"></span>
        }
        @default {
          <span class="kc-ear l"></span><span class="kc-ear r"></span>
        }
      }
      <span class="kc-head">
        <span class="kc-eye l"></span>
        <span class="kc-eye r"></span>
        <span class="kc-mouth"></span>
      </span>
    </div>
  `
})
export class KidsCompanionComponent {
  @Input() type: CompanionType = 'bunny';
  @Input() mood: 'idle' | 'happy' | 'sad' = 'idle';
}
