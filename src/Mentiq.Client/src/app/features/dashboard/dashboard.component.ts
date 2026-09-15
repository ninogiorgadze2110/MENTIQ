import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">ოთხშაბათი, 15 იანვარი</div>
        <h2>გამარჯობა, {{ firstName() }}.</h2>
      </div>
      <div class="spacer"></div>
      <!-- <div class="lang"><span class="on">KA</span><span>EN</span></div> -->
      <!-- <div style="width:34px; height:34px; border-radius:50%; background:var(--color-accent-200); color:var(--color-accent-800); display:grid; place-items:center; font-family:var(--ge-serif);">{{ initial() }}</div> -->
    </div>

    <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:20px;">
      <!-- Daily card -->
      <div style="border:1px solid var(--hair); background:#fff; padding:32px; display:flex; gap:32px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:220px;">
          <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— დღის ვარჯიში</div>
          <h3 style="font-family:var(--ge-serif); font-size:32px; margin:10px 0 6px; font-weight:500; line-height:1.05;">ორნიშნა შეკრება, დროზე</h3>
          <p style="font-size:13.5px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 20px; line-height:1.55;">დღეს — 30 კითხვა, 90 წამის ბიუჯეტით თითოზე. გუშინდელი სიზუსტე: 87%.</p>
          <div style="display:flex; gap:10px; align-items:center;">
            <a routerLink="/practice" class="btn btn-primary" style="padding:12px 22px;">დაიწყე ვარჯიში →</a>
            <span style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">~ 7 წუთი</span>
          </div>
        </div>
        <div style="width:170px; height:170px; position:relative; display:grid; place-items:center;">
          <svg viewBox="0 0 100 100" style="width:100%; height:100%; transform:rotate(-90deg);">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hair)" stroke-width="2"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="276" stroke-dashoffset="60" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute; text-align:center;">
            <div style="font-family:var(--ge-serif); font-size:46px; color:var(--gold); line-height:1;">12</div>
            <div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">დღიანი სერია</div>
          </div>
        </div>
      </div>
      <!-- Level card -->
      <div style="border:1px solid var(--hair); background:#fff; padding:28px 30px;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">— შენი დონე</div>
        <div style="display:flex; align-items:baseline; gap:12px; margin-top:8px;">
          <div style="font-family:var(--ge-serif); font-size:66px; color:var(--gold); line-height:1;">IV</div>
          <div><div style="font-family:var(--ge-serif); font-size:20px;">შუალედური</div><div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent);">ორნიშნა შეკრება</div></div>
        </div>
        <div style="margin-top:22px;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;"><span>დონე V-მდე</span><span style="font-feature-settings:'tnum';">312 / 500 XP</span></div>
          <div style="height:4px; background:var(--hair); position:relative;"><div style="width:62%; height:100%; background:var(--gold);"></div></div>
        </div>
        <div style="margin-top:18px; padding-top:16px; border-top:1px solid var(--hair); font-size:12.5px; color:color-mix(in srgb, var(--ink) 65%, transparent);">ბოლო ჯილდო: <span style="color:var(--ink); font-family:var(--ge-serif); font-style:italic;">„სამი დღიანი ცეცხლი"</span></div>
      </div>
    </div>

    <!-- Three metrics -->
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-top:20px;">
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სიზუსტე · 7 დღე</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">87<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">%</span></div>
        <div style="font-size:12px; color:var(--gold);">↑ 4% წინა კვირასთან</div>
        <svg viewBox="0 0 200 40" style="width:100%; margin-top:14px;"><polyline points="0,28 25,22 50,26 75,18 100,20 125,12 150,14 175,8 200,10" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>
      </div>
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო დრო</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">4.2<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
        <div style="font-size:12px; color:var(--gold);">↓ 0.6წმ სწრაფად</div>
        <svg viewBox="0 0 200 40" style="width:100%; margin-top:14px;"><polyline points="0,10 25,14 50,12 75,18 100,16 125,22 150,24 175,28 200,26" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>
      </div>
      <div style="border:1px solid var(--hair); padding:24px 26px; background:#fff;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">კვირის ვარჯიშები</div>
        <div style="font-family:var(--ge-serif); font-size:44px; margin:8px 0 6px; font-feature-settings:'tnum';">5<span style="font-size:22px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> / 7</span></div>
        <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">ორ დღეს გამოაკელი</div>
        <div style="display:flex; gap:6px; margin-top:14px;">
          <span style="flex:1; height:24px; background:var(--gold);"></span>
          <span style="flex:1; height:24px; background:var(--gold);"></span>
          <span style="flex:1; height:24px; background:var(--gold);"></span>
          <span style="flex:1; height:24px; background:var(--hair);"></span>
          <span style="flex:1; height:24px; background:var(--gold);"></span>
          <span style="flex:1; height:24px; background:var(--hair);"></span>
          <span style="flex:1; height:24px; background:var(--gold);"></span>
        </div>
      </div>
    </div>

    <!-- Continue learning -->
    <div style="margin-top:32px;">
      <div style="display:flex; align-items:baseline; padding-bottom:12px; border-bottom:1px solid var(--hair);">
        <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">გააგრძელე სწავლა</h4>
        <a routerLink="/learn" style="margin-left:auto; font-size:12px; color:var(--gold);">ყველა ხრიკი →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0;">
        <div style="padding:18px 22px 18px 0; border-right:1px solid var(--hair);">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 04</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">გამრავლება 11-ზე</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">დაწყებული · 40% დასრულებული</div>
        </div>
        <div style="padding:18px 22px; border-right:1px solid var(--hair);">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 07</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">15%-ის გამოთვლა თავში</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">ახალი · 3 წუთი</div>
        </div>
        <div style="padding:18px 0 18px 22px;">
          <div style="font-family:var(--ge-serif); font-size:12px; color:var(--gold); font-style:italic;">ხრიკი № 11</div>
          <div style="font-family:var(--ge-serif); font-size:18px; margin:6px 0 4px;">5-ით დამთავრებული კვადრატი</div>
          <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">დაბლოკილი · V დონემდე</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'გიორგი').split(' ')[0];
  }

  initial(): string {
    return (this.firstName().charAt(0) || 'გ').toUpperCase();
  }
}
