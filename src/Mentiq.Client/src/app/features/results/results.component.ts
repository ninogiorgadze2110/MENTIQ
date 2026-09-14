import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; padding:56px 72px; background:var(--paper);">
      <div style="display:flex; justify-content:space-between; align-items:baseline; padding-bottom:16px; border-bottom:1px solid var(--ink); gap:16px; flex-wrap:wrap;">
        <div>
          <div style="font-family:var(--ge-serif); font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ვარჯიშის ანგარიში</div>
          <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">ოთხშაბათი, 15 იანვარი 2026 · 09:14</div>
        </div>
        <div style="text-align:right; font-family:var(--ge-serif); font-size:14px;">Volume IV · <span style="color:var(--gold);">Session № 47</span></div>
      </div>

      <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:56px; padding: 36px 0;">
        <div>
          <h2 style="font-family:var(--ge-serif); font-size:56px; margin:0 0 16px; line-height:1.02; font-weight:500;">კარგი სესია.<br><em style="font-style:italic; color:var(--gold);">27 სწორი, 3 შეცდომა.</em></h2>
          <p style="font-size:15.5px; line-height:1.6; color:color-mix(in srgb, var(--ink) 72%, transparent); max-width:52ch; margin:0;">დღეს ორნიშნა შეკრებაზე იმუშავე, გუშინდელზე ერთი წამით უფრო სწრაფად. სამივე შეცდომა 40-ს გადაცილებულ რიცხვებზე იყო — ხრიკი „მრგვალამდე მიდი, მერე დააკელი" ხვალიდან უფრო ხშირად ურჩევია.</p>
          <div style="display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; align-items:center;">
            <a routerLink="/practice" class="btn btn-primary" style="padding:12px 22px;">კიდევ ერთი →</a>
            <a routerLink="/learn" class="btn btn-secondary" style="padding:12px 20px;">ხრიკს ვნახოთ</a>
            <span style="align-self:center; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">+ 42 XP · 🔥 12-დღიანი სერია</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0; border-top:1px solid var(--hair);">
          <div style="padding:22px 24px 22px 0; border-right:1px solid var(--hair); border-bottom:1px solid var(--hair);">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სიზუსტე</div>
            <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">90%</div>
            <div style="font-size:12px; color:var(--gold);">↑ 3% წინა სესიასთან</div>
          </div>
          <div style="padding:22px 0 22px 24px; border-bottom:1px solid var(--hair);">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო დრო</div>
            <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">4.1<span style="font-size:24px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
            <div style="font-size:12px; color:var(--gold);">↓ 0.8წმ</div>
          </div>
          <div style="padding:22px 24px 22px 0; border-right:1px solid var(--hair);">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საერთო ქულა</div>
            <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; color:var(--gold); font-feature-settings:'tnum';">312</div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">პირადი რეკორდი: 340</div>
          </div>
          <div style="padding:22px 0 22px 24px;">
            <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">გრძელი სერია</div>
            <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">×14</div>
            <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">კითხვები 8 → 21</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:56px; padding-top:36px; border-top:1px solid var(--hair);">
        <div>
          <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:12px;">დროის განაწილება · წამებში</div>
          <svg viewBox="0 0 400 160" style="width:100%;">
            <line x1="0" y1="140" x2="400" y2="140" stroke="var(--hair)"/>
            <line x1="0" y1="100" x2="400" y2="100" stroke="var(--hair)" stroke-dasharray="2 3"/>
            <line x1="0" y1="60" x2="400" y2="60" stroke="var(--hair)" stroke-dasharray="2 3"/>
            <text x="0" y="56" font-size="9" fill="#888">8წმ</text>
            <text x="0" y="96" font-size="9" fill="#888">4წმ</text>
            <text x="0" y="136" font-size="9" fill="#888">0</text>
            <g>
              <rect x="30" y="85" width="8" height="55" fill="#b68235"/>
              <rect x="42" y="95" width="8" height="45" fill="#b68235"/>
              <rect x="54" y="80" width="8" height="60" fill="#b68235"/>
              <rect x="66" y="90" width="8" height="50" fill="#b68235"/>
              <rect x="78" y="70" width="8" height="70" fill="#b68235"/>
              <rect x="90" y="88" width="8" height="52" fill="#b68235"/>
              <rect x="102" y="82" width="8" height="58" fill="#b68235"/>
              <rect x="114" y="60" width="8" height="80" fill="#c9c6c1"/>
              <rect x="126" y="92" width="8" height="48" fill="#b68235"/>
              <rect x="138" y="86" width="8" height="54" fill="#b68235"/>
              <rect x="150" y="88" width="8" height="52" fill="#b68235"/>
              <rect x="162" y="94" width="8" height="46" fill="#b68235"/>
              <rect x="174" y="90" width="8" height="50" fill="#b68235"/>
              <rect x="186" y="82" width="8" height="58" fill="#b68235"/>
              <rect x="198" y="90" width="8" height="50" fill="#b68235"/>
              <rect x="210" y="88" width="8" height="52" fill="#b68235"/>
              <rect x="222" y="86" width="8" height="54" fill="#b68235"/>
              <rect x="234" y="94" width="8" height="46" fill="#b68235"/>
              <rect x="246" y="86" width="8" height="54" fill="#b68235"/>
              <rect x="258" y="66" width="8" height="74" fill="#c9c6c1"/>
              <rect x="270" y="88" width="8" height="52" fill="#b68235"/>
              <rect x="282" y="92" width="8" height="48" fill="#b68235"/>
              <rect x="294" y="82" width="8" height="58" fill="#b68235"/>
              <rect x="306" y="88" width="8" height="52" fill="#b68235"/>
              <rect x="318" y="55" width="8" height="85" fill="#c9c6c1"/>
              <rect x="330" y="90" width="8" height="50" fill="#b68235"/>
              <rect x="342" y="86" width="8" height="54" fill="#b68235"/>
              <rect x="354" y="90" width="8" height="50" fill="#b68235"/>
              <rect x="366" y="94" width="8" height="46" fill="#b68235"/>
              <rect x="378" y="88" width="8" height="52" fill="#b68235"/>
            </g>
            <text x="30" y="155" font-size="8" fill="#888">კითხვა 1</text>
            <text x="360" y="155" font-size="8" fill="#888">30</text>
          </svg>
          <div style="display:flex; gap:20px; font-size:11.5px; margin-top:8px; color:color-mix(in srgb, var(--ink) 60%, transparent);">
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; background:var(--gold);"></span> სწორი</span>
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; background:#c9c6c1;"></span> შეცდომა</span>
          </div>
        </div>

        <div>
          <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:12px;">შეცდომების გადახედვა</div>
          <div style="border-top:1px solid var(--hair);">
            <div style="display:grid; grid-template-columns:auto 1fr auto auto; gap:16px; padding:14px 0; border-bottom:1px solid var(--hair); align-items:baseline;">
              <span style="font-family:var(--ge-serif); font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">№ 08</span>
              <span style="font-family:var(--ge-serif); font-size:20px;">46 + 37</span>
              <span style="font-family:var(--ge-serif); font-size:14px; text-decoration:line-through; color:color-mix(in srgb, var(--ink) 50%, transparent);">82</span>
              <span style="font-family:var(--ge-serif); font-size:14px; color:var(--gold);">83</span>
            </div>
            <div style="display:grid; grid-template-columns:auto 1fr auto auto; gap:16px; padding:14px 0; border-bottom:1px solid var(--hair); align-items:baseline;">
              <span style="font-family:var(--ge-serif); font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">№ 20</span>
              <span style="font-family:var(--ge-serif); font-size:20px;">58 + 26</span>
              <span style="font-family:var(--ge-serif); font-size:14px; text-decoration:line-through; color:color-mix(in srgb, var(--ink) 50%, transparent);">74</span>
              <span style="font-family:var(--ge-serif); font-size:14px; color:var(--gold);">84</span>
            </div>
            <div style="display:grid; grid-template-columns:auto 1fr auto auto; gap:16px; padding:14px 0; border-bottom:1px solid var(--hair); align-items:baseline;">
              <span style="font-family:var(--ge-serif); font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">№ 25</span>
              <span style="font-family:var(--ge-serif); font-size:20px;">49 + 44</span>
              <span style="font-family:var(--ge-serif); font-size:14px; text-decoration:line-through; color:color-mix(in srgb, var(--ink) 50%, transparent);">83</span>
              <span style="font-family:var(--ge-serif); font-size:14px; color:var(--gold);">93</span>
            </div>
          </div>
          <div style="margin-top:20px; padding:16px 18px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 5%, transparent); font-size:13px; line-height:1.55;">
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:var(--gold);">— რჩევა</div>
            <div style="margin-top:6px;">როცა ერთი რიცხვი ბოლოვდება 6-7-8-9-ზე, ჯერ დაამრგვალე 10-მდე, მერე გამოაკელი განსხვავება. მაგ. 46 + 37 = <em style="font-family:var(--ge-serif);">50 + 37 − 4 = 83</em>.</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResultsComponent {}
