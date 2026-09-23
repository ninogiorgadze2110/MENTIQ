export interface ExerciseOption {
  value: string;
  label: string;
  emoji?: string | null;
  count?: number | null;
}

export interface ExerciseVisual {
  kind: string;
  emoji: string | null;
  count: number;
  /** Target total for the "makeN" (complete-to-N) kind. */
  target?: number | null;
  addends?: number[] | null;
  items?: string[] | null;
}

export interface Exercise {
  id: string;
  type: string;
  skill: string;
  world: string | null;
  difficulty: number;
  instruction: string;
  instructionAudioKey: string;
  visual: ExerciseVisual;
  options: ExerciseOption[];
  token: string;
}

export interface SubmitExerciseRequest {
  token: string;
  answer: string;
  responseTimeMs: number;
  attemptNumber: number;
}

export interface SubmitExerciseResult {
  isCorrect: boolean;
  correctAnswer: string;
  starsAwarded: number;
  totalStars: number;
  level: number;
  feedback: string;
  feedbackAudioKey: string;
}

export interface SkillProgress {
  skill: string;
  level: number;
  score: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageResponseTimeMs: number;
  daysPracticed: number;
  maxCorrectValue: number;
  skyCorrectCount: number;
}
