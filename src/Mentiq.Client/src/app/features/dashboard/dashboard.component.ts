import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ProgressResponse, ProgressService } from '../../core/services/progress.service';
import { ProgressionService } from '../../core/services/progression.service';
import { SubscriptionBannerComponent } from '../../shared/subscription-banner.component';
import {
  Belt as BeltColor,
  BeltBadgeComponent,
  MasteryBarComponent,
  NextStepCardComponent
} from '../../shared/ui';
import { DailyChallengeCardComponent } from './daily-challenge-card.component';

/** Lesson id → title, mirrors the learn catalogue — only for the "new trick" nudge. */
const LESSON_TITLES: Record<string, string> = {
  'round-up': 'მრგვალამდე მიდი, დაუმატე',
  'left-to-right': 'მარცხნიდან მარჯვნივ',
  'add9': '9-ის დამატება',
  'sub-round': 'მრგვალამდე გამოკლება',
  'halving': 'გაჩერებული განახევრება',
  'mul5': 'გამრავლება 5-ზე',
  'mul11': 'გამრავლება 11-ზე',
  'mul9-fingers': '9-ზე თითებით',
  'sq5': '5-ით დამთავრებული კვადრატი',
  'pct10': '10%-ის გამოთვლა',
  'pct15': '15%-ის გამოთვლა თავში'
};

