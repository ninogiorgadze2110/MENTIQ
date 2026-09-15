import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  CompetitionDetailDto,
  CompetitionDto,
  CompetitionService,
  LeaderboardResponse
} from '../../core/services/competition.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .lb-row.me { background: color-mix(in srgb, var(--gold) 8%, transparent); }
      .medal { font-family: var(--ge-serif); font-size: 16px; }
      .rank { font-family: var(--ge-serif); font-size: 15px; color: color-mix(in srgb, var(--ink) 60%, transparent); width: 44px; }
      .cc { border: 1px solid var(--hair); background: #fff; padding: 22px 24px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
      .cc + .cc { border-top: 0; }
      .badge2 { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 4px 10px; }
      .b-active { background: color-mix(in srgb, var(--gold) 14%, transparent); color: var(--color-accent-800); }
      .b-ended { background: var(--color-neutral-200); color: var(--color-neutral-700); }
      .seg { display: inline-flex; border: 1px solid var(--hair); overflow: hidden; }
      .seg button { border: 0; background: transparent; font: inherit; font-family: var(--ge-serif); padding: 8px 16px; cursor: pointer; color: var(--ink); }
      .seg button + button { border-left: 1px solid var(--hair); }
      .seg button.on { background: var(--ink); color: var(--paper); }
    `
  ],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ myGrade() }} კლასი</div>
        <h2>შეჯიბრი</h2>
      </div>
      <div class="spacer"></div>
      @if (!detail()) {
        <button type="button" class="btn btn-primary" style="padding:11px 20px;" (click)="showCreate.set(!showCreate())">
          {{ showCreate() ? 'დახურვა' : '+ ახალი შეჯიბრი' }}
        </button>
      }
    </div>

    <!-- Create form -->
    @if (showCreate() && !detail()) {
      <div style="border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 4%, transparent); padding:26px 28px; margin-bottom:24px; max-width:640px;">
        <div style="font-family:var(--ge-serif); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin-bottom:14px;">— ახალი შეჯიბრი ({{ myGrade() }} კლასი)</div>
        <div class="field" style="margin-bottom:16px;">
          <label>დასახელება</label>
          <input class="input" type="text" [value]="title()" (input)="title.set($any($event.target).value)" placeholder="მაგ. საღამოს ბრძოლა" />
        </div>
        <div style="display:flex; gap:28px; flex-wrap:wrap; align-items:center;">
          <div>
            <div style="font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:6px;">ხანგრძლივობა</div>
            <div class="seg">
              @for (h of hourOptions; track h) {
                <button type="button" [class.on]="hours() === h" (click)="hours.set(h)">{{ h }}სთ</button>
              }
            </div>
          </div>
          <div>
            <div style="font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:color-mix(in srgb, var(--ink) 55%, transparent); margin-bottom:6px;">კითხვები</div>
            <div class="seg">
              @for (n of countOptions; track n) {
                <button type="button" [class.on]="count() === n" (click)="count.set(n)">{{ n }}</button>
              }
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
      <!-- Competition leaderboard -->
      <button type="button" class="btn btn-secondary" style="padding:8px 16px; margin-bottom:18px;" (click)="clearDetail()">← ყველა შეჯიბრი</button>
      <div style="display:flex; align-items:baseline; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--ink); flex-wrap:wrap;">
        <h3 style="font-family:var(--ge-serif); font-size:24px; margin:0; font-weight:500;">{{ d.competition.title }}</h3>
        <span class="badge2" [class.b-active]="d.competition.status === 'active'" [class.b-ended]="d.competition.status !== 'active'">{{ statusLabel(d.competition.status) }}</span>
        <span style="margin-left:auto; font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ d.competition.participants }} მონაწილე · {{ timeLeft(d.competition) }}</span>
      </div>

      @if (d.competition.status === 'active' && !d.competition.played) {
        <div style="margin:18px 0; padding:18px 22px; border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 5%, transparent); display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <span style="font-size:13.5px;">ჯერ არ გითამაშია — {{ d.competition.questionCount }} შერეული მაგალითი ({{ d.competition.grade }} კლასი).</span>
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
      <!-- Competitions list -->
      <div style="display:flex; align-items:baseline; padding-bottom:12px; border-bottom:1px solid var(--hair);">
        <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">{{ myGrade() }} კლასის შეჯიბრები</h4>
      </div>
      @if (competitions().length === 0) {
        <p class="muted" style="margin-top:16px;">ჯერ შეჯიბრი არ არის. შექმენი პირველი — „+ ახალი შეჯიბრი".</p>
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
                  {{ c.questionCount }} მაგალითი · {{ c.participants }} მონაწილე · {{ timeLeft(c) }}
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

      <!-- All-time ranking -->
      @if (board(); as b) {
        @if (b.entries.length) {
          <div style="display:flex; align-items:baseline; padding:12px 0; border-bottom:1px solid var(--hair); margin-top:36px;">
            <h4 style="font-family:var(--ge-serif); font-size:18px; margin:0; font-weight:500;">საერთო რეიტინგი</h4>
            <span style="margin-left:auto; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">ვარჯიშის ჯამური ქულა</span>
          </div>
          <table class="table">
            <tbody>
              @for (e of b.entries; track e.rank) {
                <tr class="lb-row" [class.me]="e.isCurrentUser">
                  <td class="rank">{{ e.rank }}</td>
                  <td style="font-family:var(--ge-serif); font-size:15px;">{{ e.displayName }}@if (e.isCurrentUser) { <span style="font-size:11px; color:var(--gold); margin-left:6px;">(შენ)</span> }</td>
                  <td style="text-align:right; font-family:var(--ge-serif); color:var(--gold); font-feature-settings:'tnum';">{{ e.totalScore }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    }
    }
  `
})
export class CompetitionComponent {
  private readonly service = inject(CompetitionService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(true);
  readonly competitions = signal<CompetitionDto[]>([]);
  readonly board = signal<LeaderboardResponse | null>(null);
  readonly detail = signal<CompetitionDetailDto | null>(null);

  readonly showCreate = signal(false);
  readonly title = signal('');
  readonly hours = signal(12);
  readonly count = signal(20);
  readonly creating = signal(false);

  readonly hourOptions = [1, 6, 12, 24, 48];
  readonly countOptions = [10, 20, 30];

  readonly myGrade = computed(() => this.auth.user()?.grade ?? 1);

  constructor() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.open(id);
    } else {
      this.reload();
    }
    this.service.getLeaderboard().subscribe({ next: (b) => this.board.set(b) });
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
    this.service.create({ title: this.title().trim(), grade: 0, durationHours: this.hours(), questionCount: this.count() })
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
    return { mix: 1, grade: c.grade, count: c.questionCount, competition: c.id };
  }

  statusLabel(s: string): string {
    return s === 'active' ? 'მიმდინარე' : s === 'upcoming' ? 'მალე' : 'დასრულდა';
  }

  timeLeft(c: CompetitionDto): string {
    const end = new Date(c.endsAtUtc).getTime();
    const ms = end - Date.now();
    if (ms <= 0) return 'დასრულდა';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}სთ ${m}წთ დარჩა` : `${m}წთ დარჩა`;
  }
}
