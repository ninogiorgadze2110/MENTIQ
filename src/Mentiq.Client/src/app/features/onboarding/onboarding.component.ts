import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface Goal {
  title: string;
  sub: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  template: `
    <div style="min-height:100vh; display:grid; grid-template-columns:340px 1fr;">
      <!-- left column -->
      <div style="padding:40px 32px; border-right:1px solid var(--hair); background:color-mix(in srgb, var(--gold) 4%, var(--paper)); display:flex; flex-direction:column;">
        <div style="font-family:var(--ge-serif); font-size:22px;">MENTIQ</div>
        <div style="margin-top:56px; font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— ნაბიჯი 2 / 3</div>
        <h2 style="font-family:var(--ge-serif); font-size:34px; margin:10px 0 14px; font-weight:500; line-height:1.05;">მოგვიყევი შენს შესახებ.</h2>
        <p style="font-size:14px; line-height:1.6; color:color-mix(in srgb, var(--ink) 70%, transparent);">სამი პასუხი. ამის მიხედვით ვაწყობთ პირველ კვირას — გამარტივებული სავარჯიშოებით ვიწყებთ, თუ პირდაპირ გამოწვევით.</p>
        <div style="margin-top:auto; padding-top:40px; border-top:1px solid var(--hair); font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="width:20px; height:20px; border-radius:50%; background:var(--gold); color:#fff; display:grid; place-items:center; font-size:11px;">✓</span> ანგარიში შექმნილია</div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px; color:var(--ink); font-weight:600;"><span style="width:20px; height:20px; border-radius:50%; border:1.5px solid var(--gold); color:var(--gold); display:grid; place-items:center; font-family:var(--ge-serif); font-size:11px;">2</span> შენი მიზანი</div>
          <div style="display:flex; align-items:center; gap:10px;"><span style="width:20px; height:20px; border-radius:50%; border:1px solid var(--hair); display:grid; place-items:center; font-family:var(--ge-serif); font-size:11px; color:color-mix(in srgb, var(--ink) 40%, transparent);">3</span> საწყისი ტესტი</div>
        </div>
      </div>
      <!-- right column -->
      <div style="padding:64px 72px;">
        <div style="max-width:520px;">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); letter-spacing:.02em; margin-bottom:8px;">კითხვა 1 / 3</div>
          <h3 style="font-family:var(--ge-serif); font-size:30px; margin:0 0 6px; font-weight:500;">რატომ იწყებ MENTIQ-ს?</h3>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin:0 0 32px;">აირჩიე ერთი. მოგვიანებით შეგიძლია შეცვალო.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            @for (goal of goals; track goal.title; let i = $index) {
              <div
                (click)="selected.set(i)"
                [style.border]="selected() === i ? '1px solid var(--gold)' : '1px solid var(--hair)'"
                [style.background]="selected() === i ? 'color-mix(in srgb, var(--gold) 6%, transparent)' : 'transparent'"
                style="display:flex; gap:16px; padding:18px 20px; align-items:center; cursor:pointer;"
              >
                <span
                  [style.border]="selected() === i ? '5px solid var(--gold)' : '1.5px solid var(--hair)'"
                  [style.box-shadow]="selected() === i ? 'inset 0 0 0 2px #fff' : 'none'"
                  style="width:16px; height:16px; border-radius:50%; flex:none;"
                ></span>
                <div>
                  <div style="font-family:var(--ge-serif); font-size:17px;">{{ goal.title }}</div>
                  <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:2px;">{{ goal.sub }}</div>
                </div>
              </div>
            }
          </div>
          <div style="display:flex; margin-top:32px; align-items:center;">
            <a href="javascript:void(0)" (click)="back()" style="font-size:13px; color:color-mix(in srgb, var(--ink) 55%, transparent);">← უკან</a>
            <a href="javascript:void(0)" (click)="next()" class="btn btn-primary" style="margin-left:auto; padding:12px 26px; font-size:14px;">გავაგრძელოთ →</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OnboardingComponent {
  private readonly router = inject(Router);

  readonly selected = signal(0);

  readonly goals: Goal[] = [
    { title: 'გავიუმჯობესო გონებრივი გამოთვლა', sub: 'ყოველდღიური ვარჯიში, სიჩქარე და სიზუსტე.' },
    { title: 'მოვემზადო გამოცდისთვის', sub: 'SAT, ერთიანი ეროვნული, აპლიკანტური.' },
    { title: 'დავეხმარო ბავშვს', sub: '7–14 წლის მოსწავლისთვის.' },
    { title: 'უბრალოდ, სიამოვნებისთვის', sub: 'ტვინის ვარჯიში, ყოველდღიური რიტუალი.' }
  ];

  back(): void {
    this.router.navigate(['/']);
  }

  next(): void {
    this.router.navigate(['/login'], { queryParams: { register: 1 } });
  }
}