interface SkillRow {
  key: string;
  name: string;
  unlocked: boolean;
  maxed: boolean;
  beltId: BeltColor;
  beltName: string;
  accuracy: number;
  answersCount: number;
  remaining: number;
  requiresText: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    SubscriptionBannerComponent,
    DailyChallengeCardComponent,
    BeltBadgeComponent,
    MasteryBarComponent,
    NextStepCardComponent
  ],
  template: `
    <div class="top">
      <div>
        <div class="ge-label">{{ today() }}</div>
        <h2>გამარჯობა, {{ firstName() }}.</h2>
      </div>
      <div class="spacer"></div>
    </div>

    <app-subscription-banner />

    <!-- 1 · Next step (primary, progression-driven) -->
    @if (newTrick(); as t) {
      <app-next-step-card
        [belt]="nsBeltId()"
        kicker="— ახალი ხრიკი გაიხსნა"
        [title]="'ახალი ხრიკი: ' + t.title"
        [sub]="nsBeltName() + ' ქამარი — ჯერ ისწავლე ხრიკი, მერე ივარჯიშე.'">
        <a ns-cta routerLink="/learn" class="ns-cta">ისწავლე</a>
      </app-next-step-card>
    } @else {
      @if (ns(); as n) {
        <app-next-step-card
          [belt]="nsBeltId()"
          kicker="— შემდეგი ნაბიჯი"
          [title]="n.name + ' · ' + nsBeltName() + ' ქამარი'"
          [sub]="nsSub()">
          <a ns-cta routerLink="/practice" [queryParams]="{ op: n.skill }" class="ns-cta">გაგრძელება →</a>
        </app-next-step-card>
      } @else if (loaded()) {
        <app-next-step-card
          kicker="— შესანიშნავი"
          title="ყველა ქამარი აღებულია"
          sub="გაიარე ყველა უნარი. განაგრძე ფორმის შესანარჩუნებლად.">
          <a ns-cta routerLink="/practice" class="ns-cta">ივარჯიშე →</a>
        </app-next-step-card>
      } @else {
        <app-next-step-card
          kicker="— ვარჯიში"
          title="დროა ივარჯიშო"
          sub="დაიწყე სავარჯიშო სესია და დაიწყე ქამრების აღება.">
          <a ns-cta routerLink="/practice" class="ns-cta">ვარჯიში →</a>
        </app-next-step-card>
      }
    }

    <!-- 2 · My belts -->
    @if (skillRows().length) {
      <div class="ui-card card-secondary" style="margin-top:20px;">
        <div style="display:flex; align-items:baseline; margin-bottom:16px;">
          <div class="ge-label" style="color:var(--gold);">— ჩემი ქამრები</div>
          <a routerLink="/learn" style="margin-left:auto; font-size:var(--text-sm); color:var(--gold);">ხრიკები →</a>
        </div>
        <div class="belts-grid">
          @for (s of skillRows(); track s.key) {
            @if (s.unlocked) {
              <a routerLink="/practice" [queryParams]="{ op: s.key }" class="skill-row">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-family:var(--ge-serif); font-size:var(--text-lg);">{{ s.name }}</span>
                  <app-belt-badge [belt]="s.beltId" [label]="s.beltName" />
                </div>
                @if (s.maxed) {
                  <app-mastery-bar [value]="100" [belt]="s.beltId" [showValue]="false" />
                  <div class="ge-label">✓ ოსტატი — უმაღლესი ქამარი</div>
                } @else {
                  <app-mastery-bar [value]="s.accuracy" [belt]="s.beltId" />
                  @if (s.remaining > 0) {
                    <div class="ge-label">{{ s.answersCount }}/{{ window() }} პასუხი · სიზუსტე {{ s.accuracy }}% · კიდევ {{ s.remaining }} პასუხი</div>
                  } @else {
                    <div class="ge-label">{{ s.answersCount }}/{{ window() }} პასუხი · სიზუსტე {{ s.accuracy }}% · ფანჯარა სავსეა</div>
                  }
                }
              </a>
            } @else {
              <div class="skill-row is-locked-progress">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-family:var(--ge-serif); font-size:var(--text-lg);">{{ s.name }}</span>
                </div>
                <span class="lock-progress">🔒 {{ s.requiresText }}</span>
              </div>
            }
          }
        </div>
      </div>
    }

    <!-- 3 · Daily challenge + streak (secondary, compact) -->
    <div class="duo-grid" style="margin-top:20px;">
      <div class="ui-card card-secondary">
        <app-daily-challenge-card />
      </div>

      <div class="ui-card card-secondary" style="display:flex; align-items:center; gap:20px;">
        <div class="streak-ring">
          <svg viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--hair)" stroke-width="5"/>
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round"
              [attr.stroke-dasharray]="streakCirc"
              [attr.stroke-dashoffset]="streakOffset()"
              transform="rotate(-90 42 42)"/>
          </svg>
          <div class="sr-val">{{ dayStreak() }}</div>
        </div>
        <div style="min-width:0;">
          <div class="ge-label" style="color:var(--gold);">— შენი სერია</div>
          <div style="font-family:var(--ge-serif); font-size:var(--text-lg); margin:4px 0 2px;">დღიანი სერია</div>
          <div class="ge-label">საუკეთესო: ×{{ bestStreak() }}</div>
          <a routerLink="/achievements" style="font-size:var(--text-sm); color:var(--gold); display:inline-block; margin-top:8px;">★ მიღწევები →</a>
        </div>
      </div>
    </div>

    <!-- 4 · Stats (muted) -->
    <div class="stats-grid">
      <!-- Accuracy (with low-data guard) -->
      <div class="ui-card card-muted">
        <div class="ge-label">საშუალო სიზუსტე</div>
        @if (enoughData()) {
          <div style="font-family:var(--ge-serif); font-size:40px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ avgAccuracy() }}<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);">%</span></div>
          <div class="ge-label">{{ totalSessions() }} ვარჯიშის მიხედვით</div>
        } @else {
          <div style="font-family:var(--ge-serif); font-size:var(--text-lg); margin:10px 0 4px; line-height:1.3;">ჯერ ცოტა მონაცემია</div>
          <div class="ge-label">გააკეთე კიდევ {{ needMore() }} პასუხი</div>
        }
      </div>
      <!-- Time -->
      <div class="ui-card card-muted">
        <div class="ge-label">საშუალო დრო</div>
        @if (enoughData()) {
          <div style="font-family:var(--ge-serif); font-size:40px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ avgSeconds() }}<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);">წმ</span></div>
          <div class="ge-label">კითხვაზე</div>
        } @else {
          <div style="font-family:var(--ge-serif); font-size:var(--text-lg); margin:10px 0 4px; line-height:1.3;">ჯერ ცოტა მონაცემია</div>
          <div class="ge-label">გააკეთე კიდევ {{ needMore() }} პასუხი</div>
        }
      </div>
      <!-- Weekly -->
      <div class="ui-card card-muted">
        <div class="ge-label">კვირის ვარჯიშები</div>
        <div style="font-family:var(--ge-serif); font-size:40px; margin:8px 0 6px; font-feature-settings:'tnum';">{{ weekActive() }}<span style="font-size:20px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> / 7</span></div>
        <div style="display:flex; gap:6px; margin-top:10px;">
          @for (d of week(); track $index) {
            <span style="flex:1; height:20px; border-radius:4px;" [style.background]="d ? 'var(--gold)' : 'color-mix(in srgb, var(--ink) 12%, transparent)'"></span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .belts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 24px; }
      .skill-row {
        display: flex; flex-direction: column; gap: 8px; padding: 14px 16px;
        border: 1px solid var(--hair); border-radius: var(--radius-card);
        background: #fff; text-decoration: none; color: var(--ink);
      }
      a.skill-row:hover { border-color: color-mix(in srgb, var(--belt, var(--gold)) 55%, var(--hair)); }
      .duo-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; align-items: stretch; }
      .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
      .streak-ring { position: relative; width: 84px; height: 84px; flex: none; display: grid; place-items: center; }
      .streak-ring svg { width: 100%; height: 100%; }
      .streak-ring .sr-val {
        position: absolute; inset: 0; display: grid; place-items: center;
        font-family: var(--ge-serif); font-size: 30px; color: var(--gold); line-height: 1;
      }
      @media (max-width: 760px) {
        .belts-grid { grid-template-columns: 1fr; }
        .duo-grid { grid-template-columns: 1fr; }
        .stats-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly progressSvc = inject(ProgressService);
  private readonly prog = inject(ProgressionService);

  private readonly p = signal<ProgressResponse | null>(null);

  private readonly kaDays = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
  private readonly kaMonths = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

  readonly streakCirc = 2 * Math.PI * 36;

  constructor() {
    this.progressSvc.getProgress().subscribe({ next: (d) => this.p.set(d) });
    this.prog.load().subscribe({ error: () => {} });
  }

  firstName(): string {
    return (this.auth.user()?.displayName ?? 'გიორგი').split(' ')[0];
  }

  today(): string {
    const d = new Date();
    return `${this.kaDays[d.getDay()]}, ${d.getDate()} ${this.kaMonths[d.getMonth()]}`;
  }

  // ---- Next step (progression) ----
  readonly window = computed(() => this.prog.state()?.masteryWindow ?? 20);
  readonly minAcc = computed(() => this.prog.state()?.minAccuracyPercent ?? 90);

  readonly loaded = computed(() => this.prog.state() !== null);
  readonly ns = computed(() => this.prog.nextStep());
  readonly nsBeltId = computed<BeltColor>(() => {
    const n = this.ns();
    return ((n ? this.prog.currentBelt(n.skill)?.id : null) ?? 'white') as BeltColor;
  });
  readonly nsBeltName = computed(() => {
    const n = this.ns();
    return (n ? this.prog.currentBelt(n.skill)?.name : '') ?? '';
  });
  readonly nsSub = computed(() => {
    const n = this.ns();
    if (!n) return '';
    const m = this.prog.masteryProgress(n.skill);
    const base = `${m.answersCount}/${this.window()} პასუხი · სიზუსტე ${m.accuracy}% (საჭ. ${this.minAcc()}%)`;
    const remaining = Math.max(0, this.window() - m.answersCount);
    if (remaining > 0) {
      const drills = Math.ceil(remaining / 10);
      return `${base} — კიდევ ${remaining} პასუხი (~${drills} ვარჯიში)`;
    }
    return `${base} — ფანჯარა სავსეა`;
  });

  /** A trick freshly available at the current belt (answersCount 0 = just promoted / not practised). */
  readonly newTrick = computed(() => {
    const n = this.ns();
    if (!n) return null;
    if (this.prog.masteryProgress(n.skill).answersCount > 0) return null;
    const skill = this.prog.skills().find((s) => s.key === n.skill);
    const id = skill?.lessonsByBelt?.[n.beltIndex]?.[0];
    if (!id) return null;
    return { id, title: LESSON_TITLES[id] ?? id };
  });

  // ---- My belts ----
  readonly skillRows = computed<SkillRow[]>(() => {
    const topIndex = this.prog.belts().length - 1;
    return this.prog.skills().map((s) => {
      const belt = this.prog.belts().find((b) => b.index === s.beltIndex) ?? null;
      const m = this.prog.masteryProgress(s.key);
      return {
        key: s.key,
        name: s.name,
        unlocked: s.unlocked,
        maxed: topIndex >= 0 && s.beltIndex >= topIndex,
        beltId: (s.beltId ?? 'white') as BeltColor,
        beltName: belt?.name ?? '',
        accuracy: m.accuracy,
        answersCount: m.answersCount,
        remaining: Math.max(0, (this.prog.state()?.masteryWindow ?? 20) - m.answersCount),
        requiresText: s.unlocked || !s.requires ? null : this.reqText(s.requires.skill, s.requires.beltIndex)
      };
    });
  });

  private reqText(skillKey: string, beltIndex: number): string {
    const sk = this.prog.skills().find((s) => s.key === skillKey);
    const belt = this.prog.belts().find((b) => b.index === beltIndex);
    return `ჯერ გაიარე: ${sk?.name ?? skillKey} · ${belt?.name ?? ''} ქამარი`;
  }

  // ---- Streak ----
  readonly dayStreak = computed(() => this.p()?.dayStreak ?? 0);
  readonly bestStreak = computed(() => this.p()?.bestStreak ?? 0);
  readonly streakOffset = computed(() => {
    const pct = Math.min(1, this.dayStreak() / 7);
    return this.streakCirc - pct * this.streakCirc;
  });

  // ---- Stats (with low-data guard) ----
  readonly totalSessions = computed(() => this.p()?.totalSessions ?? 0);
  readonly totalQuestions = computed(() => this.p()?.totalQuestions ?? 0);
  readonly avgAccuracy = computed(() => this.p()?.avgAccuracy ?? 0);
  readonly avgSeconds = computed(() => this.p()?.avgSeconds ?? 0);
  readonly enoughData = computed(() => this.totalQuestions() >= 20);
  readonly needMore = computed(() => Math.max(1, 20 - this.totalQuestions()));

  readonly week = computed(() => (this.p()?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0]).map((n) => n > 0));
  readonly weekActive = computed(() => this.week().filter(Boolean).length);
}
