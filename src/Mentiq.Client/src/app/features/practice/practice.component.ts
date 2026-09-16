import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnsweredQuestion, PracticeSessionService } from '../../core/services/practice-session.service';
import { ProgressService } from '../../core/services/progress.service';
import { CompetitionService } from '../../core/services/competition.service';
import { DailyChallengeService } from '../../core/services/daily-challenge.service';
import { AuthService } from '../../core/services/auth.service';

type OpKey = 'add' | 'sub' | 'mul' | 'div' | 'cmp' | 'miss' | 'chain';
type Mode = 'count' | 'time';

interface OpDef { symbol: string; name: string; sub: string; }

interface Question {
  before: string;
  after: string;
  display: string;
  answer: number | string;
  mode: 'num' | 'choice';
  choices?: string[];
}

interface GradeDef {
  sub: string;
  ops: OpKey[];
  range: Partial<Record<OpKey, [number, number]>>;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '←', '0', '↵'];

const OPS: Record<OpKey, OpDef> = {
  add: { symbol: '+', name: 'შეკრება', sub: 'რიცხვების ჯამი' },
  sub: { symbol: '−', name: 'გამოკლება', sub: 'სხვაობა, დადებითი შედეგით' },
  mul: { symbol: '×', name: 'გამრავლება', sub: 'ცხრილი' },
  div: { symbol: '÷', name: 'გაყოფა', sub: 'ზუსტი განაყოფი' },
  cmp: { symbol: '>', name: 'შედარება', sub: 'ჩასვი > , < ან =' },
  miss: { symbol: '?', name: 'გამოტოვებული', sub: 'იპოვე დაკარგული რიცხვი' },
  chain: { symbol: '∑', name: 'ჯაჭვი', sub: 'რამდენიმე მოქმედება ერთად' }
};

const GRADES: Record<number, GradeDef> = {
  1: { sub: '20-მდე', ops: ['add', 'sub', 'cmp', 'miss'], range: { add: [1, 10], sub: [1, 20], cmp: [1, 20], miss: [1, 20] } },
  2: { sub: '100-მდე', ops: ['add', 'sub', 'cmp', 'miss', 'mul'], range: { add: [10, 50], sub: [10, 100], cmp: [1, 100], miss: [1, 50], mul: [2, 5] } },
  3: { sub: 'ტაბულა', ops: ['mul', 'div', 'add', 'sub', 'miss', 'chain'], range: { mul: [2, 9], div: [2, 9], add: [20, 100], sub: [20, 100], miss: [2, 50], chain: [2, 12] } },
  4: { sub: 'ყველა', ops: ['mul', 'div', 'chain', 'miss', 'cmp'], range: { mul: [3, 12], div: [2, 12], chain: [3, 20], miss: [5, 100], cmp: [10, 200] } },
  5: { sub: 'შერეული', ops: ['chain', 'div', 'mul', 'miss', 'cmp'], range: { chain: [5, 30], div: [2, 15], mul: [6, 15], miss: [10, 200], cmp: [20, 500] } },
  6: { sub: 'რთული', ops: ['chain', 'div', 'mul', 'miss', 'cmp'], range: { chain: [10, 50], div: [3, 20], mul: [8, 20], miss: [20, 500], cmp: [50, 999] } }
};

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface TrickDef { name: string; prompt: string; hint: string; count: number; gen: () => Question; }

const numQ = (before: string, display: string, answer: number, after = ''): Question =>
  ({ before, after, display, answer, mode: 'num' });

