import {
  TRICK_GENERATORS,
  TrickExample,
  Rng,
  mulberry32,
  generate
} from './trick-generators';

/** Run `fn` across 1000 seeded generations of a trick. */
function each(key: string, fn: (ex: TrickExample) => void): void {
  const rng: Rng = mulberry32(0xc0ffee ^ key.length);
  const gen = TRICK_GENERATORS[key];
  for (let i = 0; i < 1000; i++) fn(gen(rng));
}

const digitSum = (n: number): number =>
  `${n}`.split('').reduce((s, c) => s + Number(c), 0);

describe('trick-generators', () => {
  it('every registered trick produces a well-formed example', () => {
    const rng = mulberry32(1);
    for (const key of Object.keys(TRICK_GENERATORS)) {
      const ex = TRICK_GENERATORS[key](rng);
      expect(ex.expr.length).toBeGreaterThan(0);
      expect(ex.steps.length).toBeGreaterThan(0);
      expect(ex.ops.length).toBeGreaterThan(0);
    }
  });

  describe('mul4', () => {
    it('n ∈ [12,49], answer = n×4', () => {
      each('mul4', (ex) => {
        const [n] = ex.ops;
        expect(n).toBeGreaterThanOrEqual(12);
        expect(n).toBeLessThanOrEqual(49);
        expect(ex.answer).toBe(n * 4);
      });
    });
  });

  describe('mul25', () => {
    it('n is a multiple of 4 in [8,96], answer = n×25', () => {
      each('mul25', (ex) => {
        const [n] = ex.ops;
        expect(n % 4).toBe(0);
        expect(n).toBeGreaterThanOrEqual(8);
        expect(n).toBeLessThanOrEqual(96);
        expect(ex.answer).toBe(n * 25);
      });
    });
  });

  describe('mul99', () => {
    it('n ∈ [12,98], answer = n×99', () => {
      each('mul99', (ex) => {
        const [n] = ex.ops;
        expect(n).toBeGreaterThanOrEqual(12);
        expect(n).toBeLessThanOrEqual(98);
        expect(ex.answer).toBe(n * 99);
      });
    });
  });

  describe('mulSameTen', () => {
    it('same tens, ones sum to 10, answer = x×y', () => {
      each('mulSameTen', (ex) => {
        const [x, y] = ex.ops;
        expect(Math.floor(x / 10)).toBe(Math.floor(y / 10));
        expect((x % 10) + (y % 10)).toBe(10);
        expect(ex.answer).toBe(x * y);
      });
    });
  });

  describe('doubleHalve', () => {
    it('a even [12,48], b ends in 5 [15,95], answer = a×b', () => {
      each('doubleHalve', (ex) => {
        const [a, b] = ex.ops;
        expect(a % 2).toBe(0);
        expect(a).toBeGreaterThanOrEqual(12);
        expect(a).toBeLessThanOrEqual(48);
        expect(b % 10).toBe(5);
        expect(b).toBeGreaterThanOrEqual(15);
        expect(b).toBeLessThanOrEqual(95);
        expect(ex.answer).toBe(a * b);
      });
    });
  });

  describe('tenPairs', () => {
    it('4 or 6 digits that pair to 10, answer = sum = 10×pairs', () => {
      each('tenPairs', (ex) => {
        const nums = ex.ops;
        expect([4, 6]).toContain(nums.length);
        const sum = nums.reduce((s, n) => s + n, 0);
        expect(ex.answer).toBe(sum);
        expect(sum).toBe((nums.length / 2) * 10);
        // multiset pairs to 10: count(v) === count(10−v)
        const count: Record<number, number> = {};
        nums.forEach((n) => (count[n] = (count[n] ?? 0) + 1));
        nums.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(9);
          expect(count[n]).toBe(count[10 - n] ?? 0);
        });
      });
    });
  });

  describe('add99Big', () => {
    it('n ∈ [101,899], answer = n+99', () => {
      each('add99Big', (ex) => {
        const [n] = ex.ops;
        expect(n).toBeGreaterThanOrEqual(101);
        expect(n).toBeLessThanOrEqual(899);
        expect(ex.answer).toBe(n + 99);
      });
    });
  });

  describe('sub1000', () => {
    it('n ∈ [101,999] last digit ≠ 0, answer = 1000−n and matches digit trick', () => {
      each('sub1000', (ex) => {
        const [n] = ex.ops;
        expect(n).toBeGreaterThanOrEqual(101);
        expect(n).toBeLessThanOrEqual(999);
        expect(n % 10).not.toBe(0);
        expect(ex.answer).toBe(1000 - n);
        const d1 = Math.floor(n / 100);
        const d2 = Math.floor((n % 100) / 10);
        const d3 = n % 10;
        const viaTrick = Number(`${9 - d1}${9 - d2}${10 - d3}`);
        expect(viaTrick).toBe(1000 - n);
      });
    });
  });

  describe('countUp', () => {
    it('b ones ≠ 0, a > b, answer = a−b = toTen + rest', () => {
      each('countUp', (ex) => {
        const [a, b] = ex.ops;
        expect(b % 10).not.toBe(0);
        expect(a).toBeGreaterThan(b);
        expect(a).toBeLessThanOrEqual(99);
        const up = Math.floor(b / 10) * 10 + 10;
        expect((up - b) + (a - up)).toBe(a - b);
        expect(ex.answer).toBe(a - b);
      });
    });
  });

  describe('div5', () => {
    it('n multiple of 5 in [15,495], answer = n/5', () => {
      each('div5', (ex) => {
        const [n] = ex.ops;
        expect(n % 5).toBe(0);
        expect(n).toBeGreaterThanOrEqual(15);
        expect(n).toBeLessThanOrEqual(495);
        expect(ex.answer).toBe(n / 5);
      });
    });
    it('mostly not multiples of 10', () => {
      let endsIn5 = 0;
      each('div5', (ex) => {
        if (ex.ops[0] % 10 === 5) endsIn5++;
      });
      expect(endsIn5).toBeGreaterThan(400); // ~60%
    });
  });

  describe('div3check', () => {
    it('3-digit, answer ("კი"/"არა") matches 3-divisibility and digit-sum rule', () => {
      each('div3check', (ex) => {
        const [n] = ex.ops;
        expect(n).toBeGreaterThanOrEqual(100);
        expect(n).toBeLessThanOrEqual(999);
        expect(ex.choice).toBeTrue();
        const divisible = n % 3 === 0;
        expect(ex.answer).toBe(divisible ? 'კი' : 'არა');
        expect(digitSum(n) % 3 === 0).toBe(divisible);
      });
    });
    it('roughly half are divisible', () => {
      let yes = 0;
      each('div3check', (ex) => {
        if (ex.answer === 'კი') yes++;
      });
      expect(yes).toBeGreaterThan(300);
      expect(yes).toBeLessThan(700);
    });
  });

  describe('pctFlip', () => {
    it('y ∈ {10,20,25,50}, x ∈ [4,96], integer answer = x·y/100', () => {
      each('pctFlip', (ex) => {
        const [y, x] = ex.ops;
        expect([10, 20, 25, 50]).toContain(y);
        expect(x).toBeGreaterThanOrEqual(4);
        expect(x).toBeLessThanOrEqual(96);
        expect(Number.isInteger(ex.answer as number)).toBeTrue();
        expect(ex.answer).toBe((x * y) / 100);
      });
    });
  });

  describe('pct5', () => {
    it('n multiple of 20 in [40,980], answer = n/20', () => {
      each('pct5', (ex) => {
        const [n] = ex.ops;
        expect(n % 20).toBe(0);
        expect(n).toBeGreaterThanOrEqual(40);
        expect(n).toBeLessThanOrEqual(980);
        expect(ex.answer).toBe(n / 20);
      });
    });
  });

  describe('sqNeighbor', () => {
    it('n = 10k+1, k ∈ [1,9], answer = n²', () => {
      each('sqNeighbor', (ex) => {
        const [n] = ex.ops;
        expect((n - 1) % 10).toBe(0);
        const k = (n - 1) / 10;
        expect(k).toBeGreaterThanOrEqual(1);
        expect(k).toBeLessThanOrEqual(9);
        expect(ex.answer).toBe(n * n);
      });
    });
  });

  describe('generate() uniqueness', () => {
    const keys = Object.keys(TRICK_GENERATORS);
    it('returns unique examples each batch', () => {
      for (const key of keys) {
        const rng = mulberry32(42 + key.length);
        const want = key === 'sqNeighbor' ? 9 : 10;
        const batch = generate(key, rng, want);
        const exprs = new Set(batch.map((e) => e.expr));
        expect(batch.length).toBe(want);
        expect(exprs.size).toBe(want);
      }
    });
  });
});
