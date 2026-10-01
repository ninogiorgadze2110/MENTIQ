import { Component, Input } from '@angular/core';

export type Belt = 'white' | 'yellow' | 'green' | 'blue' | 'black';

/** ქამრის ბეჯი — ფერს იღებს მიმდინარე ქამრიდან (data-belt → --belt* tokens). */
@Component({
  selector: 'app-belt-badge',
  standalone: true,
  template: `
    <span class="belt-badge" [class.lg]="size === 'lg'" [attr.data-belt]="belt">
      <span class="belt-dot"></span>{{ label }}
    </span>
  `
})
export class BeltBadgeComponent {
  @Input() belt: Belt = 'white';
  @Input() label = '';
  @Input() size: 'sm' | 'lg' = 'sm';
}