const TRICKS: Record<string, TrickDef> = {
  mul11: {
    name: 'გამრავლება 11-ზე', prompt: 'გაამრავლე 11-ზე', hint: 'ხრიკი — ორი ციფრი გვერდზე, შუაში მათი ჯამი', count: 10,
    gen: () => { const a = rnd(10, 99); return numQ(`${a} × 11 = `, `${a} × 11`, a * 11); }
  },
  mul5: {
    name: 'გამრავლება 5-ზე', prompt: 'გაამრავლე 5-ზე', hint: 'ხრიკი — გაყავი 2-ზე, მერე გაამრავლე 10-ზე', count: 10,
    gen: () => { const a = rnd(10, 99); return numQ(`${a} × 5 = `, `${a} × 5`, a * 5); }
  },
  add9: {
    name: '9-ის დამატება', prompt: 'დაუმატე', hint: 'ხრიკი — დაუმატე 10, მერე გამოაკელი 1', count: 10,
    gen: () => { const a = rnd(10, 99); return numQ(`${a} + 9 = `, `${a} + 9`, a + 9); }
  },
  pct10: {
    name: 'პროცენტები — 10%', prompt: 'იპოვე 10%', hint: 'ხრიკი — გადაწიე მძიმე ერთი ციფრით მარცხნივ', count: 10,
    gen: () => { const a = rnd(2, 50) * 10; return numQ(`${a}-ის 10% = `, `${a}-ის 10%`, a / 10); }
  },
  sq5: {
    name: 'კვადრატი (5-ით)', prompt: 'იპოვე კვადრატი', hint: 'ხრიკი — n × (n+1), ბოლოში მიაწერე 25', count: 9,
    gen: () => { const t = rnd(1, 9); const n = t * 10 + 5; return numQ(`${n}² = `, `${n}²`, n * n); }
  }
};

