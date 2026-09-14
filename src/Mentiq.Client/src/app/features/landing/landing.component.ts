import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="max-width:1280px; margin:0 auto; background:#fff; border-left:1px solid var(--hair); border-right:1px solid var(--hair); min-height:100vh;">
      <!-- Nav -->
      <div style="display:flex; align-items:center; padding: 22px 56px; border-bottom:1px solid var(--hair); gap:32px; flex-wrap:wrap;">
        <div style="font-family:var(--ge-serif); font-size:22px;">MENTIQ<span style="color:var(--gold); font-size:9px; letter-spacing:.24em; margin-left:8px; font-family:var(--ge); vertical-align:5px;">EST · 2026</span></div>
        <nav style="display:flex; gap:28px; margin-left:40px; font-size:13.5px;">
          <span>პროდუქტი</span><span>ხრიკები</span><a routerLink="/pricing" style="color:inherit;">ფასი</a><span>სკოლებისთვის</span>
        </nav>
        <div style="margin-left:auto; display:flex; gap:14px; align-items:center; font-size:13px;">
          <a routerLink="/login" style="color:color-mix(in srgb, var(--ink) 55%, transparent);">შესვლა</a>
          <a routerLink="/onboarding" class="btn btn-primary" style="padding:9px 16px;">დაიწყე უფასოდ</a>
        </div>
      </div>

      <!-- Hero -->
      <div style="display:grid; grid-template-columns: 1.05fr 1fr; gap:56px; padding: 80px 56px 88px; align-items:center;">
        <div>
          <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold); margin-bottom:22px;">— ტვინის ვარჯიში, ყოველდღე</div>
          <h1 style="font-family:var(--ge-serif); font-size:72px; line-height:1; margin:0 0 22px; letter-spacing:-.02em; font-weight:500;">იფიქრე უფრო<br><em style="font-style:italic; color:var(--gold); font-weight:500;">სწრაფად.</em><br>გამოთვალე უფრო<br><em style="font-style:italic; font-weight:500;">ჭკვიანურად.</em></h1>
          <p style="font-size:16px; line-height:1.65; max-width:42ch; color:color-mix(in srgb, var(--ink) 72%, transparent); margin:0 0 28px;">ავითარე გონებრივი მათემატიკის უნარი მოკლე, ფოკუსირებული ვარჯიშით. შვიდი წუთი დღეში — რვა კვირაში ტვინი განსხვავებულად მუშაობს.</p>
          <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
            <a routerLink="/onboarding" class="btn btn-primary" style="padding:14px 24px; font-size:15px;">დაიწყე 7-დღიანი ტრიალი</a>
            <a routerLink="/practice" class="btn btn-secondary" style="padding:14px 20px; font-size:14px;">სცადე გამოწვევა →</a>
          </div>
          <div style="margin-top:22px; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); display:flex; gap:22px; flex-wrap:wrap;">
            <span>✓ 7 დღე უფასოდ</span><span>✓ ბარათის გარეშე</span><span>✓ გააჩერე ნებისმიერ დროს</span>
          </div>
        </div>
        <!-- product preview card -->
        <div style="border:1px solid var(--hair); background:#fff; padding:24px; box-shadow: var(--shadow-md); border-radius:4px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); padding-bottom:12px; border-bottom:1px solid var(--hair);">
            <span>დონე 4 · შეკრება</span><span>კითხვა 12 / 30</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:16px 4px 12px;">
            <div><div style="font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">დრო</div><div style="font-family:var(--ge-serif); font-size:22px; font-feature-settings:'tnum';">00:43</div></div>
            <div style="text-align:right;"><div style="font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">ქულა</div><div style="font-family:var(--ge-serif); font-size:22px; color:var(--gold); font-feature-settings:'tnum';">126</div></div>
          </div>
          <div style="text-align:center; padding: 36px 0 28px; border-top:1px solid var(--hair); border-bottom:1px solid var(--hair);">
            <div style="font-family:var(--ge-serif); font-size:80px; line-height:1; font-feature-settings:'tnum'; letter-spacing:-.02em;">47 + 28</div>
            <div style="font-family:var(--ge-serif); font-size:40px; color:color-mix(in srgb, var(--ink) 30%, transparent); margin-top:8px;">= <span style="border-bottom:2px solid var(--gold); padding: 0 26px; color:var(--ink);">75</span></div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-top:16px; font-family:var(--ge-serif); font-size:18px;">
            <span style="padding:14px; text-align:center; border:1px solid var(--hair);">7</span>
            <span style="padding:14px; text-align:center; border:1px solid var(--hair);">8</span>
            <span style="padding:14px; text-align:center; border:1px solid var(--hair);">9</span>
            <span style="padding:14px; text-align:center; border:1px solid var(--hair);">4</span>
            <span style="padding:14px; text-align:center; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 10%, transparent);">5</span>
            <span style="padding:14px; text-align:center; border:1px solid var(--hair);">6</span>
          </div>
        </div>
      </div>

      <!-- how it works -->
      <div style="padding: 56px 56px 64px; border-top:1px solid var(--hair);">
        <div style="display:flex; align-items:baseline; gap:16px; margin-bottom:36px;">
          <span style="font-family:var(--ge-serif); font-size:22px; color:var(--gold);">§ I</span>
          <h2 style="font-family:var(--ge-serif); font-size:36px; margin:0; font-weight:500;">როგორ მუშაობს MENTIQ</h2>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); border-top:1px solid var(--hair);">
          <div style="padding:26px 24px; border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); color:var(--gold);">01.</div><h4 style="margin:12px 0 8px; font-family:var(--ge-serif); font-size:18px; font-weight:500;">დაიწყე ტესტით</h4><p style="font-size:13px; line-height:1.55; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">ორ წუთში ვხედავთ, საიდან უნდა დავიწყოთ.</p></div>
          <div style="padding:26px 24px; border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); color:var(--gold);">02.</div><h4 style="margin:12px 0 8px; font-family:var(--ge-serif); font-size:18px; font-weight:500;">ივარჯიშე ყოველდღე</h4><p style="font-size:13px; line-height:1.55; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">5–20 წუთი, დროზე დამოკიდებული სავარჯიშოები.</p></div>
          <div style="padding:26px 24px; border-right:1px solid var(--hair);"><div style="font-family:var(--ge-serif); color:var(--gold);">03.</div><h4 style="margin:12px 0 8px; font-family:var(--ge-serif); font-size:18px; font-weight:500;">ისწავლე ხრიკები</h4><p style="font-size:13px; line-height:1.55; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">გამრავლება 11-ზე, პროცენტები — ერთი ხრიკი, ერთი გაკვეთილი.</p></div>
          <div style="padding:26px 24px;"><div style="font-family:var(--ge-serif); color:var(--gold);">04.</div><h4 style="margin:12px 0 8px; font-family:var(--ge-serif); font-size:18px; font-weight:500;">დააკვირდი ზრდას</h4><p style="font-size:13px; line-height:1.55; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">სიზუსტე, სიჩქარე, სერია — ყოველი კვირა უფრო ცხადი.</p></div>
        </div>
      </div>

      <!-- social proof -->
      <div style="padding: 40px 56px; border-top:1px solid var(--hair); display:flex; align-items:center; gap:40px; font-size:13px; color:color-mix(in srgb, var(--ink) 65%, transparent); flex-wrap:wrap;">
        <span style="font-family:var(--ge-serif); font-style:italic; font-size:17px; color:var(--ink);">„საუკეთესო  პლატფორმა ბავშვებისთვის"</span>
        <span style="margin-left:auto; white-space:nowrap;">— ნინო, მშობელი, თბილისი</span>
      </div>
      <div style="padding: 26px 56px; border-top:1px solid var(--hair); display:flex; justify-content:space-between; font-size:11px; color:color-mix(in srgb, var(--ink) 55%, transparent); flex-wrap:wrap; gap:12px;">
        <span>MENTIQ © 2026 · თბილისი</span>
        <span style="display:flex; gap:22px;"><span>წესები</span><span>კონფიდენციალურობა</span><span>კონტაქტი</span></span>
      </div>
    </div>
  `
})
export class LandingComponent {}
