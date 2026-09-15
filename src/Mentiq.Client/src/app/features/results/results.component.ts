import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PracticeSessionService } from '../../core/services/practice-session.service';

interface Bar {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (session(); as s) {
      <div style="min-height:100vh; padding:56px 72px; background:var(--paper);">
        <div style="display:flex; justify-content:space-between; align-items:baseline; padding-bottom:16px; border-bottom:1px solid var(--ink); gap:16px; flex-wrap:wrap;">
          <div>
            <div style="font-family:var(--ge-serif); font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ვარჯიშის ანგარიში</div>
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:6px;">{{ dateLine() }}</div>
          </div>
          <div style="text-align:right; font-family:var(--ge-serif); font-size:14px;">
            <span style="color:var(--gold);">{{ s.title }}</span></div>
        </div>

        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:56px; padding: 36px 0;">
          <div>
            <h2 style="font-family:var(--ge-serif); font-size:52px; margin:0 0 16px; line-height:1.04; font-weight:500;">{{ headline() }}<br><em style="font-style:italic; color:var(--gold);">{{ s.correctCount }} სწორი, {{ s.wrongCount }} შეცდომა.</em></h2>
            <p style="font-size:15.5px; line-height:1.6; color:color-mix(in srgb, var(--ink) 72%, transparent); max-width:52ch; margin:0;">{{ narrative() }}</p>
            <div style="display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; align-items:center;">
              <a [routerLink]="'/practice'" [queryParams]="s.resumeTrick ? { trick: s.resumeTrick } : {}" class="btn btn-primary" style="padding:12px 22px;">კიდევ ერთი →</a>
              <a routerLink="/learn" class="btn btn-secondary" style="padding:12px 20px;">ხრიკს ვნახოთ</a>
              <span style="align-self:center; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">+ {{ s.score }} ქულა · 🔥 {{ s.longestStreak }} სერია</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0; border-top:1px solid var(--hair);">
            <div style="padding:22px 24px 22px 0; border-right:1px solid var(--hair); border-bottom:1px solid var(--hair);">
              <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სიზუსტე</div>
              <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">{{ s.accuracy }}%</div>
              <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ s.correctCount }} / {{ s.questions.length }} სწორი</div>
            </div>
            <div style="padding:22px 0 22px 24px; border-bottom:1px solid var(--hair);">
              <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საშუალო დრო</div>
              <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">{{ avg() }}<span style="font-size:24px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
              <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">კითხვაზე</div>
            </div>
            <div style="padding:22px 24px 22px 0; border-right:1px solid var(--hair);">
              <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">საერთო ქულა</div>
              <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; color:var(--gold); font-feature-settings:'tnum';">{{ s.score }}</div>
              <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ s.questions.length }} კითხვა</div>
            </div>
            <div style="padding:22px 0 22px 24px;">
              <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">გრძელი სერია</div>
              <div style="font-family:var(--ge-serif); font-size:52px; margin-top:6px; font-feature-settings:'tnum';">×{{ s.longestStreak }}</div>
              <div style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">ზედიზედ სწორი</div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:56px; padding-top:36px; border-top:1px solid var(--hair);">
          <!-- time distribution -->
          <div>
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:12px;">დროის განაწილება · წამებში</div>
            <svg viewBox="0 0 400 160" style="width:100%;">
              <line x1="0" y1="140" x2="400" y2="140" stroke="var(--hair)"/>
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--hair)" stroke-dasharray="2 3"/>
              <line x1="0" y1="60" x2="400" y2="60" stroke="var(--hair)" stroke-dasharray="2 3"/>
              <text x="0" y="56" font-size="9" fill="#888">8წმ</text>
              <text x="0" y="96" font-size="9" fill="#888">4წმ</text>
              <text x="0" y="136" font-size="9" fill="#888">0</text>
              @for (bar of bars(); track $index) {
                <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h" [attr.fill]="bar.fill" />
              }
              <text x="30" y="155" font-size="8" fill="#888">კითხვა 1</text>
              <text x="360" y="155" font-size="8" fill="#888">{{ s.questions.length }}</text>
            </svg>
            <div style="display:flex; gap:20px; font-size:11.5px; margin-top:8px; color:color-mix(in srgb, var(--ink) 60%, transparent);">
              <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; background:var(--gold);"></span> სწორი</span>
              <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; background:#c9c6c1;"></span> შეცდომა</span>
            </div>
          </div>

          <!-- mistakes review -->
          <div>
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:12px;">შეცდომების გადახედვა</div>
            @if (mistakes().length) {
              <div style="border-top:1px solid var(--hair);">
                @for (m of mistakes(); track m.n) {
                  <div style="display:grid; grid-template-columns:auto 1fr auto auto; gap:16px; padding:14px 0; border-bottom:1px solid var(--hair); align-items:baseline;">
                    <span style="font-family:var(--ge-serif); font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">№ {{ pad(m.n) }}</span>
                    <span style="font-family:var(--ge-serif); font-size:20px;">{{ m.display }}</span>
                    <span style="font-family:var(--ge-serif); font-size:14px; text-decoration:line-through; color:color-mix(in srgb, var(--ink) 50%, transparent);">{{ m.userAnswer ?? '—' }}</span>
                    <span style="font-family:var(--ge-serif); font-size:14px; color:var(--gold);">{{ m.answer }}</span>
                  </div>
                }
              </div>
            } @else {
              <div style="padding:20px 0; font-size:14px; color:color-mix(in srgb, var(--ink) 60%, transparent);">უშეცდომოდ! ყველა პასუხი სწორია. 🎯</div>
            }
          </div>
        </div>
      </div>
    } @else {
      <!-- No session yet -->
      <div style="min-height:100vh; display:grid; place-items:center; background:var(--paper); padding:24px;">
        <div class="card elev-sm" style="max-width:420px; text-align:center; padding:40px; align-items:center;">
          <div style="font-family:var(--ge-serif); font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— ვარჯიშის ანგარიში</div>
          <h2 style="font-family:var(--ge-serif); font-size:30px; margin:12px 0 8px; font-weight:500;">ჯერ სესია არ დაგისრულებია</h2>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 20px;">დაასრულე ერთი ვარჯიში და აქ ნახავ ნამდვილ შედეგს.</p>
          <a routerLink="/practice" class="btn btn-primary" style="padding:12px 24px;">დაიწყე ვარჯიში →</a>
        </div>
      </div>
    }
  `
})
export class ResultsComponent {
  readonly session = inject(PracticeSessionService).session;

  readonly avg = computed(() => (this.session()?.avgSeconds ?? 0).toFixed(1));

  readonly headline = computed(() => {
    const acc = this.session()?.accuracy ?? 0;
    if (acc >= 90) return 'შესანიშნავი სესია.';
    if (acc >= 70) return 'კარგი სესია.';
    if (acc >= 50) return 'საღი დასაწყისი.';
    return 'ივარჯიშე კიდევ.';
  });

  readonly narrative = computed(() => {
    const s = this.session();
    if (!s) return '';
    return `საშუალოდ ${this.avg()} წამი დახარჯე ერთ კითხვაზე, სიზუსტე ${s.accuracy}%. `
      + (s.wrongCount > 0
        ? 'ქვემოთ ნახავ, სად შეგეშალა — გადახედე და შემდეგ ჯერზე უფრო ზუსტი იქნები.'
        : 'ყველა პასუხი სწორია — შესანიშნავი ფოკუსი.');
  });

  readonly bars = computed<Bar[]>(() => {
    const qs = this.session()?.questions ?? [];
    if (!qs.length) return [];
    const left = 30, right = 392, base = 140;
    const step = (right - left) / qs.length;
    const w = Math.max(3, Math.min(step * 0.62, 10));
    return qs.map((q, i) => {
      const h = Math.max(2, Math.min(q.seconds, 8.5) * 10);
      return {
        x: left + i * step,
        y: base - h,
        w,
        h,
        fill: q.correct ? '#b68235' : '#c9c6c1'
      };
    });
  });

  readonly mistakes = computed(() =>
    (this.session()?.questions ?? [])
      .map((q, i) => ({ ...q, n: i + 1 }))
      .filter((q) => !q.correct)
  );

  private readonly kaDays = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
  private readonly kaMonths = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

  readonly dateLine = computed(() => {
    const s = this.session();
    if (!s) return '';
    const d = new Date(s.startedAt);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${this.kaDays[d.getDay()]}, ${d.getDate()} ${this.kaMonths[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
  });

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
