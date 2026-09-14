import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:grid; grid-template-columns: 300px 1fr; gap:0; border:1px solid var(--hair); background:var(--paper);">
      <!-- Index -->
      <div style="border-right:1px solid var(--hair); padding:32px 26px;">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin-bottom:8px;">— ინდექსი</div>
        <h4 style="font-family:var(--ge-serif); font-size:22px; margin:0 0 20px; font-weight:500;">50 ხრიკი</h4>
        <div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:8px;">§ შეკრება</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair);">01 · მრგვალამდე მიდი, დაუმატე</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair);">02 · მარცხნიდან მარჯვნივ</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair);">03 · 9-ის დამატება</div>
        <div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin:20px 0 8px;">§ გამრავლება</div>
        <div style="font-size:13px; border-top:1px solid var(--hair); background:color-mix(in srgb, var(--gold) 6%, transparent); margin: 0 -12px; padding:10px 12px; color:var(--gold); font-weight:600;">04 · გამრავლება 11-ზე</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair);">05 · გამრავლება 5-ზე</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair);">06 · 9-ზე თითებით</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair); color:color-mix(in srgb, var(--ink) 40%, transparent);">🔒 07 · 15%-ის გამოთვლა</div>
        <div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent); margin:20px 0 8px;">§ კვადრატები</div>
        <div style="font-size:13px; padding:8px 0; border-top:1px solid var(--hair); color:color-mix(in srgb, var(--ink) 40%, transparent);">🔒 11 · 5-ით დამთავრებული</div>
      </div>

      <!-- Lesson content -->
      <div style="padding: 48px 56px;">
        <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ხრიკი № 04 · გამრავლების ცხრილი</div>
        <h1 style="font-family:var(--ge-serif); font-size:52px; margin:12px 0 8px; line-height:1.05; font-weight:500;">როგორ გავამრავლოთ 11-ზე თავში</h1>
        <div style="display:flex; gap:20px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); border-bottom:1px solid var(--hair); padding-bottom:20px; flex-wrap:wrap;">
          <span>3 წუთი</span><span>·</span><span>დონე IV-სთვის</span><span>·</span><span>12 400-მა შეისწავლა</span>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:48px; margin-top:32px;">
          <div>
            <p style="font-family:var(--ge-serif); font-size:18px; line-height:1.6; font-style:italic; color:color-mix(in srgb, var(--ink) 78%, transparent); margin:0 0 24px; border-left:2px solid var(--gold); padding-left:20px;">როცა ორნიშნა რიცხვს 11-ზე ამრავლებ, ცოტა რამ უნდა გახსოვდეს — ორი ციფრი გვერდზე გაავრცელე, შუაში კი მათი ჯამი ჩასვი.</p>

            <div style="font-family:var(--ge-serif); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px;">— ნაბიჯი 1</div>
            <p style="font-size:14.5px; line-height:1.65; margin:0 0 22px;">გამოყავი ორნიშნა რიცხვის ორი ციფრი. <em style="font-family:var(--ge-serif);">32 → 3 _ 2</em></p>

            <div style="font-family:var(--ge-serif); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px;">— ნაბიჯი 2</div>
            <p style="font-size:14.5px; line-height:1.65; margin:0 0 22px;">შუაში ჩასვი მათი ჯამი. <em style="font-family:var(--ge-serif);">3 + 2 = 5 → 3 5 2 = 352</em></p>

            <div style="font-family:var(--ge-serif); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px;">— ნაბიჯი 3</div>
            <p style="font-size:14.5px; line-height:1.65; margin:0;">თუ ჯამი 10 ან მეტია, ერთეული შუაში დარჩება, ათეული პირველ ციფრს დაუმატე. <em style="font-family:var(--ge-serif);">87 × 11: 8+7=15 → 8, 5, 7 → +1 → 957</em></p>
          </div>

          <div>
            <div style="border:1px solid var(--hair); background:#fff; padding:32px;">
              <div style="font-family:var(--ge-serif); font-style:italic; color:var(--gold); font-size:13px;">— მაგალითი</div>
              <div style="font-family:var(--ge-serif); font-size:80px; text-align:center; margin:24px 0 12px; letter-spacing:.02em; line-height:1;">32 × 11</div>
              <div style="display:grid; grid-template-columns: 1fr auto 1fr; gap:0; margin-top:24px; border-top:1px solid var(--hair);">
                <div style="padding:16px 12px; border-right:1px solid var(--hair); text-align:center;"><div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">გვერდები</div><div style="font-family:var(--ge-serif); font-size:36px; margin-top:6px;">3 _ 2</div></div>
                <div style="padding:16px 12px; border-right:1px solid var(--hair); text-align:center;"><div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">ჯამი</div><div style="font-family:var(--ge-serif); font-size:36px; color:var(--gold); margin-top:6px;">5</div></div>
                <div style="padding:16px 12px; text-align:center;"><div style="font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">პასუხი</div><div style="font-family:var(--ge-serif); font-size:36px; margin-top:6px;">352</div></div>
              </div>
              <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--hair); font-family:var(--ge-serif); font-style:italic; color:color-mix(in srgb, var(--ink) 65%, transparent); font-size:13px; text-align:center;">კიდევ სცადე: 45 × 11 · 63 × 11 · 87 × 11</div>
            </div>

            <div style="margin-top:20px; padding:20px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 5%, transparent); display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
              <div style="flex:1; min-width:180px;"><div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:var(--gold);">— ხრიკის ვარჯიში</div><div style="font-family:var(--ge-serif); font-size:20px; margin-top:4px;">10 კითხვა · 2 წუთი</div><div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:2px;">ხრიკის დამახსოვრება ვარჯიშით მუშაობს.</div></div>
              <a routerLink="/practice" class="btn btn-primary" style="padding:12px 22px;">ვცადოთ →</a>
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; padding-top:32px; margin-top:32px; border-top:1px solid var(--hair); font-size:13px;">
          <span style="color:color-mix(in srgb, var(--ink) 55%, transparent);">← 03 · 9-ის დამატება</span>
          <span style="margin-left:auto; color:var(--gold);">05 · გამრავლება 5-ზე →</span>
        </div>
      </div>
    </div>
  `
})
export class LearnComponent {}
