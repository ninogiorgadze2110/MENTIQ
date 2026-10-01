import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  CompetitionDetailDto,
  CompetitionDto,
  CompetitionService
} from '../../core/services/competition.service';
import { LeagueService, MyLeague, LeagueRankRow } from '../../core/services/league.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

type Tab = 'league' | 'friends';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .lb-row.me { background: color-mix(in srgb, var(--gold) 8%, transparent); }
      .medal { font-family: var(--ge-serif); font-size: 16px; }
      .rank { font-family: var(--ge-serif); font-size: 15px; color: color-mix(in srgb, var(--ink) 60%, transparent); width: 56px; }
      .cc { border: 1px solid var(--hair); background: #fff; padding: 22px 24px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
      .cc + .cc { border-top: 0; }
      .badge2 { font-size: var(--text-xs); padding: 4px 10px; }
      .b-active { background: color-mix(in srgb, var(--gold) 14%, transparent); color: var(--color-accent-800); }
      .b-ended { background: var(--color-neutral-200); color: var(--color-neutral-700); }
      .seg { display: inline-flex; border: 1px solid var(--hair); overflow: hidden; border-radius: var(--radius-pill); }
      .seg button { border: 0; background: transparent; font: inherit; font-family: var(--ge-serif); padding: 8px 20px; cursor: pointer; color: var(--ink); }
      .seg button + button { border-left: 1px solid var(--hair); }
      .seg button.on { background: var(--ink); color: var(--paper); }
      .tier-chip { display: inline-grid; place-items: center; width: 54px; height: 54px; border-radius: 14px; font-family: var(--ge-serif); font-size: 13px; font-weight: 600; text-align: center; line-height: 1.1; padding: 4px; }
    `
  ],
  template: `
    <div class="top">
      <div>
        <div class="ge-label">{{ myGrade() }} კლასი</div>
        <h2>შეჯიბრი</h2>
      </div>
      <div class="spacer"></div>
      @if (tab() === 'friends' && !detail() && isAdmin()) {
        <button type="button" class="btn btn-primary" style="padding:11px 20px;" (click)="showCreate.set(!showCreate())">
          {{ showCreate() ? 'დახურვა' : '+ ახალი შეჯიბრი' }}
        </button>
      }
    </div>

    <div class="seg" style="margin-bottom:24px;">
      <button type="button" [class.on]="tab() === 'league'" (click)="setTab('league')">ლიგა</button>
      <button type="button" [class.on]="tab() === 'friends'" (click)="setTab('friends')">მეგობრებთან</button>
    </div>

    <!-- ══════════ LEAGUE ══════════ -->
    @if (tab() === 'league') {
      @if (leagueLoading()) {
        <p class="muted">იტვირთება…</p>
      } @else {
        @if (league(); as lg) {
        <div class="ui-card card-secondary" style="margin-bottom:20px; display:flex; gap:24px; flex-wrap:wrap; align-items:center;">
          <div style="display:flex; align-items:center; gap:14px;">
            <span class="tier-chip" [style.background]="tierBg(lg.tierIndex)" [style.color]="tierFg(lg.tierIndex)">{{ lg.tierName }}</span>
            <div>
              <div class="ge-label" style="color:var(--gold);">— ჩემი ლიგა</div>
              <div style="font-family:var(--ge-serif); font-size:20px; margin-top:2px;">{{ lg.tierName }} ლიგა · {{ lg.grade }} კლასი</div>
            </div>
          </div>
          <div style="margin-left:auto; display:flex; gap:28px; flex-wrap:wrap;">
            <div><div class="ge-label">ჩემი ადგილი</div><div style="font-family:var(--ge-serif); font-size:28px; font-feature-settings:'tnum';">{{ lg.myRank ? '#' + lg.myRank : '—' }}<span style="font-size:14px; color:color-mix(in srgb, var(--ink) 50%, transparent);"> / {{ lg.participantCount }}</span></div></div>
            <div><div class="ge-label">ჩემი ქულა</div><div style="font-family:var(--ge-serif); font-size:28px; color:var(--gold); font-feature-settings:'tnum';">{{ lg.myPoints }}</div></div>
            <div><div class="ge-label">დარჩენილი დრო</div><div style="font-family:var(--ge-serif); font-size:28px;">{{ weekLeft(lg) }}</div></div>
          </div>
        </div>

        <div style="display:flex; gap:18px; font-size:12.5px; margin-bottom:10px; flex-wrap:wrap;">
          <span style="color:#2f8f57;">▲ ადის · ტოპ {{ lg.promoteCount }}</span>
          <span style="color:color-mix(in srgb, var(--ink) 55%, transparent);">— რჩება</span>
          <span style="color:#b22;">▼ ჩადის · ბოლო {{ lg.relegateCount }}</span>
        </div>

        @if (lg.entries.length) {
          <table class="table">
            <thead><tr><th style="width:64px;">#</th><th>მონაწილე</th><th style="text-align:right;">ქულა</th></tr></thead>
            <tbody>
              @for (e of lg.entries; track e.userId) {
                <tr class="lb-row" [class.me]="e.isMe" [style.background]="e.isMe ? '' : zoneBg(e.zone)">
                  <td class="rank"><span [style.color]="zoneColor(e.zone)">{{ zoneMark(e.zone) }}</span> {{ e.rank }}</td>
                  <td style="font-family:var(--ge-serif); font-size:16px;">{{ e.displayName }}@if (e.isMe) { <span style="font-size:11px; color:var(--gold); font-family:var(--ge); margin-left:6px;">(შენ)</span> }</td>
                  <td style="text-align:right; font-family:var(--ge-serif); font-size:18px; color:var(--gold); font-feature-settings:'tnum';">{{ e.points }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="muted" style="margin-top:16px;">ამ კვირაში ამ ლიგაში ჯერ არავის უვარჯიშია. დაიწყე „ჩემი დონე" ვარჯიში და გახდი პირველი!</p>
        }
      } @else {
        <p class="muted">ვერ ჩაიტვირთა.</p>
      }
      }
    }

    <!-- ══════════ FRIENDS (user-created competitions) ══════════ -->
    @if (tab() === 'friends') {
      @if (showCreate() && !detail()) {
        <div style="border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 4%, transparent); padding:26px 28px; margin-bottom:24px; max-width:640px;">
          <div style="font-family:var(--ge-serif); font-size:var(--text-xs); color:var(--gold); margin-bottom:14px;">— ახალი შეჯიბრი ({{ myGrade() }} კლასი)</div>
          <div class="field" style="margin-bottom:16px;">
            <label>დასახელება</label>
            <input class="input" type="text" [value]="title()" (input)="title.set($any($event.target).value)" placeholder="მაგ. საღამოს ბრძოლა" />
          </div>
          <div style="display:flex; gap:28px; flex-wrap:wrap; align-items:center;">
            <div>
              <div class="ge-label" style="margin-bottom:6px;">კლასი</div>
              <select class="input" style="width:110px;" [value]="newGrade()" (change)="newGrade.set(+$any($event.target).value)">
                @for (g of gradeOptions; track g) {
                  <option [value]="g">{{ g }} კლასი</option>
                }
              </select>
            </div>
            <div>
              <div class="ge-label" style="margin-bottom:6px;">ხანგრძლივობა</div>
              <div class="seg">
                @for (h of hourOptions; track h) {
                  <button type="button" [class.on]="hours() === h" (click)="hours.set(h)">{{ h }}სთ</button>
                }
              </div>
            </div>
            <div>
              <div class="ge-label" style="margin-bottom:6px;">დრო</div>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="seg">
                  @for (t of timeOptions; track t.s) {
                    <button type="button" [class.on]="quizSecs() === t.s" (click)="quizSecs.set(t.s)">{{ t.label }}</button>
                  }
                </div>
                <input class="input" type="number" min="1" max="10" style="width:60px; text-align:center;" [value]="quizMins()" (input)="setMins($any($event.target).value)" />
                <span style="font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">წუთი</span>
              </div>
            </div>
            <button type="button" class="btn btn-primary" style="margin-left:auto; padding:12px 24px;" [disabled]="creating() || !title().trim()" (click)="create()">
              {{ creating() ? '...' : 'შექმენი →' }}
            </button>
          </div>
        </div>
      }

      @if (loading()) {
        <p class="muted">იტვირთება…</p>
      } @else {
        @if (detail(); as d) {
        <button type="button" class="btn btn-secondary" style="padding:8px 16px; margin-bottom:18px;" (click)="clearDetail()">← ყველა შეჯიბრი</button>
        <div style="display:flex; align-items:baseline; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--ink); flex-wrap:wrap;">
          <h3 style="font-family:var(--ge-serif); font-size:24px; margin:0; font-weight:500;">{{ d.competition.title }}</h3>
          <span class="badge2" [class.b-active]="d.competition.status === 'active'" [class.b-ended]="d.competition.status !== 'active'">{{ statusLabel(d.competition.status) }}</span>
          <span style="margin-left:auto; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ d.competition.participants }} მონაწილე · {{ timeLeft(d.competition) }}</span>
        </div>

        @if (d.competition.status === 'active' && !d.competition.played) {
          <div style="margin:18px 0; padding:18px 22px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 5%, transparent); display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:13.5px;">ჯერ არ გითამაშია — {{ dur(d.competition.quizSeconds) }}, შერეული მაგალითები ({{ d.competition.grade }} კლასი).</span>
            <a routerLink="/practice" [queryParams]="playParams(d.competition)" class="btn btn-primary" style="margin-left:auto; padding:10px 20px;">მონაწილეობა →</a>
          </div>
        }

        @if (d.entries.length) {
          <table class="table">
            <thead><tr><th style="width:56px;">#</th><th>მონაწილე</th><th>სიზუსტე</th><th style="text-align:right;">ქულა</th></tr></thead>
            <tbody>
              @for (e of d.entries; track e.rank) {
                <tr class="lb-row" [class.me]="e.isCurrentUser">
                  <td class="rank">
                    @if (e.rank === 1) { <span class="medal" style="color:var(--gold);">①</span> }
                    @else if (e.rank === 2) { <span class="medal">②</span> }
                    @else if (e.rank === 3) { <span class="medal">③</span> }
                    @else { {{ e.rank }} }
                  </td>
                  <td style="font-family:var(--ge-serif); font-size:16px;">{{ e.displayName }}@if (e.isCurrentUser) { <span style="font-size:11px; color:var(--gold); font-family:var(--ge); margin-left:6px;">(შენ)</span> }</td>
                  <td style="font-feature-settings:'tnum'; color:color-mix(in srgb, var(--ink) 60%, transparent);">{{ e.accuracy }}%</td>
                  <td style="text-align:right; font-family:var(--ge-serif); font-size:18px; color:var(--gold); font-feature-settings:'tnum';">{{ e.score }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="muted" style="margin-top:18px;">ჯერ არავის უთამაშია. იყავი პირველი!</p>
        }
      } @else {
        <div style="display:flex; align-items:baseline; padding-bottom:12px; border-bottom:1px solid var(--hair);">
          <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">{{ myGrade() }} კლასის შეჯიბრები</h4>
        </div>
        @if (competitions().length === 0) {
          <p class="muted" style="margin-top:16px;">ჯერ შეჯიბრი არ არის. მეგობრებთან ბრძოლა შექმენი — „+ ახალი შეჯიბრი".</p>
        } @else {
          <div style="margin-top:16px;">
            @for (c of competitions(); track c.id) {
              <div class="cc">
                <div style="min-width:200px; flex:1;">
                  <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <span style="font-family:var(--ge-serif); font-size:18px;">{{ c.title }}</span>
                    <span class="badge2" [class.b-active]="c.status === 'active'" [class.b-ended]="c.status !== 'active'">{{ statusLabel(c.status) }}</span>
                  </div>
                  <div style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 60%, transparent); margin-top:4px;">
                    {{ dur(c.quizSeconds) }} · {{ c.participants }} მონაწილე · {{ timeLeft(c) }}
                    @if (c.played) { · <span style="color:var(--gold);">შენი ქულა: {{ c.myScore }}</span> }
                  </div>
                </div>
                @if (c.status === 'active' && !c.played) {
                  <a routerLink="/practice" [queryParams]="playParams(c)" class="btn btn-primary" style="padding:10px 18px;">მონაწილეობა →</a>
                } @else {
                  <button type="button" class="btn btn-secondary" style="padding:10px 18px;" (click)="open(c.id)">შედეგები →</button>
                }
              </div>
            }
          </div>
        }
        }
      }
    }
  `
})
export class CompetitionComponent {
  private readonly service = inject(CompetitionService);
  private readonly leagues = inject(LeagueService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly tab = signal<Tab>('league');

  // League
  readonly league = signal<MyLeague | null>(null);
  readonly leagueLoading = signal(true);

  // Friends competitions
  readonly loading = signal(true);
  readonly competitions = signal<CompetitionDto[]>([]);
  readonly detail = signal<CompetitionDetailDto | null>(null);
  readonly isAdmin = this.auth.isAdmin;

  readonly showCreate = signal(false);
  readonly title = signal('');
  readonly hours = signal(12);
  readonly quizSecs = signal(120);
  readonly newGrade = signal(1);
  readonly creating = signal(false);
  readonly gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  readonly hourOptions = [1, 6, 12, 24, 48];
  readonly timeOptions = [
    { s: 60, label: '1 წთ' },
    { s: 120, label: '2 წთ' },
    { s: 180, label: '3 წთ' },
    { s: 300, label: '5 წთ' }
  ];

  readonly myGrade = computed(() => this.auth.user()?.grade ?? 1);
  readonly quizMins = computed(() => Math.round(this.quizSecs() / 60));

  // Tier palette (bronze / silver / gold / diamond).
  private readonly tierBgs = ['#efe0d0', '#e8eaed', '#fdf1cf', '#e2ebf8'];
  private readonly tierFgs = ['#7a4a1e', '#5c636b', '#6b4c08', '#1b3d70'];

  constructor() {
    this.newGrade.set(this.myGrade() || 1);
    this.loadLeague();

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.tab.set('friends');
      this.open(id);
    } else {
      this.reload();
    }
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    if (t === 'league' && !this.league()) this.loadLeague();
  }

  private loadLeague(): void {
    this.leagueLoading.set(true);
    this.leagues.getMyLeague().subscribe({
      next: (lg) => { this.league.set(lg); this.leagueLoading.set(false); },
      error: () => this.leagueLoading.set(false)
    });
  }

  private reload(): void {
    this.loading.set(true);
    this.detail.set(null);
    this.service.list().subscribe({
      next: (c) => { this.competitions.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  open(id: string): void {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (d) => { this.detail.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  clearDetail(): void {
    this.reload();
  }

  create(): void {
    if (!this.title().trim() || this.creating()) return;
    this.creating.set(true);
    this.service.create({ title: this.title().trim(), grade: this.newGrade(), durationHours: this.hours(), quizSeconds: this.quizSecs() })
      .subscribe({
        next: () => {
          this.notify.success('შეჯიბრი შექმნილია!');
          this.title.set('');
          this.showCreate.set(false);
          this.creating.set(false);
          this.reload();
        },
        error: () => this.creating.set(false)
      });
  }

  playParams(c: CompetitionDto): Record<string, unknown> {
    return { mix: 1, grade: c.grade, time: c.quizSeconds, competition: c.id };
  }

  dur(sec: number): string {
    return sec % 60 === 0 ? `${sec / 60} წუთი` : `${Math.round(sec / 60)} წუთი`;
  }

  setMins(value: string): void {
    const n = Math.min(10, Math.max(1, Math.floor(Number(value) || 1)));
    this.quizSecs.set(n * 60);
  }

  statusLabel(s: string): string {
    return s === 'active' ? 'მიმდინარე' : s === 'upcoming' ? 'მალე' : 'დასრულდა';
  }

  timeLeft(c: CompetitionDto): string {
    return this.remainText(new Date(c.endsAtUtc).getTime());
  }

  weekLeft(lg: MyLeague): string {
    return this.remainText(new Date(lg.weekEndUtc).getTime());
  }

  private remainText(endMs: number): string {
    const ms = endMs - Date.now();
    if (ms <= 0) return 'დასრულდა';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return `${d}დღე ${h}სთ`;
    return h > 0 ? `${h}სთ ${m}წთ` : `${m}წთ`;
  }

  tierBg(index: number): string {
    return this.tierBgs[Math.max(0, Math.min(this.tierBgs.length - 1, index))];
  }

  tierFg(index: number): string {
    return this.tierFgs[Math.max(0, Math.min(this.tierFgs.length - 1, index))];
  }

  zoneBg(zone: LeagueRankRow['zone']): string {
    if (zone === 'up') return 'color-mix(in srgb, #2f8f57 10%, transparent)';
    if (zone === 'down') return 'color-mix(in srgb, #b22 8%, transparent)';
    return '';
  }

  zoneColor(zone: LeagueRankRow['zone']): string {
    return zone === 'up' ? '#2f8f57' : zone === 'down' ? '#b22' : 'transparent';
  }

  zoneMark(zone: LeagueRankRow['zone']): string {
    return zone === 'up' ? '▲' : zone === 'down' ? '▼' : '';
  }
}
