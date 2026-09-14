import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column; background:var(--paper);">
      <!-- top hairline row -->
      <div style="display:grid; grid-template-columns:auto 1fr auto; gap:32px; padding:22px 56px; border-bottom:1px solid var(--gold); align-items:center; font-family:var(--ge-serif);">
        <a routerLink="/dashboard" style="font-family:var(--ge); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); text-decoration:none;">← გამოსვლა</a>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-family:var(--ge); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">დონე IV · შეკრება</span>
          <div style="flex:1; height:2px; background:var(--hair); position:relative; max-width:520px;"><div style="width:40%; height:100%; background:var(--gold);"></div></div>
          <span style="font-family:var(--ge); font-size:11px; font-feature-settings:'tnum'; color:color-mix(in srgb, var(--ink) 60%, transparent);">12 / 30</span>
        </div>
        <div style="display:flex; gap:24px; font-feature-settings:'tnum';">
          <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">დრო</div><div style="font-size:20px;">00:43</div></div>
          <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">ქულა</div><div style="font-size:20px; color:var(--gold);">126</div></div>
          <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სერია</div><div style="font-size:20px;">×8</div></div>
        </div>
      </div>

      <!-- question -->
      <div style="flex:1; display:grid; place-items:center; padding:60px 40px;">
        <div style="text-align:center;">
          <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:22px;">— იპოვე ჯამი</div>
          <div style="font-family:var(--ge-serif); font-size:180px; line-height:.95; letter-spacing:-.02em; font-feature-settings:'tnum'; font-weight:400;">47 + 28</div>
          <div style="font-family:var(--ge-serif); font-size:70px; color:color-mix(in srgb, var(--ink) 30%, transparent); margin-top:20px;">= <span style="border-bottom:2px solid var(--gold); padding: 0 48px; color:var(--ink);">75</span></div>
          <div style="margin-top:38px; display:inline-flex; gap:8px; font-family:var(--ge-serif); font-size:26px; flex-wrap:wrap; justify-content:center; max-width:440px;">
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">7</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">8</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">9</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">4</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 10%, #fff);">5</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">6</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">1</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">2</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">3</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff; color:color-mix(in srgb, var(--ink) 40%, transparent);">←</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--hair); background:#fff;">0</span>
            <span style="width:64px; height:64px; display:grid; place-items:center; border:1px solid var(--ink); background:var(--ink); color:var(--paper);">↵</span>
          </div>
          <div style="margin-top:22px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">Enter — დადასტურე · Space — გამოტოვე · Esc — გამოსვლა</div>
        </div>
      </div>

      <!-- footer strip -->
      <div style="padding:18px 56px; border-top:1px solid var(--hair); display:flex; align-items:center; font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent); flex-wrap:wrap; gap:12px;">
        <span style="display:flex; gap:6px; align-items:center;">✓ ბოლო 8 კითხვა სწორია</span>
        <a routerLink="/results" style="margin-left:auto; font-family:var(--ge-serif); font-style:italic; color:var(--gold);">ხრიკი — შეაცვალე 28 → 30, დაუმატე 47, გამოაკლე 2</a>
      </div>
    </div>
  `
})
export class PracticeComponent {}
