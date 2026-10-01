import { Injectable, signal } from '@angular/core';

export interface AnsweredQuestion {
  /** Human-readable problem text, e.g. "47 + 28" or "46 + ? = 83". */
  display: string;
  answer: number | string;
  /** What the user entered; null when the question was skipped. */
  userAnswer: number | string | null;
  correct: boolean;
  /** Real time the user spent on this question, in seconds. */
  seconds: number;
}

/**
 * Belt-progression outcome of a session, for the results screen. Captured around
 * the single end-of-session answer submission (promotion happens only there).
 */
export interface PracticeProgression {
  skill: string;
  skillName: string;
  window: number;
  /** Mastery window before vs after this session. */
  beforeCount: number;
  afterCount: number;
  beforeAccuracy: number;
  afterAccuracy: number;
  /** Median time per question this session, in seconds. */
  medianSeconds: number;
  requiredAccuracy: number;
  targetSeconds: number;
  promoted: boolean;
  beltId: string;
  beltName: string;
  prevBeltName: string;
  /** Names of skills newly unlocked by a promotion. */
  unlockedSkills: string[];
  /** Titles of tricks available at the belt just reached. */
  newTricks: string[];
}

export interface PracticeSession {
  title: string;
  startedAt: string;
  score: number;
  accuracy: number;
  avgSeconds: number;
  longestStreak: number;
  correctCount: number;
  wrongCount: number;
  questions: AnsweredQuestion[];
  /** Trick key to resume, if this session was a trick drill. */
  resumeTrick: string | null;
  /** Belt-progression outcome; absent for free mode, daily, or competition. */
  progression?: PracticeProgression | null;
}

/** Holds the most recently completed practice session for the Results page. */
@Injectable({ providedIn: 'root' })
export class PracticeSessionService {
  readonly session = signal<PracticeSession | null>(null);

  set(session: PracticeSession): void {
    this.session.set(session);
  }
}
