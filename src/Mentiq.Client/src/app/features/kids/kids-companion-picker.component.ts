import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';
import { KidsProfileService } from './kids-profile.service';
import { KidsCompanionComponent } from './kids-companion.component';
import { CompanionType, KIDS_COMPANIONS } from './kids-companions.data';

/**
 * First-run companion picker (design 01.c). The child chooses a travel friend
 * that stays with them through the journey. Minimal text, big friendly cards.
 */
@Component({
  selector: 'app-kids-companion-picker',
  standalone: true,
  imports: [KidsCompanionComponent],
  template: `
    <div class="kids-kicker" style="margin-top:8px;">— მოგზაურობა იწყება</div>
    <div class="kids-h1">აირჩიე მეგობარი.</div>
    <p class="kids-sub">ის შენთან იქნება, სანამ ვვარჯიშობთ. მოგვიანებით შეგიძლია გამოცვალო.</p>

    <div class="kids-comp-grid">
      @for (c of companions; track c.type) {
        <button type="button" class="kids-comp-card" [class.on]="chosen() === c.type" (click)="pick(c.type)">
          <div class="kids-comp-face"><app-kids-companion [type]="c.type" mood="happy" /></div>
          <div class="kids-comp-name">{{ c.name }}</div>
          <div class="kids-comp-species">{{ c.species }}</div>
        </button>
      }
    </div>

    <button type="button" class="kids-btn" style="width:100%; max-width:360px; margin:20px auto 0; display:block; padding:16px; font-size:15px;"
            [disabled]="!chosen()" (click)="confirm()">
      დავიწყოთ პირველი მისია →
    </button>
  `
})
export class KidsCompanionPickerComponent {
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);

  readonly companions = KIDS_COMPANIONS;
  readonly chosen = signal<CompanionType | null>(this.profile.companion());

  pick(type: CompanionType): void {
    this.chosen.set(type);
    this.audio.blip();
  }

  confirm(): void {
    const t = this.chosen();
    if (!t) return;
    this.profile.setCompanion(t);
    this.audio.cue('success');
    this.router.navigate(['/kids']);
  }
}