const fmt = (sec: number) =>
  `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .key {
        width: 64px; height: 64px; display: grid; place-items: center;
        border: 1px solid var(--hair); background: #fff; font-family: var(--ge-serif);
        font-size: 26px; color: var(--ink); cursor: pointer; user-select: none;
        transition: background .1s ease, border-color .1s ease;
      }
      .key:hover:not(:disabled) { border-color: var(--gold); }
      .key:active:not(:disabled), .key.hit { background: color-mix(in srgb, var(--gold) 14%, #fff); border-color: var(--gold); }
      .key.enter { background: var(--ink); color: var(--paper); border-color: var(--ink); }
      .key.enter:hover:not(:disabled) { background: var(--deep); }
      .key.back { color: color-mix(in srgb, var(--ink) 40%, transparent); }
      .key.choice { width: auto; min-width: 100px; padding: 0 26px; font-size: 32px; }
      .key:disabled { opacity: .45; cursor: default; }
      @media (max-width: 560px) { .key { width: 52px; height: 52px; font-size: 22px; } }

      .expr {
        font-family: var(--ge-serif); font-weight: 400; line-height: 1;
        letter-spacing: -.02em; font-feature-settings: 'tnum';
        /* Keep the whole equation on a single line so the answer never
           reflows/jumps down as digits are typed. Scales with the viewport. */
        display: flex; flex-wrap: nowrap; white-space: nowrap;
        justify-content: center; align-items: baseline; max-width: 100%;
        font-size: clamp(38px, 8vw, 104px);
      }
      .expr > span { white-space: nowrap; }
      .expr .slot {
        color: var(--ink); border-bottom: 3px solid var(--gold);
        padding: 0 .28em; min-width: 1.6em; display: inline-block; text-align: center;
      }

      .op-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      @media (max-width: 620px) { .op-grid { grid-template-columns: 1fr; } }
      .op-card {
        display: flex; align-items: center; gap: 18px; padding: 18px 22px;
        border: 1px solid var(--hair); background: #fff; cursor: pointer; text-align: left;
        transition: border-color .12s ease, background .12s ease;
      }
      .op-card:hover { border-color: var(--gold); }
      .op-card.on { border-color: var(--gold); background: color-mix(in srgb, var(--gold) 6%, transparent); }
      .op-sym { font-family: var(--ge-serif); font-size: 40px; line-height: 1; color: var(--gold); width: 44px; text-align: center; }

      .grades { display: flex; gap: 8px; flex-wrap: wrap; }
      .grade {
        min-width: 84px; padding: 10px 12px; text-align: center; cursor: pointer;
        border: 1px solid var(--hair); background: #fff; transition: all .12s ease;
      }
      .grade:hover { border-color: var(--gold); }
      .grade.on { background: var(--ink); border-color: var(--ink); color: var(--paper); }
      .grade .g-num { font-family: var(--ge-serif); font-size: 22px; line-height: 1; }
      .grade .g-sub { font-size: 10.5px; color: color-mix(in srgb, var(--ink) 55%, transparent); margin-top: 3px; }
      .grade.on .g-sub { color: color-mix(in srgb, var(--paper) 75%, transparent); }

      .seg { display: inline-flex; border: 1px solid var(--hair); overflow: hidden; }
      .seg button {
        border: 0; background: transparent; font: inherit; font-family: var(--ge-serif);
        padding: 8px 18px; cursor: pointer; color: var(--ink); font-feature-settings: 'tnum';
      }
      .seg button + button { border-left: 1px solid var(--hair); }
      .seg button.on { background: var(--ink); color: var(--paper); }
    `
  ],
  template: `
    @if (phase() === 'select') {
      <!-- ══════════ 04a · ვარჯიშის არჩევა ══════════ -->
      <div style="min-height:100vh; display:flex; flex-direction:column; background:var(--paper);">
        <div style="display:flex; align-items:center; padding:22px 56px; border-bottom:1px solid var(--hair); gap:16px;">
          <a routerLink="/dashboard" style="font-family:var(--ge); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); text-decoration:none;">← მთავარი</a>
        </div>

        <div style="flex:1; display:grid; place-items:center; padding:40px 24px;">
          <div style="width:100%; max-width:760px;">
            <div style="text-align:center; margin-bottom:28px;">
              <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold); margin-bottom:12px;">— დღის ვარჯიში</div>
              <h1 style="font-family:var(--ge-serif); font-size:50px; margin:0 0 8px; font-weight:500; line-height:1.02;">აირჩიე ვარჯიში</h1>
              <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">სირთულე, ამოცანის ტიპი და რაოდენობა (ან დრო). დაიწყე და დაითვალე.</p>
            </div>

            <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:10px;">სირთულე</div>
            <div class="grades" style="margin-bottom:26px;">
              @for (g of gradeKeys; track g) {
                <button type="button" class="grade" [class.on]="selectedGrade() === g" (click)="selectGrade(g)">
                  <div class="g-num">{{ g }}</div>
                  <!-- <div class="g-sub">{{ grades[g].sub }}</div> -->
                </button>
              }
            </div>

            <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:10px;">ამოცანის ტიპი</div>
            <div class="op-grid">
              @for (op of availableOps(); track op.key) {
                <button type="button" class="op-card" [class.on]="selectedOp() === op.key" (click)="selectedOp.set(op.key)">
                  <span class="op-sym">{{ op.symbol }}</span>
                  <span>
                    <span style="font-family:var(--ge-serif); font-size:20px; display:block;">{{ op.name }}</span>
                    <span style="font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ op.sub }}</span>
                  </span>
                </button>
              }
            </div>

            <div style="display:flex; align-items:center; gap:16px; margin-top:26px; flex-wrap:wrap;">
              <span style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">რეჟიმი</span>
              <div class="seg">
                <button type="button" [class.on]="mode() === 'count'" (click)="mode.set('count')">რაოდენობით</button>
                <button type="button" [class.on]="mode() === 'time'" (click)="mode.set('time')">დროზე</button>
              </div>

              @if (mode() === 'count') {
                <span style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">კითხვები</span>
                <div class="seg">
                  @for (n of counts; track n) {
                    <button type="button" [class.on]="count() === n" (click)="count.set(n)">{{ n }}</button>
                  }
                </div>
              } @else {
                <span style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">დრო</span>
                <div class="seg">
                  @for (t of times; track t.sec) {
                    <button type="button" [class.on]="timeLimit() === t.sec" (click)="timeLimit.set(t.sec)">{{ t.label }}</button>
                  }
                </div>
              }
            </div>

            <div style="display:flex; margin-top:24px; align-items:center;">
              <span style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
                {{ mode() === 'count' ? 'ამოხსენი ' + count() + ' მაგალითი შენი ტემპით.' : 'ერთ ' + timeLabel() + '-ში ამოხსენი რაც შეიძლება მეტი.' }}
              </span>
              <button type="button" class="btn btn-primary" style="margin-left:auto; padding:14px 28px; font-size:15px;" (click)="start()">დაიწყე ვარჯიში →</button>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <!-- ══════════ 04 · ვარჯიში (+ 04b feedback) ══════════ -->
      <div style="min-height:100vh; display:flex; flex-direction:column; background:var(--paper);">
        <div style="display:grid; grid-template-columns:auto 1fr auto; gap:32px; padding:22px 56px; border-bottom:1px solid var(--gold); align-items:center; font-family:var(--ge-serif);">
          <a [routerLink]="exitTarget()" style="font-family:var(--ge); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); text-decoration:none;">← გამოსვლა</a>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-family:var(--ge); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">{{ levelLabel() }}{{ opName() }}</span>
            <div style="flex:1; height:2px; background:var(--hair); position:relative; max-width:520px;"><div [style.width.%]="progressPct()" style="height:100%; background:var(--gold); transition:width .2s ease;"></div></div>
            <span style="font-family:var(--ge); font-size:11px; font-feature-settings:'tnum'; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ numerator() }}</span>
          </div>
          <div style="display:flex; gap:24px; font-feature-settings:'tnum';">
            <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">დრო</div><div style="font-size:20px;" [style.color]="clockColor()">{{ clock() }}</div></div>
            <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">ქულა</div><div style="font-size:20px; color:var(--gold);">{{ score() }}</div></div>
            <div style="text-align:right;"><div style="font-family:var(--ge); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">სერია</div><div style="font-size:20px;">×{{ streak() }}</div></div>
          </div>
        </div>

        <div style="flex:1; display:grid; place-items:center; padding:48px 40px;">
          <div style="text-align:center; max-width:760px;">
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:22px;">— {{ prompt() }}</div>

            <div class="expr">
              <span>{{ q().before }}</span>
              <span class="slot" [style.color]="answerColor()">{{ slotText() }}</span>
              <span>{{ q().after }}</span>
            </div>

            @if (awaitingNext()) {
              <div [style.border]="'1px solid ' + fbColor()" [style.background]="fbBg()" style="margin-top:26px; display:inline-flex; flex-direction:column; align-items:center; gap:6px; padding:16px 28px;">
                @if (feedback() === 'correct') {
                  <div style="font-family:var(--ge-serif); font-size:22px; color:var(--gold);">✓ სწორია</div>
                  <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 65%, transparent);">+{{ lastGain() }} ქულა · სერია ×{{ streak() }}</div>
                } @else {
                  <div style="font-family:var(--ge-serif); font-size:22px; color:#b22;">✗ არასწორი <span style="color:color-mix(in srgb, var(--ink) 45%, transparent);">(+4 წმ)</span></div>
                  <div style="font-size:13px;">სწორი პასუხი: <span style="font-family:var(--ge-serif); color:var(--gold); font-size:18px;">{{ q().answer }}</span></div>
                }
              </div>
            }

            <div style="margin-top:34px;">
              @if (q().mode === 'choice') {
                <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                  @for (c of q().choices; track c) {
                    <button type="button" class="key choice" [class.hit]="hit() === c" [disabled]="awaitingNext()" (click)="choose(c)">{{ c }}</button>
                  }
                </div>
              } @else {
                <div class="keypad">
                  @for (k of keys; track k) {
                    <button type="button" class="key" [class.enter]="k === '↵'" [class.back]="k === '←'" [class.hit]="hit() === k" [disabled]="awaitingNext() && k !== '↵'" (click)="press(k)">{{ k }}</button>
                  }
                </div>
              }
            </div>
            <div style="margin-top:20px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
              {{ awaitingNext() ? 'Enter / Space — შემდეგი' : (q().mode === 'choice' ? 'აირჩიე > , < ან = · Space — გამოტოვე' : 'Enter — დადასტურე · Space — გამოტოვე · Esc — გამოსვლა') }}
            </div>
          </div>
        </div>

        <div style="padding:18px 56px; border-top:1px solid var(--hair); display:flex; align-items:center; font-size:12px; color:color-mix(in srgb, var(--ink) 60%, transparent); flex-wrap:wrap; gap:12px;">
          <span style="display:flex; gap:6px; align-items:center;">✓ სწორი: {{ correctCount() }} · ✗ შეცდომა: {{ wrongCount() }}</span>
          <span style="margin-left:auto; font-family:var(--ge-serif); font-style:italic; color:var(--gold);">{{ trick() }}</span>
        </div>
      </div>
    }
  `
})
export class PracticeComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly sessions = inject(PracticeSessionService);
  private readonly progress = inject(ProgressService);
  private readonly competition = inject(CompetitionService);
  private readonly daily = inject(DailyChallengeService);
  private readonly auth = inject(AuthService);
  private timer: ReturnType<typeof setInterval> | null = null;

  private questionStart = 0;
  private maxStreak = 0;
  private answered: AnsweredQuestion[] = [];
  private startedAt = new Date();

  readonly keys = KEYS;
  readonly grades = GRADES;
  readonly gradeKeys = Object.keys(GRADES).map(Number);
  readonly counts = [10, 20, 30];
  readonly times = [
    { sec: 60, label: '1 წთ' },
    { sec: 120, label: '2 წთ' },
    { sec: 180, label: '3 წთ' }
  ];

  readonly phase = signal<'select' | 'play'>('select');
  readonly selectedGrade = signal(4);
  readonly selectedOp = signal<OpKey>('mul');
  readonly mode = signal<Mode>('count');
  readonly count = signal(30);
  readonly timeLimit = signal(60);
  readonly trickKey = signal<string | null>(null);
  readonly fromLearn = signal(false);
  readonly mixMode = signal(false);
  readonly competitionId = signal<string | null>(null);
  readonly dailyMode = signal(false);

  readonly currentQ = signal<Question>({ before: '', after: '', display: '', answer: 0, mode: 'num' });
  readonly index = signal(0);
  readonly entry = signal('');
  readonly score = signal(0);
  readonly streak = signal(0);
  readonly correctCount = signal(0);
  readonly wrongCount = signal(0);
  readonly elapsed = signal(0);
  readonly hit = signal<string | null>(null);
  readonly feedback = signal<'none' | 'correct' | 'wrong'>('none');
  readonly awaitingNext = signal(false);
  readonly lastGain = signal(0);
  readonly done = signal(false);

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const trick = params.get('trick');
    const op = params.get('op') as OpKey | null;
    const gradeForOp: Record<OpKey, number> = {
      add: 2, sub: 2, mul: 3, div: 3, cmp: 4, miss: 3, chain: 3
    };

    if (params.get('daily') != null) {
      // Daily Challenge: a 60-second mixed drill for the user's own grade.
      const grade = this.auth.user()?.grade ?? 4;
      this.dailyMode.set(true);
      this.mixMode.set(true);
      this.selectedGrade.set(Math.min(12, Math.max(1, grade)));
      this.mode.set('time');
      this.timeLimit.set(60);
      this.start();
    } else if (trick && TRICKS[trick]) {
      this.trickKey.set(trick);
      this.fromLearn.set(true);
      this.mode.set('count');
      this.count.set(TRICKS[trick].count);
      this.start();
    } else if (op && op in gradeForOp) {
      // Launch a lesson-specific operation drill straight away (skip the picker).
      this.fromLearn.set(true);
      this.selectedOp.set(op);
      this.selectedGrade.set(gradeForOp[op]);
      this.mode.set('count');
      this.count.set(10);
      this.start();
    } else if (params.get('mix') != null) {
      // Competition / mixed-operations drill for a grade (skip the picker).
      const grade = Number(params.get('grade')) || 4;
      const time = Number(params.get('time'));
      this.mixMode.set(true);
      this.competitionId.set(params.get('competition'));
      this.selectedGrade.set(Math.min(12, Math.max(1, grade)));
      if (time > 0) {
        this.mode.set('time');
        this.timeLimit.set(time);
      } else {
        this.mode.set('count');
        this.count.set(Number(params.get('count')) || 20);
      }
      this.start();
    }
  }

  readonly availableOps = computed(() =>
    GRADES[this.selectedGrade()].ops.map((key) => ({ key, ...OPS[key] }))
  );
  readonly q = computed(() => this.currentQ());
  readonly opName = computed(() => {
    if (this.dailyMode()) return 'დღის ამოცანა';
    if (this.mixMode()) return 'შერეული';
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].name;
    return OPS[this.selectedOp()].name;
  });
  readonly levelLabel = computed(() => (this.trickKey() ? '' : `სირთულე ${this.selectedGrade()} · `));
  readonly exitTarget = computed(() =>
    this.competitionId() ? '/competition' : this.fromLearn() ? '/learn' : '/dashboard'
  );
  readonly remaining = computed(() => Math.max(0, this.timeLimit() - this.elapsed()));
  readonly clock = computed(() => (this.mode() === 'time' ? fmt(this.remaining()) : fmt(this.elapsed())));
  readonly clockColor = computed(() => (this.mode() === 'time' && this.remaining() <= 10 ? '#b22' : 'var(--ink)'));
  readonly progressPct = computed(() =>
    this.mode() === 'time'
      ? Math.min(100, (this.elapsed() / this.timeLimit()) * 100)
      : (this.index() / this.count()) * 100
  );
  readonly numerator = computed(() =>
    this.mode() === 'time' ? `${this.answered.length} ✓` : `${this.index() + 1} / ${this.count()}`
  );
  readonly timeLabel = computed(() => this.times.find((t) => t.sec === this.timeLimit())?.label ?? '');
  readonly slotText = computed(() => {
    if (this.currentQ().mode === 'choice') return this.entry() || ' ';
    return this.entry() || (this.awaitingNext() ? '' : '_');
  });
  readonly answerColor = computed(() =>
    this.feedback() === 'correct' ? 'var(--gold)' : this.feedback() === 'wrong' ? '#b22' : 'var(--ink)'
  );
  readonly fbColor = computed(() => (this.feedback() === 'correct' ? 'var(--gold)' : '#b22'));
  readonly fbBg = computed(() =>
    this.feedback() === 'correct'
      ? 'color-mix(in srgb, var(--gold) 6%, transparent)'
      : 'color-mix(in srgb, #b22 6%, transparent)'
  );
  readonly prompt = computed(() => {
    if (this.mixMode()) return 'იპოვე პასუხი';
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].prompt;
    switch (this.selectedOp()) {
      case 'add': return 'იპოვე ჯამი';
      case 'sub': return 'იპოვე სხვაობა';
      case 'mul': return 'იპოვე ნამრავლი';
      case 'div': return 'იპოვე განაყოფი';
      case 'cmp': return 'შეადარე რიცხვები';
      case 'miss': return 'იპოვე დაკარგული რიცხვი';
      default: return 'გამოთვალე ჯაჭვი';
    }
  });
  readonly trick = computed(() => {
    if (this.dailyMode()) return 'დღის ამოცანა — შერეული, 1 წუთი';
    if (this.mixMode()) return 'შეჯიბრი — ყველა ტიპი შერეულად';
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].hint;
    switch (this.selectedOp()) {
      case 'add': return 'ხრიკი — მრგვალამდე მიდი, მერე დააკელი';
      case 'sub': return 'ხრიკი — ჯერ ათეულები, მერე ერთეულები';
      case 'mul': return 'ხრიკი — დაშალე უფრო მარტივ ნაბიჯებად';
      case 'div': return 'ხრიკი — იფიქრე „რამდენჯერ ჯდება"';
      case 'cmp': return 'ხრიკი — შეადარე ჯერ ათეულები';
      case 'miss': return 'ხრიკი — გადაიტანე მოქმედება მეორე მხარეს';
      default: return 'ხრიკი — მარცხნიდან მარჯვნივ, თანმიმდევრობით';
    }
  });

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  selectGrade(g: number): void {
    this.selectedGrade.set(g);
    if (!GRADES[g].ops.includes(this.selectedOp())) {
      this.selectedOp.set(GRADES[g].ops[0]);
    }
  }

  start(): void {
    this.index.set(0);
    this.entry.set('');
    this.score.set(0);
    this.streak.set(0);
    this.correctCount.set(0);
    this.wrongCount.set(0);
    this.elapsed.set(0);
    this.feedback.set('none');
    this.awaitingNext.set(false);
    this.done.set(false);
    this.answered = [];
    this.maxStreak = 0;
    this.startedAt = new Date();
    this.questionStart = Date.now();
    this.currentQ.set(this.genForMode());
    this.phase.set('play');
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.done()) return;
      this.elapsed.update((v) => v + 1);
      if (this.mode() === 'time' && this.elapsed() >= this.timeLimit()) this.finish();
    }, 1000);
  }

  private genForMode(): Question {
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].gen();
    // Grades 7–12 reuse the hardest defined config (6).
    const cfg = GRADES[this.selectedGrade()] ?? GRADES[6];
    const op = this.mixMode() ? cfg.ops[Math.floor(Math.random() * cfg.ops.length)] : this.selectedOp();
    const [lo, hi] = cfg.range[op] ?? [1, 20];
    return this.genQuestion(op, lo, hi);
  }

  private genQuestion(op: OpKey, lo: number, hi: number): Question {
    switch (op) {
      case 'add': { const a = rnd(lo, hi), b = rnd(lo, hi); return numQ(`${a} + ${b} = `, `${a} + ${b}`, a + b); }
      case 'sub': { let a = rnd(lo, hi), b = rnd(lo, hi); if (b > a) [a, b] = [b, a]; return numQ(`${a} − ${b} = `, `${a} − ${b}`, a - b); }
      case 'mul': { const a = rnd(lo, hi), b = rnd(lo, hi); return numQ(`${a} × ${b} = `, `${a} × ${b}`, a * b); }
      case 'div': { const b = rnd(lo, hi), quot = rnd(lo, hi); const a = b * quot; return numQ(`${a} ÷ ${b} = `, `${a} ÷ ${b}`, quot); }
      case 'cmp': {
        const a = rnd(lo, hi), b = rnd(lo, hi);
        const ans = a > b ? '>' : a < b ? '<' : '=';
        return { before: `${a} `, after: ` ${b}`, display: `${a} ? ${b}`, answer: ans, mode: 'choice', choices: ['>', '<', '='] };
      }
      case 'miss': {
        const a = rnd(lo, hi), b = rnd(lo, hi), c = a + b;
        return Math.random() < 0.5
          ? numQ(`${a} + `, `${a} + ? = ${c}`, b, ` = ${c}`)
          : numQ('', `? + ${b} = ${c}`, a, ` + ${b} = ${c}`);
      }
      default: {
        let a = rnd(lo, hi), b = rnd(lo, hi), c = rnd(lo, hi);
        while (a + b - c < 0) c = rnd(lo, hi);
        return numQ(`${a} + ${b} − ${c} = `, `${a} + ${b} − ${c}`, a + b - c);
      }
    }
  }

  private record(userAnswer: number | string | null, correct: boolean): void {
    const cur = this.currentQ();
    this.answered.push({
      display: cur.display,
      answer: cur.answer,
      userAnswer,
      correct,
      seconds: Math.max(0, (Date.now() - this.questionStart) / 1000)
    });
  }

  press(k: string): void {
    if (this.done()) return;
    this.flash(k);
    if (this.awaitingNext()) {
      if (k === '↵') this.advance();
      return;
    }
    if (k === '↵') {
      this.submit();
    } else if (k === '←') {
      this.entry.update((e) => e.slice(0, -1));
    } else if (this.entry().length < 4) {
      this.entry.update((e) => e + k);
    }
  }

  choose(symbol: string): void {
    if (this.done() || this.awaitingNext()) return;
    this.flash(symbol);
    this.entry.set(symbol);
    this.submit();
  }

  private submit(): void {
    if (!this.entry()) return;
    const raw = this.entry();
    const userAnswer: number | string = this.currentQ().mode === 'choice' ? raw : Number(raw);
    const correct = String(userAnswer) === String(this.currentQ().answer);
    this.record(userAnswer, correct);
    if (correct) {
      const gain = 10 + this.streak() * 2;
      this.feedback.set('correct');
      this.streak.update((s) => s + 1);
      this.maxStreak = Math.max(this.maxStreak, this.streak());
      this.score.update((s) => s + gain);
      this.lastGain.set(gain);
      this.correctCount.update((c) => c + 1);
    } else {
      this.feedback.set('wrong');
      this.streak.set(0);
      this.wrongCount.update((c) => c + 1);
      this.elapsed.update((v) => v + 4);
    }
    this.awaitingNext.set(true);
    setTimeout(() => { if (this.awaitingNext() && !this.done()) this.advance(); }, correct ? 450 : 1900);
  }

  private skip(): void {
    if (this.done() || this.awaitingNext()) return;
    this.record(null, false);
    this.streak.set(0);
    this.wrongCount.update((c) => c + 1);
    this.advance();
  }

  private advance(): void {
    if (this.done()) return;
    this.awaitingNext.set(false);
    this.feedback.set('none');
    this.entry.set('');
    if (this.mode() === 'count' && this.answered.length >= this.count()) { this.finish(); return; }
    if (this.mode() === 'time' && this.elapsed() >= this.timeLimit()) { this.finish(); return; }
    this.index.update((i) => i + 1);
    this.currentQ.set(this.genForMode());
    this.questionStart = Date.now();
  }

  private finish(): void {
    if (this.done()) return;
    this.done.set(true);
    if (this.timer) clearInterval(this.timer);
    const answeredCount = this.answered.length;
    const total = answeredCount || 1;
    const correct = this.answered.filter((x) => x.correct).length;
    const totalSeconds = this.answered.reduce((sum, x) => sum + x.seconds, 0);
    const base = this.trickKey() ? this.opName() : `${this.opName()} · კლასი ${this.selectedGrade()}`;
    const title = base + (this.mode() === 'time' ? ` · ${this.timeLabel()}` : '');
    const accuracy = Math.round((correct / total) * 100);
    const avgSeconds = totalSeconds / total;

    // Daily Challenge: submit to the daily leaderboard AND record a normal
    // practice session (so it counts toward streaks/averages), then return to
    // the dashboard with the ranking modal open.
    if (this.dailyMode()) {
      if (answeredCount > 0) {
        this.daily.submit({
          score: this.score(),
          correctCount: correct,
          totalQuestions: answeredCount,
          accuracy,
          durationSeconds: this.elapsed()
        }).subscribe({ error: () => {} });

        this.progress.saveSession({
          title: 'დღის ამოცანა',
          mode: 'time',
          totalQuestions: answeredCount,
          correctCount: correct,
          wrongCount: answeredCount - correct,
          score: this.score(),
          longestStreak: this.maxStreak,
          accuracy,
          avgSeconds,
          durationSeconds: this.elapsed(),
          startedAtUtc: this.startedAt.toISOString()
        }).subscribe({ error: () => {} });
      }
      this.router.navigate(['/dashboard'], { queryParams: { daily: 'done' } });
      return;
    }

    // Competition mode: submit the score and go to the competition leaderboard.
    const compId = this.competitionId();
    if (compId) {
      if (answeredCount > 0) {
        this.competition.submit(compId, {
          score: this.score(),
          correctCount: correct,
          totalQuestions: answeredCount,
          accuracy,
          durationSeconds: this.elapsed()
        }).subscribe({ error: () => {} });
      }
      this.router.navigate(['/competition'], { queryParams: { id: compId } });
      return;
    }

    this.sessions.set({
      title,
      startedAt: this.startedAt.toISOString(),
      score: this.score(),
      accuracy,
      avgSeconds,
      longestStreak: this.maxStreak,
      correctCount: correct,
      wrongCount: answeredCount - correct,
      questions: this.answered,
      resumeTrick: this.trickKey()
    });

    // Persist the session so progress (streaks, averages) can be computed server-side.
    if (answeredCount > 0) {
      this.progress.saveSession({
        title,
        mode: this.mode(),
        totalQuestions: answeredCount,
        correctCount: correct,
        wrongCount: answeredCount - correct,
        score: this.score(),
        longestStreak: this.maxStreak,
        accuracy,
        avgSeconds,
        durationSeconds: this.elapsed(),
        startedAtUtc: this.startedAt.toISOString()
      }).subscribe({ error: () => {} });
    }

    this.router.navigate(['/results']);
  }

  private flash(k: string): void {
    this.hit.set(k);
    setTimeout(() => this.hit.set(null), 120);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (this.phase() !== 'play' || this.done()) return;
    if (this.awaitingNext()) {
      if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === ' ') {
        this.advance();
        e.preventDefault();
      }
      return;
    }
    if (this.currentQ().mode === 'choice') {
      if (e.key === '>' || e.key === '<' || e.key === '=') { this.choose(e.key); e.preventDefault(); }
      else if (e.key === ' ') { this.skip(); e.preventDefault(); }
      else if (e.key === 'Escape') { this.router.navigate([this.exitTarget()]); }
      return;
    }
    if (e.key >= '0' && e.key <= '9') {
      this.press(e.key);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      this.press('↵');
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      this.press('←');
      e.preventDefault();
    } else if (e.key === ' ') {
      this.skip();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this.router.navigate([this.exitTarget()]);
    }
  }
}
