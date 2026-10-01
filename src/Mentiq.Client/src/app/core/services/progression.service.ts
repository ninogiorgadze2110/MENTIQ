import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AnswerInput,
  Belt,
  BeltProgressResponse,
  MasteryProgress,
  NextStep,
  SkillProgress
} from '../models/progression.model';

/**
 * Client mirror of belt progression. Signals drive the UI; the backend remains
 * the source of truth for belts, unlocks and mastery. Load once, then read the
 * helpers (currentBelt, nextStep, isUnlocked, masteryProgress).
 *
 * NOTE: distinct from ProgressService (which is practice session stats).
 */
@Injectable({ providedIn: 'root' })
export class ProgressionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/progression`;

  private readonly _state = signal<BeltProgressResponse | null>(null);
  private readonly _loading = signal(false);

  readonly state = this._state.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly belts = computed(() => this._state()?.belts ?? []);
  readonly skills = computed(() => this._state()?.skills ?? []);

  /** Lesson id → the skill+belt it belongs to, for isUnlocked() on lessons. */
  private readonly lessonIndex = computed(() => {
    const map = new Map<string, { skill: string; belt: number }>();
    for (const s of this.skills()) {
      (s.lessonsByBelt ?? []).forEach((lessons, belt) =>
        lessons.forEach((id) => map.set(id, { skill: s.key, belt }))
      );
    }
    return map;
  });

  /** Load (or reload) progression from the backend. */
  load(): Observable<BeltProgressResponse> {
    this._loading.set(true);
    return this.http.get<BeltProgressResponse>(this.baseUrl).pipe(
      tap({
        next: (r) => {
          this._state.set(r);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      })
    );
  }

  /** Record a batch of answers for a skill; refreshes local state from the response. */
  recordAnswers(skill: string, answers: AnswerInput[]): Observable<BeltProgressResponse> {
    return this.http
      .post<BeltProgressResponse>(`${this.baseUrl}/answers`, { skill, answers })
      .pipe(tap((r) => this._state.set(r)));
  }

  // ---- read helpers ----

  private skill(key: string): SkillProgress | undefined {
    return this.skills().find((s) => s.key === key);
  }

  /** The current belt object for a skill (null if unknown). */
  currentBelt(skill: string): Belt | null {
    const s = this.skill(skill);
    if (!s) return null;
    return this.belts().find((b) => b.index === s.beltIndex) ?? null;
  }

  /** Whether a skill OR a lesson id is currently available to the user. */
  isUnlocked(key: string): boolean {
    const s = this.skill(key);
    if (s) return s.unlocked;

    const lesson = this.lessonIndex().get(key);
    if (!lesson) return false;
    const owner = this.skill(lesson.skill);
    return !!owner && owner.unlocked && owner.beltIndex >= lesson.belt;
  }

  /** Mastery summary for a skill: {accuracy, medianTime, answersCount, target}. */
  masteryProgress(skill: string): MasteryProgress {
    const m = this.skill(skill)?.mastery;
    return {
      accuracy: m?.accuracyPercent ?? 0,
      medianTime: m?.medianTimeMs ?? 0,
      answersCount: m?.answersCount ?? 0,
      target: (m?.targetSeconds ?? 0) * 1000
    };
  }

  /**
   * The recommended next move: a skill the user can act on now, preferring one
   * already in progress, otherwise the first unlocked skill below black belt.
   */
  nextStep(): NextStep | null {
    const topIndex = this.belts().length - 1;
    const open = this.skills().filter((s) => s.unlocked && s.beltIndex < topIndex);
    if (open.length === 0) return null;
    const inProgress = open.filter((s) => s.mastery.answersCount > 0);
    const pick = (inProgress.length ? inProgress : open).reduce((a, b) =>
      a.mastery.answersCount >= b.mastery.answersCount ? a : b
    );
    return { skill: pick.key, name: pick.name, beltIndex: pick.beltIndex, beltId: pick.beltId };
  }

  clear(): void {
    this._state.set(null);
  }
}
