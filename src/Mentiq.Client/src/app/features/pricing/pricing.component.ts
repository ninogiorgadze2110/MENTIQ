import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="padding:32px 56px 0; max-width:1280px; margin:0 auto;">
      <a routerLink="/" style="font-family:var(--ge-serif); font-size:20px; color:var(--ink); text-decoration:none;">← MENTIQ</a>
    </div>
    <div style="padding:40px 72px 72px; background:var(--paper); max-width:1280px; margin:0 auto;">
      <div style="text-align:center; max-width:640px; margin:0 auto 48px;">
        <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ფასი</div>
        <h1 style="font-family:var(--ge-serif); font-size:56px; margin:14px 0 14px; line-height:1.02; font-weight:500;">ერთი ფინჯანი ყავის ფასი,<br><em style="color:var(--gold);">უფრო სწრაფი ტვინი.</em></h1>
        <p style="font-size:15px; line-height:1.65; color:color-mix(in srgb, var(--ink) 70%, transparent); margin:0;">დაიწყე უფასოდ. გადადი Pro-ზე, როცა ნახავ, რომ ყოველდღიური ვარჯიში მუშაობს.</p>
        <div style="display:inline-flex; margin-top:22px; border:1px solid var(--hair); font-size:12px;">
          <span style="padding:8px 18px;">თვიური</span>
          <span style="padding:8px 18px; background:var(--ink); color:var(--paper);">წლიური · <span style="color:var(--gold);">-30%</span></span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0; border:1px solid var(--hair); background:#fff;">
        <!-- Free -->
        <div style="padding:36px 30px; border-right:1px solid var(--hair);">
          <div style="font-family:var(--ge-serif); font-size:14px; color:var(--gold); font-style:italic;">— Trial</div>
          <h3 style="font-family:var(--ge-serif); font-size:26px; margin:8px 0 16px; font-weight:500;">უფასო</h3>
          <div style="font-family:var(--ge-serif); font-size:48px; line-height:1; font-feature-settings:'tnum';">0<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> ₾</span></div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-top:4px;">სამუდამოდ</div>
          <a routerLink="/onboarding" class="btn btn-secondary" style="display:block; text-align:center; padding:12px; margin-top:24px;">დაწყება</a>
          <ul style="list-style:none; padding:0; margin:28px 0 0; font-size:13.5px; line-height:1.9;">
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ დღეში 1 ვარჯიში</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ დონეები I–III</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ 5 ხრიკი</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0; color:color-mix(in srgb, var(--ink) 40%, transparent);">— პროგრესის ისტორია</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0; color:color-mix(in srgb, var(--ink) 40%, transparent);">— მშობლის პანელი</li>
          </ul>
        </div>

        <!-- Pro -->
        <div style="padding:36px 30px; border-right:1px solid var(--hair); background:color-mix(in srgb, var(--gold) 5%, transparent); position:relative;">
          <div style="position:absolute; top:-12px; left:30px; background:var(--ink); color:var(--paper); font-size:10px; letter-spacing:.22em; text-transform:uppercase; padding:6px 14px;">— რეკომენდებული</div>
          <div style="font-family:var(--ge-serif); font-size:14px; color:var(--gold); font-style:italic;">— Pro</div>
          <h3 style="font-family:var(--ge-serif); font-size:26px; margin:8px 0 16px; font-weight:500;">ინდივიდუალური</h3>
          <div style="font-family:var(--ge-serif); font-size:48px; line-height:1; font-feature-settings:'tnum';">14<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> ₾ / თვე</span></div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-top:4px;">წლიური გადახდით · 168 ₾ / წელი</div>
          <a routerLink="/onboarding" class="btn btn-primary" style="display:block; text-align:center; padding:12px; margin-top:24px;">7-დღიანი ტრიალი</a>
          <ul style="list-style:none; padding:0; margin:28px 0 0; font-size:13.5px; line-height:1.9;">
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ულიმიტო ვარჯიშები</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ 12 დონე, სრული რუკა</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ 50 ხრიკი + ვიდეო</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ პროგრესის სრული ისტორია</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ პირადი გამოწვევა</li>
          </ul>
        </div>

        <!-- Family -->
        <div style="padding:36px 30px;">
          <div style="font-family:var(--ge-serif); font-size:14px; color:var(--gold); font-style:italic;">— Family</div>
          <h3 style="font-family:var(--ge-serif); font-size:26px; margin:8px 0 16px; font-weight:500;">ოჯახური</h3>
          <div style="font-family:var(--ge-serif); font-size:48px; line-height:1; font-feature-settings:'tnum';">24<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> ₾ / თვე</span></div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-top:4px;">4 ანგარიშამდე · 288 ₾ / წელი</div>
          <a routerLink="/onboarding" class="btn btn-secondary" style="display:block; text-align:center; padding:12px; margin-top:24px;">ოჯახის დაწყება</a>
          <ul style="list-style:none; padding:0; margin:28px 0 0; font-size:13.5px; line-height:1.9;">
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ყველაფერი Pro-დან</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ 4 ანგარიში</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ მშობლის პანელი</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ბავშვის უსაფრთხო რეჟიმი</li>
            <li style="border-top:1px solid var(--hair); padding:8px 0;">✓ ყოველკვირეული ანგარიში</li>
          </ul>
        </div>
      </div>

      <div style="margin-top:56px;">
        <div style="display:flex; align-items:baseline; gap:16px; padding-bottom:12px; border-bottom:1px solid var(--ink);"><span style="font-family:var(--ge-serif); color:var(--gold);">§ IX</span><h3 style="font-family:var(--ge-serif); font-size:22px; margin:0; font-weight:500;">ხშირად დასმული კითხვები</h3></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0;">
          <div style="padding:18px 24px 18px 0; border-bottom:1px solid var(--hair); border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">შემიძლია ტრიალის შემდეგ გავჩერდე?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">დიახ. ბარათს არ ვთხოულობთ, სანამ ტრიალი გრძელდება.</div></div>
          <div style="padding:18px 0 18px 24px; border-bottom:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">რა ვარიანტებით ვიხდი?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">ბარათი, Apple Pay, Google Pay. ლარით და აშშ დოლარით.</div></div>
          <div style="padding:18px 24px 18px 0; border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); font-size:15px;">არის სკოლების ვერსია?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">დიახ, MENTIQ Schools. მოგვწერე ფასის შესახებ.</div></div>
          <div style="padding:18px 0 18px 24px;"><div style="font-family:var(--ge-serif); font-size:15px;">გახდი უფრო ჭკვიანი?</div><div style="font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:4px; line-height:1.55;">არა. მაგრამ ბევრად უფრო სწრაფად თვლი. ეს ხშირად საკმარისია.</div></div>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent {}
