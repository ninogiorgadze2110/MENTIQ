import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { DailyChallengeService } from '../../core/services/daily-challenge.service';
import { DailyChallenge, DailyChallengeLeaderboard } from '../../core/models/daily-challenge.model';

/**
 * "დღის ამოცანა" (Daily Challenge) — a 1-minute mixed-difficulty test for the
 * user's grade that rolls over at 06:00 Tbilisi time. Shows the user's score and
 * rank, a live countdown to the next reset, and a small ranking modal.
 * Rendered as the left column of the dashboard's daily card.
 */
@Component({
  selector: 'app-daily-challenge-card',
  standalone: true,
  imports: [RouterLink],
  styles: [':host { display: block; }'],
  template: `
    <div style="font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold);">— დღის ამოცანა</div>
    <h3 style="font-family:var(--ge-serif); font-size:32px; margin:10px 0 6px; font-weight:500; line-height:1.05;">1 წუთი · შერეული</h3>
    <p style="font-size:13.5px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 16px; line-height:1.55;">
      {{ grade() }} კლასის შერეული სირთულის ტესტი. ყოველ დილით 6:00-ზე ახალი ამოცანა.
    </p>

    @if (data()?.completed) {
      <div style="display:inline-flex; align-items:center; gap:14px; border:1px solid var(--hair); padding:8px 14px; margin-bottom:14px; font-size:13px;">
        <span>შენი ქულა: <strong style="color:var(--gold); font-feature-settings:'tnum';">{{ data()!.myScore }}</strong></span>
        <span style="color:color-mix(in srgb, var(--ink) 30%, transparent);">|</span>
        <span>ადგილი: <strong style="font-feature-settings:'tnum';">#{{ data()!.myRank }}</strong> / {{ data()!.participantCount }}</span>
      </div>
    }

    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <a routerLink="/practice" [queryParams]="{ daily: 1 }" class="btn btn-primary" style="padding:12px 22px;">
        {{ data()?.completed ? 'თავიდან სცადე →' : 'დაიწყე →' }}
      </a>
      <button type="button" class="btn btn-secondary" style="padding:12px 18px;" (click)="openBoard()">🏆 რეიტინგი</button>
    </div>

    <div style="margin-top:14px; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">
      ახლდება {{ countdown() }}-ში
    </div>

    <!-- Ranking modal -->
    @if (boardOpen()) {
      <div style="position:fixed; inset:0; background:color-mix(in srgb, var(--ink) 45%, transparent); display:grid; place-items:center; z-index:80; padding:20px;" (click)="boardOpen.set(false)">
        <div style="background:#fff; border:1px solid var(--hair); max-width:460px; width:100%; max-height:80vh; overflow:auto; padding:28px;" (click)="$event.stopPropagation()">
          <div style="display:flex; align-items:baseline; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--ink);">
            <span style="font-family:var(--ge-serif); color:var(--gold);">🏆</span>
            <h3 style="font-family:var(--ge-serif); font-size:20px; margin:0; font-weight:500;">დღის რეიტინგი</h3>
            <span style="margin-left:auto; font-size:12px; color:color-mix(in srgb, var(--ink) 55%, transparent);">{{ board()?.grade }} კლასი</span>
          </div>

          @if (board(); as b) {
            @if (b.entries.length) {
              <div style="margin-top:8px;">
                @for (row of b.entries; track row.userId) {
                  <div [style.background]="row.isMe ? 'color-mix(in srgb, var(--gold) 10%, transparent)' : 'transparent'"
                       style="display:flex; align-items:center; gap:12px; padding:9px 10px; border-bottom:1px solid var(--hair); font-size:13.5px;">
                    <span style="width:28px; font-family:var(--ge-serif); font-size:16px; color:var(--gold); font-feature-settings:'tnum';">{{ row.rank }}</span>
                    <span style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ row.displayName }}{{ row.isMe ? ' (შენ)' : '' }}</span>
                    <span style="font-size:11.5px; color:color-mix(in srgb, var(--ink) 50%, transparent); font-feature-settings:'tnum';">{{ row.accuracy }}%</span>
                    <strong style="font-family:var(--ge-serif); font-feature-settings:'tnum'; min-width:44px; text-align:right;">{{ row.score }}</strong>
                  </div>
                }
              </div>
              @if (b.myRank && b.myRank > b.entries.length) {
                <div style="margin-top:8px; padding:9px 10px; background:color-mix(in srgb, var(--gold) 10%, transparent); display:flex; gap:12px; font-size:13.5px;">
                  <span style="width:28px; font-family:var(--ge-serif); color:var(--gold);">{{ b.myRank }}</span>
                  <span style="flex:1;">შენ</span>
                  <strong style="font-family:var(--ge-serif);">{{ b.myScore }}</strong>
                </div>
              }
            } @else {
              <div style="text-align:center; color:color-mix(in srgb, var(--ink) 50%, transparent); padding:32px 12px; font-size:13.5px;">
                ჯერ არავის შეუსრულებია დღევანდელი ამოცანა.<br>იყავი პირველი! 🎯
              </div>
            }
            <div style="margin-top:14px; font-size:11.5px; color:color-mix(in srgb, var(--ink) 50%, transparent); text-align:center;">
              {{ b.participantCount }} მონაწილე · ახლდება {{ countdown() }}-ში
            </div>
          } @else {
            <div style="text-align:center; padding:32px; color:color-mix(in srgb, var(--ink) 50%, transparent);">იტვირთება…</div>
          }

          <button type="button" class="btn btn-secondary btn-block" style="margin-top:16px; padding:11px;" (click)="boardOpen.set(false)">დახურვა</button>
        </div>
      </div>
    }
  `
})
export class DailyChallengeCardComponent implements OnDestroy {
  private readonly daily = inject(DailyChallengeService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly data = signal<DailyChallenge | null>(null);
  readonly board = signal<DailyChallengeLeaderboard | null>(null);
  readonly boardOpen = signal(false);

  private readonly tick = signal(0);
  private readonly timer: ReturnType<typeof setInterval>;

  readonly grade = computed(() => this.data()?.grade ?? this.auth.user()?.grade ?? 0);

  readonly countdown = computed(() => {
    this.tick();
    const iso = this.data()?.resetsAtUtc ?? this.board()?.resetsAtUtc;
    if (!iso) return '—';
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return '0 წთ';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h >= 1 ? `${h} სთ ${m} წთ` : `${m} წთ`;
  });

  constructor() {
    this.reload();
    // Returning from a finished daily attempt opens the ranking automatically.
    if (this.route.snapshot.queryParamMap.get('daily') === 'done') {
      this.openBoard();
    }
    this.timer = setInterval(() => this.tick.update((n) => n + 1), 30000);
  }

  reload(): void {
    this.daily.getToday().subscribe({ next: (d) => this.data.set(d), error: () => {} });
  }

  openBoard(): void {
    this.boardOpen.set(true);
    this.board.set(null);
    this.daily.getLeaderboard().subscribe({
      next: (b) => {
        this.board.set(b);
        // Keep the card's rank/score in sync with the freshly loaded board.
        this.reload();
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
