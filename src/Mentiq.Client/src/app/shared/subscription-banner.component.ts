import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SubscriptionService } from '../core/services/subscription.service';

/**
 * Visual subscription state banner (trial countdown, active, expired). The
 * countdown is display-only — the backend remains the authority for access, so
 * this never gates anything by itself.
 */
@Component({
  selector: 'app-subscription-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (status(); as s) {
      @if (s.status === 'Trial' || s.isTrial) {
        <div style="border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 7%, transparent); padding:14px 18px; margin-bottom:20px; display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-size:20px;">🎁</span>
          <div style="flex:1; min-width:200px;">
            <div style="font-family:var(--ge-serif); font-size:16px;">უფასო ტრიალი — დარჩა {{ countdown() }}</div>
            <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 62%, transparent);">სრული წვდომა ყველა ფუნქციაზე. გამოიწერე ნებისმიერ დროს.</div>
          </div>
          <a routerLink="/pricing" class="btn btn-primary" style="padding:9px 18px;">გამოწერა →</a>
        </div>
      } @else if (s.status === 'Active') {
        <div style="border:1px solid var(--hair); background:#fff; padding:12px 18px; margin-bottom:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <span style="color:var(--gold);">✓</span>
          <div style="flex:1; min-width:200px; font-size:13.5px;">შენი გამოწერა აქტიურია — მთავრდება {{ endDate() }}.</div>
          <a routerLink="/pricing" style="font-size:12.5px; color:var(--gold);">გეგმის ნახვა →</a>
        </div>
      } @else {
        <div style="border:1px solid #d99; background:color-mix(in srgb, #b22 6%, transparent); padding:14px 18px; margin-bottom:20px; display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-size:20px;">🔒</span>
          <div style="flex:1; min-width:200px;">
            <div style="font-family:var(--ge-serif); font-size:16px;">შენი წვდომა არააქტიურია</div>
            <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 62%, transparent);">უფასო ტრიალი დასრულდა. აირჩიე გეგმა MENTIQ-ის გასაგრძელებლად.</div>
          </div>
          <a routerLink="/pricing" class="btn btn-primary" style="padding:9px 18px;">აირჩიე გეგმა →</a>
        </div>
      }
    }
  `
})
export class SubscriptionBannerComponent implements OnDestroy {
  private readonly subs = inject(SubscriptionService);

  readonly status = this.subs.status;
  private readonly tick = signal(0);
  private readonly timer: ReturnType<typeof setInterval>;

  readonly endDate = computed(() => {
    const iso = this.status()?.subscriptionEndDate;
    return iso ? new Date(iso).toLocaleDateString('ka-GE', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  });

  readonly countdown = computed(() => {
    this.tick(); // re-evaluate on timer
    const iso = this.status()?.accessEndsUtc;
    if (!iso) return '—';
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return '0 წუთი';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (days >= 1) return `${days} დღე`;
    if (hours >= 1) return `${hours} საათი`;
    return `${minutes} წუთი`;
  });

  constructor() {
    if (!this.subs.status()) {
      this.subs.loadStatus().subscribe({ error: () => {} });
    }
    // Update the visual countdown once a minute.
    this.timer = setInterval(() => this.tick.update((n) => n + 1), 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
