import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Plan, PlansResponse } from '../../core/models/subscription.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="padding:32px 56px 0; max-width:1280px; margin:0 auto;">
      <a [routerLink]="homeLink()" style="font-family:var(--ge-serif); font-size:20px; color:var(--ink); text-decoration:none;">← MENTIQ</a>
    </div>
    <div style="padding:40px 72px 72px; background:var(--paper); max-width:1280px; margin:0 auto;">
      <div style="text-align:center; max-width:640px; margin:0 auto 40px;">
        <!-- <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ფასი</div> -->
        <!-- <h1 style="font-family:var(--ge-serif); font-size:56px; margin:14px 0 14px; line-height:1.02; font-weight:500;">ერთი ფინჯანი ყავის ფასი,<br><em style="color:var(--gold);">უფრო სწრაფი ტვინი.</em></h1> -->
        <p style="font-size:15px; line-height:1.65; color:color-mix(in srgb, var(--ink) 70%, transparent); margin:0;">დაიწყე 7 დღიანი უფასო საცდელი ვერსიით. გადაიხადე მაშინ, როცა მზად იქნები — ან ტრიალის დასრულების შემდეგ.</p>
      </div>

      <!-- Access banner for signed-in users -->
      @if (statusLine(); as line) {
        <div style="max-width:760px; margin:0 auto 28px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 6%, transparent); padding:14px 18px; text-align:center; font-size:13.5px;">
          {{ line }}
        </div>
      }

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0; border:1px solid var(--hair); background:#fff;">
        <!-- Free / Trial -->
        <div style="padding:36px 30px; border-right:1px solid var(--hair);">
          <div style="font-family:var(--ge-serif); font-size:14px; color:var(--gold); font-style:italic;">— Trial</div>
          <h3 style="font-family:var(--ge-serif); font-size:26px; margin:8px 0 16px; font-weight:500;">უფასო</h3>
          <div style="font-family:var(--ge-serif); font-size:48px; line-height:1; font-feature-settings:'tnum';">0<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> ₾</span></div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-top:4px;">7 დღე · სრული წვდომა</div>
          <a routerLink="/onboarding" class="btn btn-secondary" style="display:block; text-align:center; padding:12px; margin-top:24px;">დაწყება</a>
          <ul style="list-style:none; padding:0; margin:28px 0 0; font-size:13.5px; line-height:1.9;">
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ყველა ვარჯიში 7 დღის განმავლობაში</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ყველა დონე და ხრიკი</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ შეჯიბრები და მიღწევები</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0; color:color-mix(in srgb, var(--ink) 40%, transparent);">— ბარათი არ არის საჭირო</li>
          </ul>
        </div>

        <!-- Configured paid plans -->
        @for (plan of plans(); track plan.code; let idx = $index) {
          <div [style.border-right]="idx === 0 ? '1px solid var(--hair)' : 'none'"
               [style.background]="idx === 0 ? 'color-mix(in srgb, var(--gold) 5%, transparent)' : '#fff'"
               style="padding:36px 30px; position:relative;">
            @if (idx === 0) {
              <!-- <div style="position:absolute; top:-12px; left:30px; background:var(--ink); color:var(--paper); font-size:10px; letter-spacing:.22em; text-transform:uppercase; padding:6px 14px;">— რეკომენდებული</div> -->
            }
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="font-family:var(--ge-serif); font-size:14px; color:var(--gold); font-style:italic;">— {{ plan.name }}</div>
              @if (plan.oldPrice && plan.oldPrice > plan.price) {
                <span style="background:#b22; color:#fff; font-size:10px; letter-spacing:.06em; padding:3px 8px; border-radius:2px;">-{{ discount(plan) }}%</span>
              }
            </div>
            <h3 style="font-family:var(--ge-serif); font-size:26px; margin:8px 0 16px; font-weight:500;">{{ plan.name }}</h3>
            <div style="display:flex; align-items:baseline; gap:10px;">
              @if (plan.oldPrice && plan.oldPrice > plan.price) {
                <span style="font-family:var(--ge-serif); font-size:26px; color:color-mix(in srgb, var(--ink) 40%, transparent); text-decoration:line-through; font-feature-settings:'tnum';">{{ plan.oldPrice }}</span>
              }
              <div style="font-family:var(--ge-serif); font-size:48px; line-height:1; font-feature-settings:'tnum';">{{ plan.price }}<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> {{ plan.currency }} / {{ periodLabel(plan) }}</span></div>
            </div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-top:4px;">{{ plan.description }}</div>
            <button type="button" class="btn btn-primary btn-block" style="padding:12px; margin-top:24px;" (click)="subscribe(plan)">გამოწერა</button>
            <ul style="list-style:none; padding:0; margin:28px 0 0; font-size:13.5px; line-height:1.9;">
              <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ულიმიტო ვარჯიში</li>
              <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ნებისმიერი სირთულის ვარჯიში</li>
              <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ხრიკები + შეჯიბრები</li>
              <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ პროგრესის სრული ისტორია</li>
            </ul>
          </div>
        }
      </div>

      <!-- FAQ -->
      <div style="margin-top:56px;">
        <div style="display:flex; align-items:baseline; gap:16px; padding-bottom:12px; border-bottom:1px solid var(--ink);"><span style="font-family:var(--ge-serif); color:var(--gold);">§ IX</span><h3 style="font-family:var(--ge-serif); font-size:22px; margin:0; font-weight:500;">ხშირად დასმული კითხვები</h3></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0;">
          <div style="padding:18px 24px 18px 0; border-bottom:1px solid var(--hair); border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">როგორ ხდება გადახდა?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">ამჟამად გადახდა ხდება ხელით — გადმორიცხავ თანხას მითითებულ ანგარიშზე და მოგვწერ. დადასტურების შემდეგ ადმინისტრატორი გააქტიურებს გამოწერას და წვდომა მაშინვე გაიხსნება.</div></div>
          <div style="padding:18px 0 18px 24px; border-bottom:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">შემიძლია საცდელი ვერსიის დროსვე გამოვიწერო?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">დიახ. 7 დღის ლოდინი საჭირო არ არის — გადახდისთანავე საცდელი ვერსია ფასიან წვდომად გარდაიქმნება.</div></div>
          <div style="padding:18px 24px 18px 0; border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">რა შედის გამოწერაში?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">ულიმიტო ვარჯიში 1–12 კლასის სირთულეზე, ხრიკები, ყოველდღიური ამოცანა, შეჯიბრები, მიღწევები და პროგრესის სრული ისტორია.</div></div>
          <div style="padding:18px 0 18px 24px;"><div style="font-family:var(--ge-serif); font-size:15px;">რა ხდება საცდელი ვერსიის შემდეგ?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">თუ არ გამოიწერ, წვდომა ჩერდება, თუმცა შენი პროგრესი და შედეგები ინახება — გამოწერისთანავე იქიდან გააგრძელებ.</div></div>
        </div>
      </div>
    </div>

    <!-- Manual-payment modal -->
    @if (chosen(); as plan) {
      <div style="position:fixed; inset:0; background:color-mix(in srgb, var(--ink) 45%, transparent); display:grid; place-items:center; z-index:80; padding:20px;" (click)="chosen.set(null)">
        <div style="background:#fff; border:1px solid var(--hair); max-width:460px; width:100%; padding:32px;" (click)="$event.stopPropagation()">
          <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— {{ plan.name }} · {{ plan.price }} {{ plan.currency }}</div>
          <h3 style="font-family:var(--ge-serif); font-size:24px; margin:10px 0 14px; font-weight:500;">გადახდა ხდება ხელით</h3>
          <p style="font-size:14px; line-height:1.6; color:color-mix(in srgb, var(--ink) 72%, transparent); margin:0 0 16px;">{{ instructions() }}</p>
          <div style="border:1px solid var(--hair); padding:14px 16px; font-size:13.5px; line-height:1.8; background:var(--paper);">
            @if (contactEmail()) { <div>✉︎ {{ contactEmail() }}</div> }
            @if (contactPhone()) { <div>☎ {{ contactPhone() }}</div> }
          </div>
          <p style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin:14px 0 0; line-height:1.55;">
            გადახდის დადასტურების შემდეგ ადმინისტრატორი გაგიაქტიურებს გამოწერას და წვდომა მაშინვე გაიხსნება.
          </p>
          <button type="button" class="btn btn-primary btn-block" style="padding:12px; margin-top:20px;" (click)="chosen.set(null)">გასაგებია</button>
        </div>
      </div>
    }
  `
})
export class PricingComponent {
  private readonly subs = inject(SubscriptionService);
  private readonly auth = inject(AuthService);

  private readonly data = signal<PlansResponse | null>(null);

  /** The signed-in user's audience segment ("kids"/"school"/"adult"), or null when anonymous. */
  private readonly audience = computed(() => {
    if (!this.auth.isAuthenticated()) return null;
    return this.auth.educationLevel() === 'preschool' ? 'kids' : this.auth.educationLevel();
  });

  /** Plans offered to this user's segment. Anonymous visitors see every plan. */
  readonly plans = computed(() => {
    const seg = this.audience();
    const all = this.data()?.plans ?? [];
    if (seg == null) return all;
    return all.filter((p) => {
      const aud = p.audiences ?? [];
      return aud.length === 0 || aud.includes('all') || aud.includes(seg);
    });
  });

  readonly instructions = computed(() => this.data()?.paymentInstructions ?? '');
  readonly contactEmail = computed(() => this.data()?.contactEmail ?? '');
  readonly contactPhone = computed(() => this.data()?.contactPhone ?? '');
  readonly chosen = signal<Plan | null>(null);

  readonly isAuthed = computed(() => this.auth.isAuthenticated());

  /** Back link: return kids users to the Kids area, others to their dashboard. */
  readonly homeLink = computed(() => {
    if (!this.auth.isAuthenticated()) return '/';
    return this.auth.educationLevel() === 'preschool' ? '/kids' : '/dashboard';
  });

  readonly statusLine = computed(() => {
    const s = this.subs.status();
    if (!s) return null;
    if (s.status === 'Active') return `შენი გამოწერა აქტიურია — მთავრდება ${this.fmt(s.subscriptionEndDate)}.`;
    if (s.isTrial) return `უფასო საცდელი ვერსია აქტიურია — დარჩა ${s.daysRemaining} დღე.`;
    if (s.status === 'Expired' || s.status === 'Cancelled') return 'შენი წვდომა ამჟამად არააქტიურია. აირჩიე გეგმა გასაგრძელებლად.';
    return null;
  });

  constructor() {
    this.subs.getPlans().subscribe((r) => this.data.set(r));
    // Refresh access status for the banner if the user is signed in.
    if (this.auth.isAuthenticated()) {
      this.subs.loadStatus().subscribe({ error: () => {} });
    }
  }

  subscribe(plan: Plan): void {
    this.chosen.set(plan);
  }

  periodLabel(plan: Plan): string {
    return plan.period === 'year' ? 'წელი' : plan.period === 'month' ? 'თვე' : plan.period;
  }

  /** Percentage saved vs the pre-discount price, rounded. */
  discount(plan: Plan): number {
    if (!plan.oldPrice || plan.oldPrice <= plan.price) return 0;
    return Math.round((1 - plan.price / plan.oldPrice) * 100);
  }

  private fmt(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ka-GE', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
