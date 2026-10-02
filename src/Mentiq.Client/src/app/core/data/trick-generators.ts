/**
 * Math-trick example generators.
 *
 * Pure, side-effect-free factories shared by the Learn page (lesson examples)
 * and the Practice drill ("ხრიკის ვარჯიში"). Each generator takes an injectable
 * random source so tests can seed it deterministically.
 *
 * Every example carries:
 *  - `expr`   — the problem as shown (e.g. "47 × 99"),
 *  - `answer` — the correct result (number, or "კი"/"არა" for the 3-divisibility
 *               check),
 *  - `steps`  — intermediate values for the "მაგალითი" breakdown
 *               (label + value, gold marks the final one),
 *  - `ops`    — the raw operands the matching visual needs.
 */

export interface TrickStep {
  label: string;
  value: string;
  /** Highlight (the final / key value). */
  gold?: boolean;
}

export interface TrickExample {
  expr: string;
  answer: number | string;
  steps: TrickStep[];
  ops: number[];
  /** True for a yes/no (choice) question rather than a typed number. */
  choice?: boolean;
}

/** A random source returning a float in [0, 1), like Math.random. */
export type Rng = () => number;

/** Deterministic, seedable RNG (mulberry32) — used by the unit tests. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pick one item from a list. */
function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

const pad2 = (n: number): string => n.toString().padStart(2, '0');

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The next multiple of 10 strictly greater than n. */
const nextTen = (n: number): number => Math.floor(n / 10) * 10 + 10;

// ---------------------------------------------------------------------------
// § გამრავლება
// ---------------------------------------------------------------------------

/** 1. გამრავლება 4-ზე — ორჯერ გააორმაგე. n ∈ [12, 49]. */
function genMul4(rng: Rng): TrickExample {
  const n = randInt(rng, 12, 49);
  const d1 = n * 2;
  const d2 = d1 * 2;
  return {
    expr: `${n} × 4`,
    answer: n * 4,
    ops: [n],
    steps: [
      { label: '×2', value: `${d1}` },
      { label: '×2', value: `${d2}`, gold: true }
    ]
  };
}

/** 2. გამრავლება 25-ზე — ÷4, მერე ×100. n არის 4-ის ჯერადი, [8, 96]. */
function genMul25(rng: Rng): TrickExample {
  const n = randInt(rng, 2, 24) * 4; // 8..96, multiple of 4
  const quarter = n / 4;
  return {
    expr: `${n} × 25`,
    answer: n * 25,
    ops: [n],
    steps: [
      { label: '÷4', value: `${quarter}` },
      { label: '×100', value: `${n * 25}`, gold: true }
    ]
  };
}

/** 3. გამრავლება 99-ზე — ×100, მერე −n. n ∈ [12, 98]. */
function genMul99(rng: Rng): TrickExample {
  const n = randInt(rng, 12, 98);
  return {
    expr: `${n} × 99`,
    answer: n * 99,
    ops: [n],
    steps: [
      { label: '×100', value: `${n * 100}` },
      { label: `−${n}`, value: `${n * 99}`, gold: true }
    ]
  };
}

/** 4. ერთი ათეული, ერთეულების ჯამი 10. x=10t+a, y=10t+b, b=10−a. */
function genMulSameTen(rng: Rng): TrickExample {
  const t = randInt(rng, 1, 9);
  const a = randInt(rng, 1, 9);
  const b = 10 - a;
  const x = t * 10 + a;
  const y = t * 10 + b;
  const left = t * (t + 1);
  const right = a * b;
  return {
    expr: `${x} × ${y}`,
    answer: x * y,
    ops: [x, y],
    steps: [
      { label: `${t}×${t + 1}`, value: `${left}` },
      { label: `${a}×${b}`, value: pad2(right) },
      { label: 'პასუხი', value: `${x * y}`, gold: true }
    ]
  };
}

