import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnsweredQuestion, PracticeSessionService } from '../../core/services/practice-session.service';

type OpKey = 'add' | 'sub' | 'mul' | 'div';
type Mode = 'count' | 'time';

interface OpDef {
  key: OpKey;
  symbol: string;
  name: string;
  sub: string;
}

interface Question {
  a: number;
  b: number;
  symbol: string;
  answer: number;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '←', '0', '↵'];

const OPS: OpDef[] = [
  { key: 'add', symbol: '+', name: 'შეკრება', sub: 'ორნიშნა რიცხვების ჯამი' },
  { key: 'sub', symbol: '−', name: 'გამოკლება', sub: 'სხვაობა, დადებითი შედეგით' },
  { key: 'mul', symbol: '×', name: 'გამრავლება', sub: 'ცხრილი 12-მდე' },
  { key: 'div', symbol: '÷', name: 'გაყოფა', sub: 'ზუსტი განაყოფი' }
];

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface TrickDef {
  name: string;
  prompt: string;
  hint: string;
  count: number;
  gen: () => Question;
}

const TRICKS: Record<string, TrickDef> = {
  mul11: {
    name: 'გამრავლება 11-ზე',
    prompt: 'გაამრავლე 11-ზე',
    hint: 'ხრიკი — ორი ციფრი გვერდზე, შუაში მათი ჯამი',
    count: 10,
    gen: () => { const a = rnd(10, 99); return { a, b: 11, symbol: '×', answer: a * 11 }; }
  },
  mul5: {
    name: 'გამრავლება 5-ზე',
    prompt: 'გაამრავლე 5-ზე',
    hint: 'ხრიკი — გაყავი 2-ზე, მერე გაამრავლე 10-ზე',
    count: 10,
    gen: () => { const a = rnd(10, 99); return { a, b: 5, symbol: '×', answer: a * 5 }; }
  },
  add9: {
    name: '9-ის დამატება',
    prompt: 'დაუმატე',
    hint: 'ხრიკი — დაუმატე 10, მერე გამოაკელი 1',
    count: 10,
    gen: () => { const a = rnd(10, 99); return { a, b: 9, symbol: '+', answer: a + 9 }; }
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
      .key:disabled { opacity: .45; cursor: default; }
      @media (max-width: 560px) { .key { width: 52px; height: 52px; font-size: 22px; } }

      .op-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .op-card {
        display: flex; align-items: center; gap: 20px; padding: 24px 26px;
        border: 1px solid var(--hair); background: #fff; cursor: pointer; text-align: left;
        transition: border-color .12s ease, background .12s ease;
      }
      .op-card:hover { border-color: var(--gold); }
      .op-card.on { border-color: var(--gold); background: color-mix(in srgb, var(--gold) 6%, transparent); }
      .op-sym { font-family: var(--ge-serif); font-size: 52px; line-height: 1; color: var(--gold); width: 56px; text-align: center; }
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
      <!-- ══════════ 04a · ოპერაციის არჩევა ══════════ -->
      <div style="min-height:100vh; display:flex; flex-direction:column; background:var(--paper);">
        <div style="display:flex; align-items:center; padding:22px 56px; border-bottom:1px solid var(--hair); gap:16px;">
          <a routerLink="/dashboard" style="font-family:var(--ge); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); text-decoration:none;">← მთავარი</a>
          <div style="margin-left:auto; font-family:var(--ge-serif); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold);">დონე IV</div>
        </div>

        <div style="flex:1; display:grid; place-items:center; padding:48px 24px;">
          <div style="width:100%; max-width:720px;">
            <div style="text-align:center; margin-bottom:32px;">
              <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold); margin-bottom:12px;">— დღის ვარჯიში</div>
              <h1 style="font-family:var(--ge-serif); font-size:52px; margin:0 0 10px; font-weight:500; line-height:1.02;">აირჩიე ოპერაცია</h1>
              <p style="font-size:14.5px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0;">ერთი ვარჯიში — ერთი ოპერაცია. აირჩიე და დაიწყე.</p>
            </div>

            <div class="op-grid">
              @for (op of ops; track op.key) {
                <button type="button" class="op-card" [class.on]="selectedOp() === op.key" (click)="selectedOp.set(op.key)">
                  <span class="op-sym">{{ op.symbol }}</span>
                  <span>
                    <span style="font-family:var(--ge-serif); font-size:22px; display:block;">{{ op.name }}</span>
                    <span style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ op.sub }}</span>
                  </span>
                </button>
              }
            </div>

            <!-- mode + amount -->
            <div style="display:flex; align-items:center; gap:16px; margin-top:28px; flex-wrap:wrap;">
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

            <div style="margin-top:14px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
              {{ mode() === 'count'
                ? 'ამოხსენი ' + count() + ' მაგალითი შენი ტემპით.'
                : 'ერთ ' + timeLabel() + '-ში ამოხსენი რაც შეიძლება მეტი — დრო უკუთვლით მიდის.' }}
            </div>

            <div style="display:flex; margin-top:24px;">
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
            <span style="font-family:var(--ge); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">დონე IV · {{ opName() }}</span>
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
          <div style="text-align:center;">
            <div style="font-family:var(--ge-serif); font-style:italic; font-size:14px; color:var(--gold); margin-bottom:18px;">— {{ prompt() }}</div>
            <div style="font-family:var(--ge-serif); font-size:150px; line-height:.95; letter-spacing:-.02em; font-feature-settings:'tnum'; font-weight:400;">{{ q().a }} {{ q().symbol }} {{ q().b }}</div>
            <div style="font-family:var(--ge-serif); font-size:64px; color:color-mix(in srgb, var(--ink) 30%, transparent); margin-top:16px;">=
              <span [style.color]="answerColor()" style="border-bottom:2px solid var(--gold); padding: 0 44px; min-width:2ch; display:inline-block;">{{ displayEntry() }}</span>
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

            <div style="margin-top:32px; display:grid; grid-template-columns:repeat(6, 64px); gap:8px; justify-content:center;">
              @for (k of keys; track k) {
                <button type="button" class="key" [class.enter]="k === '↵'" [class.back]="k === '←'" [class.hit]="hit() === k" [disabled]="awaitingNext() && k !== '↵'" (click)="press(k)">{{ k }}</button>
              }
            </div>
            <div style="margin-top:20px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
              {{ awaitingNext() ? 'Enter / Space — შემდეგი' : 'Enter — დადასტურე · Space — გამოტოვე · Esc — გამოსვლა' }}
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
  private timer: ReturnType<typeof setInterval> | null = null;

  private questionStart = 0;
  private maxStreak = 0;
  private answered: AnsweredQuestion[] = [];
  private startedAt = new Date();

  readonly keys = KEYS;
  readonly ops = OPS;
  readonly counts = [10, 20, 30];
  readonly times = [
    { sec: 60, label: '1 წთ' },
    { sec: 120, label: '2 წთ' },
    { sec: 180, label: '3 წთ' }
  ];

  readonly phase = signal<'select' | 'play'>('select');
  readonly selectedOp = signal<OpKey>('add');
  readonly mode = signal<Mode>('count');
  readonly count = signal(30);
  readonly timeLimit = signal(60);
  readonly trickKey = signal<string | null>(null);

  readonly currentQ = signal<Question>({ a: 0, b: 0, symbol: '+', answer: 0 });
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
    const key = inject(ActivatedRoute).snapshot.queryParamMap.get('trick');
    if (key && TRICKS[key]) {
      this.trickKey.set(key);
      this.mode.set('count');
      this.count.set(TRICKS[key].count);
      this.start();
    }
  }

  readonly q = computed(() => this.currentQ());
  readonly opName = computed(() => {
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].name;
    return OPS.find((o) => o.key === this.selectedOp())?.name ?? '';
  });
  readonly exitTarget = computed(() => (this.trickKey() ? '/learn' : '/dashboard'));
  readonly remaining = computed(() => Math.max(0, this.timeLimit() - this.elapsed()));
  readonly clock = computed(() => (this.mode() === 'time' ? fmt(this.remaining()) : fmt(this.elapsed())));
  readonly clockColor = computed(() =>
    this.mode() === 'time' && this.remaining() <= 10 ? '#b22' : 'var(--ink)'
  );
  readonly progressPct = computed(() =>
    this.mode() === 'time'
      ? Math.min(100, (this.elapsed() / this.timeLimit()) * 100)
      : (this.index() / this.count()) * 100
  );
  readonly numerator = computed(() =>
    this.mode() === 'time' ? `${this.answered.length} ✓` : `${this.index() + 1} / ${this.count()}`
  );
  readonly timeLabel = computed(() => this.times.find((t) => t.sec === this.timeLimit())?.label ?? '');
  readonly displayEntry = computed(() => this.entry() || (this.awaitingNext() ? '' : '_'));
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
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].prompt;
    switch (this.selectedOp()) {
      case 'add': return 'იპოვე ჯამი';
      case 'sub': return 'იპოვე სხვაობა';
      case 'mul': return 'იპოვე ნამრავლი';
      default: return 'იპოვე განაყოფი';
    }
  });
  readonly trick = computed(() => {
    const t = this.trickKey();
    if (t && TRICKS[t]) return TRICKS[t].hint;
    switch (this.selectedOp()) {
      case 'add': return 'ხრიკი — მრგვალამდე მიდი, მერე დააკელი';
      case 'sub': return 'ხრიკი — ჯერ ათეულები, მერე ერთეულები';
      case 'mul': return 'ხრიკი — დაშალე უფრო მარტივ ნაბიჯებად';
      default: return 'ხრიკი — იფიქრე „რამდენჯერ ჯდება"';
    }
  });

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
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
    return this.genQuestion(this.selectedOp());
  }

  private genQuestion(op: OpKey): Question {
    switch (op) {
      case 'add': { const a = rnd(10, 99), b = rnd(10, 99); return { a, b, symbol: '+', answer: a + b }; }
      case 'sub': { const a = rnd(30, 99), b = rnd(10, a); return { a, b, symbol: '−', answer: a - b }; }
      case 'mul': { const a = rnd(2, 12), b = rnd(2, 12); return { a, b, symbol: '×', answer: a * b }; }
      default: { const b = rnd(2, 12), quot = rnd(2, 12); return { a: b * quot, b, symbol: '÷', answer: quot }; }
    }
  }

  private record(userAnswer: number | null, correct: boolean): void {
    const cur = this.currentQ();
    this.answered.push({
      a: cur.a,
      b: cur.b,
      symbol: cur.symbol,
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

  private submit(): void {
    if (!this.entry()) return;
    const userAnswer = Number(this.entry());
    const correct = userAnswer === this.currentQ().answer;
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
      this.elapsed.update((v) => v + 4); // 4-second penalty
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
    const total = this.answered.length || 1;
    const correct = this.answered.filter((x) => x.correct).length;
    const totalSeconds = this.answered.reduce((sum, x) => sum + x.seconds, 0);
    this.sessions.set({
      title: this.opName() + (this.mode() === 'time' ? ` · ${this.timeLabel()}` : ''),
      startedAt: this.startedAt.toISOString(),
      score: this.score(),
      accuracy: Math.round((correct / total) * 100),
      avgSeconds: totalSeconds / total,
      longestStreak: this.maxStreak,
      correctCount: correct,
      wrongCount: this.answered.length - correct,
      questions: this.answered,
      resumeTrick: this.trickKey()
    });
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
