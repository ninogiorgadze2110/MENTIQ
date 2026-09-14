import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-levels',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">Volume IV</div>
        <h2>დონეების რუკა</h2>
      </div>
      <div class="spacer"></div>
      <div class="lang"><span class="on">KA</span><span>EN</span></div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 340px; gap:48px;">
      <!-- roadmap -->
      <div style="position:relative; padding: 12px 0 24px 100px;">
        <div style="position:absolute; left:52px; top:20px; bottom:20px; width:1px; background:var(--hair);"></div>

        <div style="position:relative; padding:22px 0; border-bottom:1px solid var(--hair);">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--gold); color:#fff; display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">I</div>
          <div style="display:flex; align-items:baseline; gap:14px;">
            <h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">დაწყებითი შეკრება</h3>
            <span style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold);">✓ დასრულებული</span>
          </div>
          <p style="font-size:13px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin:6px 0 12px; max-width:60ch;">ერთნიშნა რიცხვების შეკრება, 20-მდე. საბაზისო სისწრაფე.</p>
          <div style="display:flex; gap:24px; font-size:12px; color:color-mix(in srgb, var(--ink) 65%, transparent);">
            <span>30 კითხვა</span><span>ვარსკვლავები · ★★★</span><span>საუკეთესო: 96%</span>
          </div>
        </div>

        <div style="position:relative; padding:22px 0; border-bottom:1px solid var(--hair);">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--gold); color:#fff; display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">II</div>
          <div style="display:flex; align-items:baseline; gap:14px;"><h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">დაწყებითი გამოკლება</h3><span style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold);">✓ დასრულებული</span></div>
          <p style="font-size:13px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin:6px 0 12px;">20-მდე გამოკლება. სისწრაფე + სიზუსტე.</p>
          <div style="display:flex; gap:24px; font-size:12px; color:color-mix(in srgb, var(--ink) 65%, transparent);"><span>30 კითხვა</span><span>ვარსკვლავები · ★★☆</span><span>საუკეთესო: 84%</span></div>
        </div>

        <div style="position:relative; padding:22px 0; border-bottom:1px solid var(--hair);">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--gold); color:#fff; display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">III</div>
          <div style="display:flex; align-items:baseline; gap:14px;"><h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">შერეული ოპერაციები</h3><span style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold);">✓ დასრულებული</span></div>
          <p style="font-size:13px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin:6px 0 12px;">შეკრება და გამოკლება ერთ სესიაში.</p>
          <div style="display:flex; gap:24px; font-size:12px; color:color-mix(in srgb, var(--ink) 65%, transparent);"><span>40 კითხვა</span><span>ვარსკვლავები · ★★★</span><span>საუკეთესო: 91%</span></div>
        </div>

        <div style="position:relative; padding:26px 26px; background:color-mix(in srgb, var(--gold) 5%, transparent); border:1px solid var(--gold); margin:6px 0;">
          <div style="position:absolute; left:-96px; top:24px; width:44px; height:44px; border-radius:50%; background:var(--paper); border:1.5px solid var(--gold); color:var(--gold); display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">IV</div>
          <div style="display:flex; align-items:baseline; gap:14px;"><h3 style="font-family:var(--ge-serif); margin:0; font-size:24px; font-weight:500;">ორნიშნა შეკრება</h3><span style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold);">— მიმდინარე</span></div>
          <p style="font-size:13.5px; color:color-mix(in srgb, var(--ink) 70%, transparent); margin:8px 0 16px; max-width:60ch;">10–99 დიაპაზონში შეკრება. ხრიკი: მრგვალამდე მიდი, მერე შეავსე.</p>
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <div style="flex:1; max-width:280px; height:3px; background:var(--hair);"><div style="width:62%; height:100%; background:var(--gold);"></div></div>
            <span style="font-size:12px; font-feature-settings:'tnum'; color:color-mix(in srgb, var(--ink) 65%, transparent);">312 / 500 XP</span>
            <a routerLink="/practice" class="btn btn-primary" style="padding:9px 18px; margin-left:auto;">გააგრძელე →</a>
          </div>
        </div>

        <div style="position:relative; padding:22px 0; border-bottom:1px solid var(--hair); opacity:.6;">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--paper); border:1px dashed var(--hair); color:color-mix(in srgb, var(--ink) 40%, transparent); display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">V</div>
          <div style="display:flex; align-items:baseline; gap:14px;"><h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">ორნიშნა გამოკლება</h3><span style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 50%, transparent);">🔒 დაბლოკილი</span></div>
          <p style="font-size:13px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin:6px 0 0;">გახსნის შემდეგ: სესხების ტექნიკა და უარყოფითი განსხვავებები.</p>
        </div>

        <div style="position:relative; padding:22px 0; border-bottom:1px solid var(--hair); opacity:.5;">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--paper); border:1px dashed var(--hair); color:color-mix(in srgb, var(--ink) 40%, transparent); display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">VI</div>
          <h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">გამრავლების ცხრილი 5-მდე</h3>
        </div>
        <div style="position:relative; padding:22px 0; opacity:.4;">
          <div style="position:absolute; left:-70px; top:22px; width:44px; height:44px; border-radius:50%; background:var(--paper); border:1px dashed var(--hair); color:color-mix(in srgb, var(--ink) 40%, transparent); display:grid; place-items:center; font-family:var(--ge-serif); font-size:20px;">VII</div>
          <h3 style="font-family:var(--ge-serif); margin:0; font-size:22px; font-weight:500;">გამრავლების ცხრილი 10-მდე</h3>
        </div>
      </div>

      <!-- side legend / stats -->
      <aside style="border:1px solid var(--hair); background:#fff; padding:24px; height:fit-content;">
        <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold);">— ტომი IV</div>
        <div style="font-family:var(--ge-serif); font-size:24px; margin:6px 0 14px;">შუალედური</div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid var(--hair); font-size:13px;"><span>დასრულებული</span><span style="font-family:var(--ge-serif); font-feature-settings:'tnum';">3 / 12</span></div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid var(--hair); font-size:13px;"><span>საერთო ვარსკვლავები</span><span style="font-family:var(--ge-serif); color:var(--gold);">★ 8 / 21</span></div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid var(--hair); font-size:13px;"><span>საერთო XP</span><span style="font-family:var(--ge-serif); font-feature-settings:'tnum';">1 812</span></div>
        <div style="margin-top:20px; padding:16px; background:color-mix(in srgb, var(--gold) 6%, transparent); font-size:12.5px; line-height:1.55;">
          <div style="font-family:var(--ge-serif); font-style:italic; color:var(--gold); font-size:12px;">შემდეგი ჯილდო</div>
          <div style="font-family:var(--ge-serif); font-size:16px; margin-top:4px;">„ცხრილის ოსტატი"</div>
          <div style="color:color-mix(in srgb, var(--ink) 60%, transparent);">დონე VII-ის დასრულებისას</div>
        </div>
      </aside>
    </div>
  `
})
export class LevelsComponent {}