/** 5. გაორმაგება და განახევრება. a ლუწი [12,48], b მთავრდება 5-ზე [15,95]. */
function genDoubleHalve(rng: Rng): TrickExample {
  const a = randInt(rng, 6, 24) * 2; // 12..48, even
  const b = randInt(rng, 1, 9) * 10 + 5; // 15..95, ends in 5
  const ha = a / 2;
  const db = b * 2;
  return {
    expr: `${a} × ${b}`,
    answer: a * b,
    ops: [a, b],
    steps: [
      { label: 'გარდაქმნა', value: `${ha} × ${db}` },
      { label: 'პასუხი', value: `${a * b}`, gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// § შეკრება
// ---------------------------------------------------------------------------

/** 6. ათეულის წყვილები. 4 ან 6 ციფრი [1,9], დაწყვილებული ჯამით 10, არეული. */
function genTenPairs(rng: Rng): TrickExample {
  const pairs = pick(rng, [2, 3]);
  const nums: number[] = [];
  for (let i = 0; i < pairs; i++) {
    const a = randInt(rng, 1, 9);
    nums.push(a, 10 - a);
  }
  const mixed = shuffle(rng, nums);
  const total = pairs * 10;
  return {
    expr: mixed.join(' + '),
    answer: total,
    ops: mixed,
    steps: [
      { label: 'წყვილები', value: Array(pairs).fill('10').join(' + ') },
      { label: 'ჯამი', value: `${total}`, gold: true }
    ]
  };
}

/** 7. 99-ის დამატება — +100, მერე −1. n ∈ [101, 899]. */
function genAdd99(rng: Rng): TrickExample {
  const n = randInt(rng, 101, 899);
  return {
    expr: `${n} + 99`,
    answer: n + 99,
    ops: [n],
    steps: [
      { label: '+100', value: `${n + 100}` },
      { label: '−1', value: `${n + 99}`, gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// § გამოკლება
// ---------------------------------------------------------------------------

/** 8. 1000-დან გამოკლება — ციფრები 9-ს, ბოლო 10-ს. n ∈ [101,999], ბოლო ≠ 0. */
function genSub1000(rng: Rng): TrickExample {
  let n = randInt(rng, 101, 999);
  if (n % 10 === 0) n += randInt(rng, 1, 9); // ensure last digit ≠ 0
  if (n > 999) n -= 10;
  const d1 = Math.floor(n / 100);
  const d2 = Math.floor((n % 100) / 10);
  const d3 = n % 10;
  return {
    expr: `1000 − ${n}`,
    answer: 1000 - n,
    ops: [n],
    steps: [
      { label: '9−, 9−', value: `${9 - d1} ${9 - d2}` },
      { label: '10−', value: `${10 - d3}`, gold: true }
    ]
  };
}

/** 9. ზევით დათვლა. b ∈ [21,79] (ერთეული ≠ 0), a ∈ [nextTen(b)+1, 99]. */
function genCountUp(rng: Rng): TrickExample {
  let b = randInt(rng, 21, 79);
  if (b % 10 === 0) b += 1; // ones ≠ 0
  const up = nextTen(b);
  const a = randInt(rng, up + 1, 99);
  const toTen = up - b;
  const rest = a - up;
  return {
    expr: `${a} − ${b}`,
    answer: a - b,
    ops: [a, b],
    steps: [
      { label: `${b}→${up}`, value: `${toTen}` },
      { label: `${up}→${a}`, value: `${rest}` },
      { label: 'ჯამი', value: `${a - b}`, gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// § გაყოფა
// ---------------------------------------------------------------------------

/** 10. გაყოფა 5-ზე — ×2, ÷10. n არის 5-ის ჯერადი [15,495], ხშირად არა 10-ის. */
function genDiv5(rng: Rng): TrickExample {
  // Bias toward numbers ending in 5 (not multiples of 10) in >half the cases.
  const endsIn5 = rng() < 0.6;
  let n: number;
  if (endsIn5) {
    n = randInt(rng, 1, 49) * 10 + 5; // 15..495, ends in 5
  } else {
    n = randInt(rng, 2, 49) * 10; // 20..490, ends in 0
  }
  return {
    expr: `${n} ÷ 5`,
    answer: n / 5,
    ops: [n],
    steps: [
      { label: '×2', value: `${n * 2}` },
      { label: '÷10', value: `${n / 5}`, gold: true }
    ]
  };
}

/** 11. იყოფა თუ არა 3-ზე? სამნიშნა, ~50% იყოფა. */
function genDiv3(rng: Rng): TrickExample {
  let n: number;
  if (rng() < 0.5) {
    n = randInt(rng, 34, 333) * 3; // divisible, 102..999
  } else {
    n = randInt(rng, 100, 999);
    if (n % 3 === 0) n += 1; // force not divisible
    if (n > 999) n -= 3;
  }
  const digitSum = `${n}`.split('').reduce((s, c) => s + Number(c), 0);
  const divisible = n % 3 === 0;
  return {
    expr: `${n}`,
    answer: divisible ? 'კი' : 'არა',
    choice: true,
    ops: [n],
    steps: [
      { label: 'ციფრების ჯამი', value: `${digitSum}` },
      divisible
        ? { label: 'იყოფა', value: `${n} ÷ 3 = ${n / 3}`, gold: true }
        : { label: 'არ იყოფა', value: '—', gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// § პროცენტები
// ---------------------------------------------------------------------------

/** 12. პროცენტის გადატრიალება. y ∈ {10,20,25,50}, x ∈ [4,96], პასუხი მთელი. */
function genPctFlip(rng: Rng): TrickExample {
  const y = pick(rng, [10, 20, 25, 50]);
  // x must make x*y/100 an integer: step = 100 / gcd(y,100).
  const step = 100 / gcd(y, 100);
  const lo = Math.ceil(4 / step) * step;
  const hi = Math.floor(96 / step) * step;
  const x = lo + step * randInt(rng, 0, (hi - lo) / step);
  const answer = (x * y) / 100;
  return {
    expr: `${y}-ის ${x}%`,
    answer,
    ops: [y, x],
    steps: [
      { label: 'გადაბრუნება', value: `${x}-ის ${y}%` },
      { label: 'პასუხი', value: `${answer}`, gold: true }
    ]
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** 13. 5%-ის გამოთვლა — 10%, მერე ÷2. n არის 20-ის ჯერადი [40,980]. */
function genPct5(rng: Rng): TrickExample {
  const n = randInt(rng, 2, 49) * 20; // 40..980, multiple of 20
  const ten = n / 10;
  const five = n / 20;
  return {
    expr: `${n}-ის 5%`,
    answer: five,
    ops: [n],
    steps: [
      { label: '10%', value: `${ten}` },
      { label: '÷2', value: `${five}`, gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// § კვადრატები
// ---------------------------------------------------------------------------

/** 14. მეზობელი რიცხვის კვადრატი. n = 10k+1, k ∈ [1,9] → მხოლოდ 9 უნიკალური. */
function genSquareNeighbor(rng: Rng): TrickExample {
  const k = randInt(rng, 1, 9);
  const base = k * 10; // (10k)
  const n = base + 1;
  return {
    expr: `${n}²`,
    answer: n * n,
    ops: [n],
    steps: [
      { label: `${base}²`, value: `${base * base}` },
      { label: `+${base}+${n}`, value: `${n * n}`, gold: true }
    ]
  };
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/** One example-factory per trick key (shared by Learn + Practice). */
export const TRICK_GENERATORS: Record<string, (rng: Rng) => TrickExample> = {
  mul4: genMul4,
  mul25: genMul25,
  mul99: genMul99,
  mulSameTen: genMulSameTen,
  doubleHalve: genDoubleHalve,
  tenPairs: genTenPairs,
  add99Big: genAdd99,
  sub1000: genSub1000,
  countUp: genCountUp,
  div5: genDiv5,
  div3check: genDiv3,
  pctFlip: genPctFlip,
  pct5: genPct5,
  sqNeighbor: genSquareNeighbor
};

/**
 * Generate `count` examples for a trick, unique by `expr`. For tricks whose
 * domain is smaller than `count` (e.g. sqNeighbor has only 9), returns as many
 * unique examples as the domain allows.
 */
export function generate(key: string, rng: Rng, count = 10): TrickExample[] {
  const factory = TRICK_GENERATORS[key];
  if (!factory) return [];
  const out: TrickExample[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 60;
  while (out.length < count && attempts < maxAttempts) {
    attempts++;
    const ex = factory(rng);
    if (seen.has(ex.expr)) continue;
    seen.add(ex.expr);
    out.push(ex);
  }
  return out;
}
