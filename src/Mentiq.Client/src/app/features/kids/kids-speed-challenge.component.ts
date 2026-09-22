import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AudioService } from '../../core/services/audio.service';
import { AuthService } from '../../core/services/auth.service';
import { KidsProfileService } from './kids-profile.service';

interface SpeedRecord {
  best: number;
  recent: number[]; // last few scores, for the 7-day-style average
}

/**
 * Design 08 — the Speed Challenge, made child-first. A calm, personal 60-second
 * sprint of small sums, shown with real objects (🍎) and answered by tapping a
 * card — no typing, no abstract keypad. Never ranked or punishing. The only
 * comparison is the child's own best, kept per-child in localStorage.
 */
@Component({
  selector: 'app-kids-speed-challenge',
  standalone: true,
  template: `
    @switch (phase()) {
      @case ('intro') {
        <div class="sc-top">
          <button type="button" class="kids-round" (click)="quit()" aria-label="უკან">←</button>
          <span class="sc-badge">⚡ სისწრაფის ველი</span>
        </div>
        <div style="text-align:center; padding:12px 4px 4px;">
          <div class="sc-hero">⚡</div>
          <h1 class="kids-h1" style="font-size:30px;">სისწრაფის გამოწვევა</h1>
          <p class="kids-sub" style="max-width:28ch; margin:10px auto 22px;">
            რამდენ ვაშლს დაითვლი 60 წამში? მშვიდად — შეცდომა შეიძლება.
          </p>
          <div class="sc-recs">
            <div class="sc-rec"><div class="kids-kicker" style="margin:0;">— პირადი რეკ.</div><div class="sc-rec-n brand">{{ record().best }}</div><div class="sc-rec-l">საუკეთესო</div></div>
            <div class="sc-rec"><div class="kids-kicker" style="margin:0;">— საშუალო</div><div class="sc-rec-n">{{ average() }}</div><div class="sc-rec-l">ბოლო ჯერ</div></div>
          </div>
          <button type="button" class="kids-btn" style="width:100%; margin-top:22px;" (click)="start()">დაწყება · 60 წამი →</button>
          <div class="kids-sub" style="margin-top:12px; font-size:12px;">{{ audio.muted() ? '🔇 ხმა გამორთული' : '🔊 ხმა ჩართული' }}</div>
        </div>
      }

      @case ('live') {
        <div class="sc-top">
          <button type="button" class="ex-quit" (click)="quit()" aria-label="დახურვა">✕</button>
          <div class="sc-timer" style="margin-left:auto;">
            <svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="16"/><circle class="prog" cx="18" cy="18" r="16" [attr.stroke-dashoffset]="100 - timePct()"/></svg>
            <span>{{ remaining() }}</span>
          </div>
        </div>
        <div class="sc-scoreline">
          <div><div class="kids-kicker" style="margin:0;">— სწორი</div><div class="sc-live-n mint">{{ correct() }}</div></div>
          <div style="text-align:right;"><div class="kids-kicker" style="margin:0;">— პ. რეკ.</div><div class="sc-live-n brand">{{ record().best }}</div></div>
        </div>

        <!-- Visual equation: object groups joined by + -->
        <div class="ex-addition">
          <span class="ex-addend">
            @for (i of range(a()); track i) { <span class="ex-obj sm">{{ emoji() }}</span> }
          </span>
          <span class="ex-plus">+</span>
          <span class="ex-addend">
            @for (i of range(b()); track i) { <span class="ex-obj sm">{{ emoji() }}</span> }
          </span>
          <span class="ex-plus">=</span>
          <span class="ex-qmark">❓</span>
        </div>

        <!-- Tap answers: number + objects; ✓/✗ shows if the pick was right. -->
        <div class="ex-options">
          @for (o of options(); track o) {
            <button type="button" class="kids-opt with-dots"
                    [class.good]="marked(o) === 'good'" [class.bad]="marked(o) === 'bad'"
                    [disabled]="locked()" (click)="answer(o)">
              <span class="opt-num">{{ o }}</span>
              <span class="opt-dots">
                @for (d of range(o); track d) { <span class="opt-obj">{{ emoji() }}</span> }
              </span>
              @if (marked(o) === 'good') { <span class="opt-mark good">✓</span> }
              @if (marked(o) === 'bad') { <span class="opt-mark bad">✕</span> }
            </button>
          }
        </div>
      }

      @case ('result') {
        <div style="text-align:center; padding:20px 4px 4px;">
          <div class="kids-kicker">— გამოწვევის შედეგი</div>
          <div class="sc-result-n">{{ correct() }}</div>
          <div class="kids-sub" style="margin-top:2px;">სწორი პასუხი 60 წამში</div>
        </div>
        <div style="padding:12px 2px 0;">
          @if (isRecord()) {
            <div class="sc-record-card">
              <div style="font-family:var(--ge-serif); color:var(--k-accent); font-size:14px;">— ახალი პირადი რეკორდი! ★</div>
              <div style="font-family:var(--ge-serif); font-size:20px; margin-top:4px;">{{ prevBest() }}-ის ნაცვლად {{ correct() }}.</div>
            </div>
          } @else {
            <div class="sc-record-card calm">
              <div style="font-family:var(--ge-serif); font-size:18px;">ყოჩაღ! საუკეთესო: {{ record().best }}.</div>
            </div>
          }
          <div class="sc-stats">
            <div class="sc-stat"><div class="kids-kicker" style="margin:0;">— სიზუსტე</div><div class="sc-stat-n">{{ accuracy() }}%</div></div>
            <div class="sc-stat"><div class="kids-kicker" style="margin:0;">— საშუალო</div><div class="sc-stat-n">{{ avgTime() }}წ</div></div>
            <div class="sc-stat"><div class="kids-kicker" style="margin:0;">— სერია</div><div class="sc-stat-n">×{{ bestStreak() }}</div></div>
          </div>
          <div style="display:flex; gap:10px; margin-top:18px;">
            <button type="button" class="kids-btn secondary" style="flex:1;" (click)="quit()">გასვლა</button>
            <button type="button" class="kids-btn" style="flex:1;" (click)="start()">კიდევ ერთხელ</button>
          </div>
        </div>
      }
    }
  `
})
export class KidsSpeedChallengeComponent implements OnDestroy {
  readonly audio = inject(AudioService);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(KidsProfileService);
  private readonly router = inject(Router);

