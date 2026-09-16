import { Component, computed, inject, signal } from '@angular/core';

import { ContactService } from '../../core/services/contact.service';
import { ContactMessage } from '../../core/models/contact.model';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold);">— ადმინი</div>
        <h2>შემოსული კომენტარები</h2>
      </div>
      <div class="spacer"></div>
      <span style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ items().length }} შეტყობინება</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px; max-width:820px;">
      @for (m of items(); track m.id) {
        <div style="border:1px solid var(--hair); background:#fff; padding:18px 20px;"
             [style.opacity]="m.handled ? '0.6' : '1'">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; flex-wrap:wrap;">
            <strong style="font-size:13.5px;">{{ m.name || 'ანონიმური' }}</strong>
            @if (m.email) { <span style="font-size:12px; color:var(--gold);">{{ m.email }}</span> }
            <span style="margin-left:auto; font-size:11.5px; color:color-mix(in srgb, var(--ink) 50%, transparent);">{{ when(m.createdAtUtc) }}</span>
          </div>
          <div style="font-size:13.5px; line-height:1.6; white-space:pre-wrap;">{{ m.comment }}</div>
          <div style="margin-top:10px; display:flex; gap:12px; align-items:center;">
            <button type="button" class="btn btn-ghost" style="font-size:12px; padding:4px 8px;"
                    (click)="toggle(m)">
              {{ m.handled ? '↺ დაუბრუნე' : '✓ დამუშავებულად მონიშვნა' }}
            </button>
            @if (m.handled) { <span style="font-size:11.5px; color:var(--gold);">✓ დამუშავებული</span> }
          </div>
        </div>
      } @empty {
        <div style="text-align:center; color:color-mix(in srgb, var(--ink) 50%, transparent); padding:48px 12px; font-size:14px;">
          ჯერ არცერთი კომენტარი არ შემოსულა.
        </div>
      }
    </div>
  `
})
export class AdminContactComponent {
  private readonly contact = inject(ContactService);

  private readonly _items = signal<ContactMessage[]>([]);
  readonly items = computed(() => this._items());

  constructor() {
    this.load();
  }

  load(): void {
    this.contact.adminList().subscribe({ next: (r) => this._items.set(r.items) });
  }

  toggle(m: ContactMessage): void {
    this.contact.adminMarkHandled(m.id, !m.handled).subscribe({
      next: () => this._items.update((list) => list.map((x) => (x.id === m.id ? { ...x, handled: !m.handled } : x)))
    });
  }

  when(iso: string): string {
    return new Date(iso).toLocaleString('ka-GE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
