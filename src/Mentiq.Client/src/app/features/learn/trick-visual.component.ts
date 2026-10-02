import { Component, Input, computed, signal } from '@angular/core';

/**
 * Tiny, static diagram that explains a trick's idea using the current example's
 * numbers. One component, switched by `kind` (the trick key). Uses the global
 * design tokens (--gold / --ink / --hair / --ge) — no images, no animation
 * beyond simple CSS transitions.
 */
@Component({
  selector: 'app-trick-visual',
  standalone: true,
  styles: [`
    :host { display: block; }
    .tv { font-family: var(--ge); padding: 6px 0; }
    .tv-row { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
    .tv-box {
      min-width: 48px; padding: 9px 13px; border: 1px solid var(--hair); border-radius: 10px;
      background: #fff; font-family: var(--ge-serif); font-size: 20px; text-align: center; color: var(--ink);
      transition: border-color .2s ease, color .2s ease;
    }
    .tv-box.gold { border-color: var(--gold); color: var(--gold); background: color-mix(in srgb, var(--gold) 8%, #fff); }
    .tv-box.soft { background: color-mix(in srgb, var(--ink) 4%, #fff); }
    .tv-arrow { display: flex; flex-direction: column; align-items: center; color: color-mix(in srgb, var(--ink) 45%, transparent); font-size: 18px; }
    .tv-arrow b { font-size: 11.5px; color: var(--gold); font-weight: 600; }
    .tv-cap { text-align: center; font-size: 12px; color: color-mix(in srgb, var(--ink) 55%, transparent); margin-top: 10px; }
    .tv svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
    .tv-chip { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
      border: 1px solid var(--hair); background: #fff; font-family: var(--ge-serif); font-size: 17px; }
    .tv-blocks { display: flex; justify-content: center; gap: 0; }
    .tv-blk { padding: 14px 18px; font-family: var(--ge-serif); font-size: 26px; border: 1px solid var(--hair); }
    .tv-blk.a { background: color-mix(in srgb, var(--gold) 10%, #fff); border-right: 0; border-radius: 10px 0 0 10px; color: var(--gold); }
    .tv-blk.b { background: color-mix(in srgb, var(--ink) 5%, #fff); border-radius: 0 10px 10px 0; }
    text { font-family: var(--ge-serif); fill: var(--ink); }
    .svg-dim { fill: color-mix(in srgb, var(--ink) 55%, transparent); font-family: var(--ge); }
    .svg-gold { fill: var(--gold); }
  `],
  template: `
    <div class="tv">
      @switch (kind) {

        @case ('mul4') {
          <div class="tv-row">
            <span class="tv-box">{{ o(0) }}</span>
            <span class="tv-arrow"><b>×2</b>→</span>
            <span class="tv-box soft">{{ o(0) * 2 }}</span>
            <span class="tv-arrow"><b>×2</b>→</span>
            <span class="tv-box gold">{{ o(0) * 4 }}</span>
          </div>
          <div class="tv-cap">4-ზე გამრავლება = ორჯერ გაორმაგება</div>
        }

        @case ('mul25') {
          <svg viewBox="0 0 160 110" width="200" aria-hidden="true">
            <rect x="30" y="8" width="100" height="72" fill="none" stroke="var(--hair)"/>
            <line x1="80" y1="8" x2="80" y2="80" stroke="var(--hair)"/>
            <line x1="30" y1="44" x2="130" y2="44" stroke="var(--hair)"/>
            <text x="55" y="30" text-anchor="middle" font-size="15">25</text>
            <text x="105" y="30" text-anchor="middle" font-size="15">25</text>
            <text x="55" y="66" text-anchor="middle" font-size="15">25</text>
            <text x="105" y="66" text-anchor="middle" font-size="15">25</text>
            <text x="80" y="100" text-anchor="middle" font-size="12" class="svg-dim">100 = 4 × 25</text>
          </svg>
          <div class="tv-row" style="margin-top:6px;">
            <span class="tv-box">{{ o(0) }}</span>
            <span class="tv-arrow"><b>÷4</b>→</span>
            <span class="tv-box soft">{{ o(0) / 4 }}</span>
            <span class="tv-arrow"><b>×100</b>→</span>
            <span class="tv-box gold">{{ o(0) * 25 }}</span>
          </div>
        }

        @case ('mul99') {
          <svg viewBox="0 0 220 80" width="240" aria-hidden="true">
            <rect x="6" y="20" width="180" height="34" fill="color-mix(in srgb, var(--gold) 12%, #fff)" stroke="var(--gold)"/>
            <text x="96" y="42" text-anchor="middle" font-size="14">100 × {{ o(0) }}</text>
            <rect x="188" y="20" width="26" height="34" fill="color-mix(in srgb, var(--ink) 7%, #fff)" stroke="var(--hair)" stroke-dasharray="3 2"/>
            <text x="201" y="42" text-anchor="middle" font-size="11" class="svg-dim">−{{ o(0) }}</text>
            <text x="110" y="72" text-anchor="middle" font-size="12" class="svg-gold">= {{ o(0) * 99 }}</text>
          </svg>
        }

        @case ('mulSameTen') {
          <div class="tv-blocks">
            <span class="tv-blk a">{{ tens() * (tens() + 1) }}</span>
            <span class="tv-blk b">{{ pad2(onesA() * onesB()) }}</span>
          </div>
          <div class="tv-cap">[ ათეული × მომდევნო ] [ ერთეულები ]</div>
        }

        @case ('doubleHalve') {
          <svg viewBox="0 0 240 96" width="250" aria-hidden="true">
            <rect x="6" y="20" width="60" height="60" fill="color-mix(in srgb, var(--ink) 5%, #fff)" stroke="var(--hair)"/>
            <text x="36" y="54" text-anchor="middle" font-size="12">{{ o(0) }}×{{ o(1) }}</text>
            <text x="110" y="54" text-anchor="middle" font-size="18" class="svg-dim">=</text>
            <rect x="140" y="38" width="94" height="24" fill="color-mix(in srgb, var(--gold) 10%, #fff)" stroke="var(--gold)"/>
            <text x="187" y="54" text-anchor="middle" font-size="12">{{ o(0) / 2 }}×{{ o(1) * 2 }}</text>
            <text x="120" y="92" text-anchor="middle" font-size="12" class="svg-dim">ფართობი იგივეა</text>
          </svg>
        }

        @case ('tenPairs') {
          <svg [attr.viewBox]="'0 0 ' + (ops.length * 46) + ' 70'" [attr.width]="ops.length * 42" aria-hidden="true">
            @for (p of pairArcs(); track $index) {
              <path [attr.d]="arcPath(p[0], p[1])" fill="none" stroke="var(--gold)" stroke-width="1.5"/>
            }
            @for (n of ops; track $index) {
              <circle [attr.cx]="23 + $index * 46" cy="52" r="15" fill="#fff" stroke="var(--hair)"/>
              <text [attr.x]="23 + $index * 46" y="57" text-anchor="middle" font-size="15">{{ n }}</text>
            }
          </svg>
          <div class="tv-cap">იპოვე წყვილები, რომლებიც 10-ს იძლევა</div>
        }

        @case ('add99Big') {
          <svg viewBox="0 0 240 70" width="250" aria-hidden="true">
            <line x1="12" y1="48" x2="228" y2="48" stroke="var(--hair)"/>
            <path d="M24 48 C 70 6, 150 6, 196 48" fill="none" stroke="var(--gold)" stroke-width="1.5"/>
            <path d="M196 48 C 186 30, 178 30, 170 48" fill="none" stroke="color-mix(in srgb, var(--ink) 45%, transparent)" stroke-width="1.5"/>
            <text x="108" y="14" text-anchor="middle" font-size="12" class="svg-gold">+100</text>
            <text x="183" y="26" text-anchor="middle" font-size="11" class="svg-dim">−1</text>
            <text x="24" y="66" text-anchor="middle" font-size="12">{{ o(0) }}</text>
            <text x="196" y="66" text-anchor="middle" font-size="12">{{ o(0) + 100 }}</text>
            <text x="170" y="66" text-anchor="middle" font-size="12" class="svg-gold">{{ o(0) + 99 }}</text>
          </svg>
        }

        @case ('sub1000') {
          <div class="tv-row" style="gap:18px; align-items:flex-end;">
            @for (d of digits3(); track $index) {
              <div style="text-align:center;">
                <div class="svg-dim" style="font-size:12px; color:var(--gold);">{{ $index === 2 ? '10−' : '9−' }}</div>
                <div class="tv-box" style="min-width:40px; margin-top:4px;">{{ d }}</div>
                <div style="font-family:var(--ge-serif); font-size:20px; margin-top:6px; color:var(--gold);">{{ ($index === 2 ? 10 : 9) - d }}</div>
              </div>
            }
          </div>
          <div class="tv-cap">1000 − {{ o(0) }} = {{ 1000 - o(0) }}</div>
        }

        @case ('countUp') {
          <svg viewBox="0 0 240 70" width="250" aria-hidden="true">
            <line x1="12" y1="48" x2="228" y2="48" stroke="var(--hair)"/>
            <path d="M30 48 C 50 20, 78 20, 98 48" fill="none" stroke="var(--gold)" stroke-width="1.5"/>
            <path d="M98 48 C 140 14, 186 14, 210 48" fill="none" stroke="var(--gold)" stroke-width="1.5"/>
            <text x="64" y="26" text-anchor="middle" font-size="11" class="svg-gold">+{{ upVal() - o(1) }}</text>
            <text x="154" y="18" text-anchor="middle" font-size="11" class="svg-gold">+{{ o(0) - upVal() }}</text>
            <text x="30" y="66" text-anchor="middle" font-size="12">{{ o(1) }}</text>
            <text x="98" y="66" text-anchor="middle" font-size="12" class="svg-dim">{{ upVal() }}</text>
            <text x="210" y="66" text-anchor="middle" font-size="12">{{ o(0) }}</text>
          </svg>
        }

        @case ('div5') {
          <div class="tv-row">
            <span class="tv-box">{{ o(0) }}</span>
            <span class="tv-arrow"><b>×2</b>→</span>
            <span class="tv-box soft">{{ o(0) * 2 }}</span>
            <span class="tv-arrow"><b>÷10</b>→</span>
            <span class="tv-box gold">{{ o(0) / 5 }}</span>
          </div>
          <div class="tv-cap">×2, მერე მოაშორე ბოლო ნული</div>
        }

        @case ('div3check') {
          <div class="tv-row">
            @for (d of digitsOf(); track $index) {
              <span class="tv-chip">{{ d }}</span>
              @if ($index < digitsOf().length - 1) { <span class="tv-arrow">+</span> }
            }
            <span class="tv-arrow">=</span>
            <span class="tv-box" [class.gold]="answerYes()">{{ digitSum() }}</span>
          </div>
          <div class="tv-cap">{{ answerYes() ? 'ჯამი 3-ზე იყოფა → ✓' : 'ჯამი 3-ზე არ იყოფა → ✗' }}</div>
        }

        @case ('pctFlip') {
          <div class="tv-row">
            <span class="tv-box soft">{{ o(0) }}-ის {{ o(1) }}%</span>
            <span class="tv-arrow" style="font-size:22px;">⇄</span>
            <span class="tv-box gold">{{ o(1) }}-ის {{ o(0) }}%</span>
          </div>
          <div class="tv-cap">x-ის y% = y-ის x%</div>
        }

        @case ('pct5') {
          <svg viewBox="0 0 240 56" width="250" aria-hidden="true">
            <rect x="6" y="14" width="228" height="22" fill="color-mix(in srgb, var(--ink) 5%, #fff)" stroke="var(--hair)"/>
            <rect x="6" y="14" width="22.8" height="22" fill="color-mix(in srgb, var(--gold) 15%, #fff)" stroke="var(--gold)"/>
            <rect x="6" y="14" width="11.4" height="22" fill="var(--gold)" opacity="0.5"/>
            <text x="120" y="29" text-anchor="middle" font-size="11" class="svg-dim">100% = {{ o(0) }}</text>
            <text x="30" y="50" text-anchor="middle" font-size="10" class="svg-gold">5% = {{ o(0) / 20 }}</text>
          </svg>
        }

        @case ('sqNeighbor') {
          <svg viewBox="0 0 120 120" width="150" aria-hidden="true">
            <rect x="10" y="26" width="72" height="72" fill="color-mix(in srgb, var(--ink) 5%, #fff)" stroke="var(--hair)"/>
            <text x="46" y="66" text-anchor="middle" font-size="14">{{ (o(0) - 1) }}²</text>
            <rect x="82" y="26" width="16" height="72" fill="color-mix(in srgb, var(--gold) 14%, #fff)" stroke="var(--gold)"/>
            <rect x="10" y="98" width="88" height="14" fill="color-mix(in srgb, var(--gold) 14%, #fff)" stroke="var(--gold)"/>
            <text x="112" y="66" text-anchor="middle" font-size="10" class="svg-gold">{{ o(0) - 1 }}</text>
            <text x="54" y="120" text-anchor="middle" font-size="10" class="svg-gold">{{ o(0) }}</text>
          </svg>
        }
      }
    </div>
  `
})
export class TrickVisualComponent {
  @Input() kind = '';
  @Input() set ops(v: number[]) { this._ops.set(v ?? []); }
  get ops(): number[] { return this._ops(); }
  @Input() answer: number | string = '';