  // A varied pool of friendly, countable objects — not always apples.
  private readonly objectPool = ['🍎', '🥕', '🌰', '🍓', '🍌', '🍇', '🌸', '⭐', '🐟', '🧸', '🚗', '⚽'];
  readonly emoji = signal('🍎');
  private readonly duration = 60;

  readonly phase = signal<'intro' | 'live' | 'result'>('intro');
  readonly record = signal<SpeedRecord>(this.readRecord());

  readonly a = signal(0);
  readonly b = signal(0);
  readonly options = signal<number[]>([]);
  readonly locked = signal(false);
  /** The tapped answer + whether it was right, so the card shows ✓/✗. */
  readonly picked = signal<number | null>(null);
  readonly pickedOk = signal(false);
  readonly correct = signal(0);
  readonly answered = signal(0);
  readonly remaining = signal(this.duration);

  private streak = 0;
  readonly bestStreak = signal(0);
  private times: number[] = [];
  private shownAt = 0;
  readonly prevBest = signal(0);
  readonly isRecord = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private advanceTimer?: ReturnType<typeof setTimeout>;

  readonly timePct = computed(() => Math.round((this.remaining() / this.duration) * 100));
  readonly average = computed(() => {
    const r = this.record().recent;
    return r.length ? Math.round(r.reduce((s, n) => s + n, 0) / r.length) : 0;
  });
  readonly accuracy = computed(() =>
    this.answered() > 0 ? Math.round((this.correct() / this.answered()) * 100) : 0
  );
  readonly avgTime = computed(() => {
    if (!this.times.length) return '0';
    const ms = this.times.reduce((s, n) => s + n, 0) / this.times.length;
    return (ms / 1000).toFixed(1);
  });

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  start(): void {
    this.correct.set(0);
    this.answered.set(0);
    this.streak = 0;
    this.bestStreak.set(0);
    this.times = [];
    this.remaining.set(this.duration);
    this.newProblem();
    this.phase.set('live');
    this.clearTimer();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    const left = this.remaining() - 1;
    this.remaining.set(left);
    if (left <= 0) this.finish();
  }

