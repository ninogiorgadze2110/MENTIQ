/** Belt-progression types — mirror of the backend BeltProgressResponse. */

export interface Belt {
  id: string;
  name: string;
  index: number;
  difficulty: number;
  targetSeconds: number;
}

export interface Prerequisite {
  skill: string;
  beltIndex: number;
}

export interface Mastery {
  accuracyPercent: number;
  medianTimeMs: number;
  answersCount: number;
  windowSize: number;
  targetSeconds: number;
  ready: boolean;
}

export interface SkillProgress {
  key: string;
  name: string;
  beltIndex: number;
  beltId: string;
  unlocked: boolean;
  requires?: Prerequisite | null;
  mastery: Mastery;
  lessonsByBelt: string[][];
}

export interface BeltProgressResponse {
  belts: Belt[];
  skills: SkillProgress[];
  masteryWindow: number;
  minAccuracyPercent: number;
}

/** One recorded answer sent to the server. */
export interface AnswerInput {
  correct: boolean;
  timeMs: number;
}

/** Mastery summary surfaced by ProgressService.masteryProgress(). */
export interface MasteryProgress {
  accuracy: number;
  medianTime: number;
  answersCount: number;
  target: number;
}

/** The recommended next move. */
export interface NextStep {
  skill: string;
  name: string;
  beltIndex: number;
  beltId: string;
}
