import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  label: string;
  text: string;
}

interface Example {
  expr: string;
  parts?: { label: string; value: string; gold?: boolean }[];
  more?: string;
}

interface Lesson {
  id: string;
  title: string;
  minutes: number;
  level?: string;
  learnedBy?: string;
  intro: string;
  steps: Step[];
  example?: Example;
  /** Practice-drill key (see TRICKS in the practice component). */
  trick?: string;
  /** Operation key for a lesson-specific drill when there is no dedicated trick. */
  op?: string;
  locked?: boolean;
}

interface Category {
  key: string;
  name: string;
  lessons: Lesson[];
}

const CATEGORIES: Category[] = [
  {
    key: 'tricks',
    name: 'მათემატიკის ხრიკები',
    lessons: [
      {
        id: 'round-up',
        title: 'მრგვალამდე მიდი, დაუმატე',
        minutes: 2,
        op: 'add',
        intro: 'შეკრებისას ჯერ ერთ რიცხვს დაამრგვალე ახლო ათეულამდე, მერე შეასწორე.',
        steps: [
          { label: 'ნაბიჯი 1', text: 'აიღე ის რიცხვი, რომელიც ახლოსაა ათეულთან. 47 + 28 → 47-ს დააკელი 3, გახდა 50.' },
          { label: 'ნაბიჯი 2', text: '50 + 28 = 78. ახლა დააბრუნე ის 3, რაც დააკელი: 78 − 3 = 75.' }
        ],
        example: { expr: '47 + 28', parts: [{ label: '50 + 28', value: '78' }, { label: '− 3', value: '75', gold: true }] }
      },
      {
        id: 'left-to-right',
        title: 'მარცხნიდან მარჯვნივ',
        minutes: 3,
        op: 'add',
        intro: 'დიდი რიცხვები უფრო ადვილია, თუ ჯერ ათეულებს შეკრებ, მერე ერთეულებს.',
        steps: [
          { label: 'ნაბიჯი 1', text: 'ჯერ ათეულები: 40 + 20 = 60.' },
          { label: 'ნაბიჯი 2', text: 'მერე ერთეულები: 7 + 8 = 15.' },
          { label: 'ნაბიჯი 3', text: 'შეკრიბე: 60 + 15 = 75.' }
        ],
        example: { expr: '47 + 28', parts: [{ label: 'ათეულები', value: '60' }, { label: 'ერთეულები', value: '15', gold: true }, { label: 'ჯამი', value: '75' }] }
      }
    ]
  },
  {
    key: 'mul',
    name: 'გამრავლება',
    lessons: [
      {
        id: 'mul11',
        title: 'გამრავლება 11-ზე',
        minutes: 3,
        level: 'დონე IV-სთვის',
        learnedBy: '12 400-მა შეისწავლა',
        trick: 'mul11',
        intro: 'როცა ორნიშნა რიცხვს 11-ზე ამრავლებ — ორი ციფრი გვერდზე გაავრცელე, შუაში კი მათი ჯამი ჩასვი.',
        steps: [
          { label: 'ნაბიჯი 1', text: 'გამოყავი ორნიშნა რიცხვის ორი ციფრი. 32 → 3 _ 2' },
          { label: 'ნაბიჯი 2', text: 'შუაში ჩასვი მათი ჯამი. 3 + 2 = 5 → 3 5 2 = 352' },
          { label: 'ნაბიჯი 3', text: 'თუ ჯამი 10 ან მეტია, ერთეული შუაში დარჩება, ათეული პირველ ციფრს დაუმატე. 87 × 11: 8+7=15 → 957' }
        ],
        example: { expr: '32 × 11', parts: [{ label: 'გვერდები', value: '3 _ 2' }, { label: 'ჯამი', value: '5', gold: true }, { label: 'პასუხი', value: '352' }], more: 'კიდევ სცადე: 45 × 11 · 63 × 11 · 87 × 11' }
      },
      {
        id: 'mul5',
        title: 'გამრავლება 5-ზე',
        minutes: 2,
        trick: 'mul5',
        intro: '5-ზე გამრავლება = გაყავი 2-ზე, მერე გაამრავლე 10-ზე.',
        steps: [
          { label: 'ნაბიჯი 1', text: 'ავიღოთ 48 × 5. ჯერ გავყოთ 2-ზე: 48 ÷ 2 = 24.' },
          { label: 'ნაბიჯი 2', text: 'მერე გავამრავლოთ 10-ზე: 24 × 10 = 240.' }
        ],
        example: { expr: '48 × 5', parts: [{ label: '÷ 2', value: '24' }, { label: '× 10', value: '240', gold: true }] }
      },
      {
        id: 'mul9-fingers',
        title: '9-ზე თითებით',
        minutes: 2,
        locked: true,
        intro: 'ერთნიშნა რიცხვის 9-ზე გამრავლება თითების დახმარებით — ვიზუალური ხრიკი პატარებისთვის.',
        steps: [
          { label: 'ნაბიჯი 1', text: 'გაშალე ორივე ხელი. დახარე ის თითი, რომელსაც ამრავლებ 9-ზე.' },
          { label: 'ნაბიჯი 2', text: 'მარცხნივ დარჩენილი თითები = ათეულები, მარჯვნივ = ერთეულები.' }
        ]
      }
    ]
  },
  {
    key: 'add',
    name: 'შეკრება',
    lessons: [
      {
        id: 'add9',
        title: '9-ის დამატება',
        minutes: 1,
        trick: 'add9',
        intro: '9-ის დამატება = დაუმატე 10, მერე გამოაკელი 1.',
        steps: [
          { label: 'ნაბიჯი 1', text: '46 + 9 → 46 + 10 = 56.' },
          { label: 'ნაბიჯი 2', text: 'გამოაკელი 1: 56 − 1 = 55.' }
        ],
        example: { expr: '46 + 9', parts: [{ label: '+ 10', value: '56' }, { label: '− 1', value: '55', gold: true }] }
      }
    ]
  },
  {
    key: 'sub',
    name: 'გამოკლება',
    lessons: [
      {
        id: 'sub-round',
        title: 'მრგვალამდე გამოკლება',
        minutes: 2,
        op: 'sub',
        intro: 'გამოკლებისას დაამრგვალე ის, რასაც აკლებ, მერე შეასწორე.',
        steps: [
          { label: 'ნაბიჯი 1', text: '73 − 28 → 73 − 30 = 43 (მოვაკელით 2 მეტი).' },
          { label: 'ნაბიჯი 2', text: 'დააბრუნე ის 2: 43 + 2 = 45.' }
        ],
        example: { expr: '73 − 28', parts: [{ label: '− 30', value: '43' }, { label: '+ 2', value: '45', gold: true }] }
      }
    ]
  },
  {
    key: 'div',
    name: 'გაყოფა',
    lessons: [
      {
        id: 'halving',
        title: 'გაჩერებული განახევრება',
        minutes: 2,
        op: 'div',
        intro: '4-ზე გაყოფა = ორჯერ განახევრება. 8-ზე = სამჯერ.',
        steps: [
          { label: 'ნაბიჯი 1', text: '96 ÷ 4 → 96 ÷ 2 = 48.' },
          { label: 'ნაბიჯი 2', text: 'კიდევ ერთხელ: 48 ÷ 2 = 24.' }
        ],
        example: { expr: '96 ÷ 4', parts: [{ label: '÷ 2', value: '48' }, { label: '÷ 2', value: '24', gold: true }] }
      }
    ]
  },
  {
    key: 'pct',
    name: 'პროცენტები',
    lessons: [
      {
        id: 'pct10',
        title: '10%-ის გამოთვლა',
        minutes: 1,
        trick: 'pct10',
        intro: 'რიცხვის 10% = მძიმის ერთი პოზიციით მარცხნივ გადაწევა.',
        steps: [
          { label: 'ნაბიჯი 1', text: '240-ის 10% → 24.0 → 24.' },
          { label: 'ნაბიჯი 2', text: '5% გინდა? აიღე 10% და გაყავი 2-ზე.' }
        ],
        example: { expr: '240-ის 10%', parts: [{ label: 'პასუხი', value: '24', gold: true }] }
      },
      {
        id: 'pct15',
        title: '15%-ის გამოთვლა თავში',
        minutes: 3,
        locked: true,
        intro: '15% = 10% + მისი ნახევარი (5%).',
        steps: [
          { label: 'ნაბიჯი 1', text: '80-ის 10% = 8.' },
          { label: 'ნაბიჯი 2', text: '5% = 8-ის ნახევარი = 4. სულ: 8 + 4 = 12.' }
        ],
        example: { expr: '80-ის 15%', parts: [{ label: '10%', value: '8' }, { label: '+ 5%', value: '12', gold: true }] }
      }
    ]
  },
  {
    key: 'squares',
    name: 'კვადრატები',
    lessons: [
      {
        id: 'sq5',
        title: '5-ით დამთავრებული კვადრატი',
        minutes: 2,
        trick: 'sq5',
        intro: '5-ით დამთავრებული რიცხვის კვადრატი: აიღე პირველი ციფრი, გაამრავლე მომდევნოზე, ბოლოში მიაწერე 25.',
        steps: [
          { label: 'ნაბიჯი 1', text: '35² → პირველი ციფრი 3, მომდევნო 4: 3 × 4 = 12.' },
          { label: 'ნაბიჯი 2', text: 'ბოლოში მიაწერე 25: 1225.' }
        ],
        example: { expr: '35²', parts: [{ label: '3 × 4', value: '12' }, { label: 'და 25', value: '1225', gold: true }] }
      }
    ]
  }
];

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .learn-grid { display: grid; grid-template-columns: 280px 1fr; gap: 0; border: 1px solid var(--hair); background: var(--paper); min-height: 640px; }
      @media (max-width: 820px) { .learn-grid { grid-template-columns: 1fr; } }
      .idx { border-right: 1px solid var(--hair); padding: 28px 22px; }
      .cat { font-family: var(--ge-serif); font-style: italic; font-size: 12px; color: color-mix(in srgb, var(--ink) 55%, transparent); margin: 18px 0 6px; }
      .cat:first-of-type { margin-top: 0; }
      .li {
        display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
        font: inherit; font-size: 13px; padding: 9px 10px; border: 0; border-top: 1px solid var(--hair);
        background: transparent; color: var(--ink); cursor: pointer;
      }
      .li:hover { background: color-mix(in srgb, var(--ink) 4%, transparent); }
      .li.on { background: color-mix(in srgb, var(--gold) 8%, transparent); color: var(--gold); font-weight: 600; }
      .li.locked { color: color-mix(in srgb, var(--ink) 40%, transparent); cursor: default; }
      .li.locked:hover { background: transparent; }
      .detail { padding: 44px 52px; min-width: 0; }
      @media (max-width: 560px) { .detail { padding: 28px 22px; } }
    `
  ],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">გაკვეთილები</div>
        <h2>ისწავლე</h2>
      </div>
    </div>

    <div class="learn-grid">
      <!-- index -->
      <div class="idx">
        <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin-bottom:8px;">— ინდექსი</div>
        <h4 style="font-family:var(--ge-serif); font-size:20px; margin:0 0 18px; font-weight:500;">{{ totalLessons }} გაკვეთილი</h4>
        @for (cat of categories; track cat.key) {
          <div class="cat">§ {{ cat.name }}</div>
          @for (lesson of cat.lessons; track lesson.id) {
            <button class="li" [class.on]="selectedId() === lesson.id" [class.locked]="lesson.locked" (click)="select(lesson)">
              <span>{{ lesson.locked ? '🔒 ' : '' }}{{ lesson.title }}</span>
            </button>
          }
        }
      </div>

      <!-- lesson detail -->
      @if (selected(); as l) {
        <div class="detail">
          <div style="font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:var(--gold);">— {{ categoryName() }}</div>
          <h1 style="font-family:var(--ge-serif); font-size:44px; margin:12px 0 8px; line-height:1.06; font-weight:500;">{{ l.title }}</h1>
          <div style="display:flex; gap:16px; font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); border-bottom:1px solid var(--hair); padding-bottom:18px; flex-wrap:wrap;">
            <span>{{ l.minutes }} წუთი</span>
            @if (l.level) { <span>· {{ l.level }}</span> }
            @if (l.learnedBy) { <span>· {{ l.learnedBy }}</span> }
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:44px; margin-top:28px;">
            <div>
              <p style="font-family:var(--ge-serif); font-size:17px; line-height:1.6; font-style:italic; color:color-mix(in srgb, var(--ink) 78%, transparent); margin:0 0 24px; border-left:2px solid var(--gold); padding-left:18px;">{{ l.intro }}</p>
              @for (step of l.steps; track step.label) {
                <div style="font-family:var(--ge-serif); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:8px;">— {{ step.label }}</div>
                <p style="font-size:14.5px; line-height:1.65; margin:0 0 20px;">{{ step.text }}</p>
              }
            </div>

            <div>
              @if (l.example; as ex) {
                <div style="border:1px solid var(--hair); background:#fff; padding:30px;">
                  <div style="font-family:var(--ge-serif); font-style:italic; color:var(--gold); font-size:13px;">— მაგალითი</div>
                  <div style="font-family:var(--ge-serif); font-size:64px; text-align:center; margin:18px 0 12px; line-height:1;">{{ ex.expr }}</div>
                  @if (ex.parts) {
                    <div style="display:grid; grid-template-columns:repeat({{ ex.parts.length }}, 1fr); gap:0; border-top:1px solid var(--hair);">
                      @for (p of ex.parts; track p.label) {
                        <div style="padding:14px 10px; text-align:center; border-right:1px solid var(--hair);">
                          <div style="font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ p.label }}</div>
                          <div style="font-family:var(--ge-serif); font-size:30px; margin-top:6px;" [style.color]="p.gold ? 'var(--gold)' : 'var(--ink)'">{{ p.value }}</div>
                        </div>
                      }
                    </div>
                  }
                  @if (ex.more) {
                    <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--hair); font-family:var(--ge-serif); font-style:italic; color:color-mix(in srgb, var(--ink) 65%, transparent); font-size:13px; text-align:center;">{{ ex.more }}</div>
                  }
                </div>
              }

              <div style="margin-top:20px; padding:20px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 5%, transparent); display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
                <div style="flex:1; min-width:160px;">
                  <div style="font-family:var(--ge-serif); font-style:italic; font-size:12px; color:var(--gold);">— ხრიკის ვარჯიში</div>
                  <div style="font-family:var(--ge-serif); font-size:20px; margin-top:4px;">{{ (l.trick || l.op) ? '10 კითხვა · 2 წუთი' : 'ივარჯიშე ამ თემაზე' }}</div>
                  <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:2px;">ხრიკი ვარჯიშით უკეთ ჯდება.</div>
                </div>
                @if (l.trick) {
                  <a routerLink="/practice" [queryParams]="{ trick: l.trick }" class="btn btn-primary" style="padding:12px 22px;">ვცადოთ →</a>
                } @else if (l.op) {
                  <a routerLink="/practice" [queryParams]="{ op: l.op }" class="btn btn-primary" style="padding:12px 22px;">ვცადოთ →</a>
                } @else {
                  <a routerLink="/practice" class="btn btn-secondary" style="padding:12px 22px;">ვარჯიში →</a>
                }
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; padding-top:28px; margin-top:28px; border-top:1px solid var(--hair); font-size:13px;">
            @if (prev(); as p) {
              <button class="li" style="border:0; padding:0; width:auto; color:color-mix(in srgb, var(--ink) 55%, transparent);" (click)="select(p)">← {{ p.title }}</button>
            }
            @if (next(); as n) {
              <button class="li" style="border:0; padding:0; width:auto; margin-left:auto; color:var(--gold);" (click)="select(n)">{{ n.title }} →</button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class LearnComponent {
  readonly categories = CATEGORIES;
  private readonly flat: Lesson[] = CATEGORIES.flatMap((c) => c.lessons);
  readonly totalLessons = this.flat.length;

  readonly selectedId = signal(this.flat[0].id);
  readonly selected = computed(() => this.flat.find((l) => l.id === this.selectedId()) ?? this.flat[0]);
  readonly categoryName = computed(() =>
    CATEGORIES.find((c) => c.lessons.some((l) => l.id === this.selectedId()))?.name ?? ''
  );

  private index = computed(() => this.flat.findIndex((l) => l.id === this.selectedId()));
  readonly prev = computed(() => (this.index() > 0 ? this.flat[this.index() - 1] : null));
  readonly next = computed(() => (this.index() < this.flat.length - 1 ? this.flat[this.index() + 1] : null));

  select(lesson: Lesson): void {
    if (lesson.locked) return;
    this.selectedId.set(lesson.id);
  }
}
