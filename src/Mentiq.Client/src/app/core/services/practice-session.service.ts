import { Injectable, signal } from '@angular/core';

export interface AnsweredQuestion {
  a: number;
  b: number;
  symbol: string;
  answer: number;
  /** What the user entered; null when the question was skipped. */
  userAnswer: number | null;
  correct: boolean;
  /** Real time the user spent on this question, in seconds. */
  seconds: number;
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
}

/** Holds the most recently completed practice session for the Results page. */
@Injectable({ providedIn: 'root' })
export class PracticeSessionService {
  readonly session = signal<PracticeSession | null>(null);

  set(session: PracticeSession): void {
    this.session.set(session);
  }
}