  /** How an option should render after a tap: green ✓, red ✗, or nothing. */
  marked(o: number): 'good' | 'bad' | null {
    if (this.picked() === null) return null;
    const answer = this.a() + this.b();
    if (o === answer) return 'good';            // always reveal the correct one
    if (o === this.picked() && !this.pickedOk()) return 'bad'; // the wrong pick
    return null;
  }

  answer(value: number): void {
    if (this.phase() !== 'live' || this.locked()) return;
    this.locked.set(true);
    const ok = value === this.a() + this.b();
    this.picked.set(value);
    this.pickedOk.set(ok);
    this.answered.update((n) => n + 1);
    this.times.push(Date.now() - this.shownAt);
    if (ok) {
      this.correct.update((n) => n + 1);
      this.streak++;
      this.bestStreak.update((s) => Math.max(s, this.streak));
      this.audio.blip();
    } else {
      this.streak = 0;
      this.audio.cue('error');
    }
    // Brief visual confirmation (a wrong pick lingers a touch longer to learn).
    this.advanceTimer = setTimeout(() => {
      this.picked.set(null);
      this.locked.set(false);
      if (this.phase() === 'live') this.newProblem();
    }, ok ? 300 : 650);
  }

  private newProblem(): void {
    // Sums stay small and countable for young children (2..10); vary the object.
    const a = 1 + Math.floor(Math.random() * 5);
    const b = 1 + Math.floor(Math.random() * 5);
    this.a.set(a);
    this.b.set(b);
    this.emoji.set(this.objectPool[Math.floor(Math.random() * this.objectPool.length)]);
    this.options.set(this.buildOptions(a + b));
    this.shownAt = Date.now();
  }

  /** Correct sum + three nearby, plausible distractors, shuffled. */
  private buildOptions(correct: number): number[] {
    const set = new Set<number>([correct]);
    const candidates = [correct - 1, correct + 1, correct + 2, correct - 2, correct + 3];
    for (const c of candidates) {
      if (set.size >= 4) break;
      if (c >= 0 && c <= 12) set.add(c);
    }
    let fill = 1;
    while (set.size < 4) { set.add(correct + fill + 2); fill++; }
    return [...set].sort(() => Math.random() - 0.5);
  }

  private finish(): void {
    this.clearTimer();
    const score = this.correct();
    const rec = this.record();
    this.prevBest.set(rec.best);
    this.isRecord.set(score > rec.best);

    const recent = [...rec.recent, score].slice(-5);
    const updated: SpeedRecord = { best: Math.max(rec.best, score), recent };
    this.record.set(updated);
    this.writeRecord(updated);

    this.audio.cue('finished');
    this.phase.set('result');
  }

  quit(): void {
    this.clearTimer();
    this.audio.stop();
    this.router.navigate(['/kids']);
  }

  private clearTimer(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.timer = undefined;
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private key(): string {
    return `mentiq.kids.speed.${this.auth.user()?.id ?? 'anon'}`;
  }

  private readRecord(): SpeedRecord {
    try {
      const raw = localStorage.getItem(this.key());
      if (raw) {
        const r = JSON.parse(raw) as SpeedRecord;
        return { best: r.best ?? 0, recent: Array.isArray(r.recent) ? r.recent : [] };
      }
    } catch {
      /* storage unavailable */
    }
    return { best: 0, recent: [] };
  }

  private writeRecord(r: SpeedRecord): void {
    try {
      localStorage.setItem(this.key(), JSON.stringify(r));
    } catch {
      /* storage unavailable */
    }
  }
}