  private readonly _ops = signal<number[]>([]);

  /** Safe operand accessor. */
  o(i: number): number { return this._ops()[i] ?? 0; }

  pad2(n: number): string { return n.toString().padStart(2, '0'); }

  // mulSameTen helpers
  tens = computed(() => Math.floor(this.o(0) / 10));
  onesA = computed(() => this.o(0) % 10);
  onesB = computed(() => this.o(1) % 10);

  // countUp helper
  upVal = computed(() => Math.floor(this.o(1) / 10) * 10 + 10);

  // sub1000 digits
  digits3 = computed(() => {
    const n = this.o(0);
    return [Math.floor(n / 100), Math.floor((n % 100) / 10), n % 10];
  });

  // div3check helpers
  digitsOf = computed(() => `${this.o(0)}`.split('').map(Number));
  digitSum = computed(() => this.digitsOf().reduce((s, d) => s + d, 0));
  answerYes = computed(() => this.answer === 'კი');

  /** tenPairs: index pairs (i, j) whose values sum to 10. */
  pairArcs = computed<[number, number][]>(() => {
    const nums = this._ops();
    const used = new Array(nums.length).fill(false);
    const arcs: [number, number][] = [];
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      for (let j = i + 1; j < nums.length; j++) {
        if (!used[j] && nums[i] + nums[j] === 10) {
          used[i] = used[j] = true;
          arcs.push([i, j]);
          break;
        }
      }
    }
    return arcs;
  });

  /** Arc path between two circle indices (used by tenPairs). */
  arcPath(i: number, j: number): string {
    const x1 = 23 + i * 46;
    const x2 = 23 + j * 46;
    const lift = Math.min(40, 14 + Math.abs(j - i) * 8);
    return `M${x1} 37 C ${x1} ${37 - lift}, ${x2} ${37 - lift}, ${x2} 37`;
  }
}
