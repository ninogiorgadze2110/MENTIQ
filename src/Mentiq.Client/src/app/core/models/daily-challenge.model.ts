/** One weighted slice of the daily drill: a skill at a difficulty (1–6). */
export interface DailyPlanSegment {
  skill: string;
  difficulty: number;
  weightPercent: number;
}

export interface DailyChallenge {
  date: string;
  grade: number;
  quizSeconds: number;
  completed: boolean;
  myScore: number | null;
  myRank: number | null;
  participantCount: number;
  resetsAtUtc: string;
  /** Progression-driven plan (see backend DailyPlanner). */
  focusSkill: string;
  focusSkillName: string;
  reason: string;
  isChallengeDay: boolean;
  plan: DailyPlanSegment[];
}

export interface SubmitDailyChallengeRequest {
  score: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
}

export interface DailyChallengeRankRow {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  correctCount: number;
  accuracy: number;
  durationSeconds: number;
  isMe: boolean;
}

export interface DailyChallengeLeaderboard {
  date: string;
  grade: number;
  entries: DailyChallengeRankRow[];
  myRank: number | null;
  myScore: number | null;
  participantCount: number;
  resetsAtUtc: string;
}
