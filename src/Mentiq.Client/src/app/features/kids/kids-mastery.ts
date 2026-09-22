import { SkillProgress } from './exercise/exercise.models';

/**
 * Shared mastery model for MENTIQ Kids, so Home, the journey, achievements and
 * the parent view all tell the same story.
 *
 * Progress is purely effort-based: a tour is mastered by answering enough
 * questions correctly. It is NOT tied to calendar days — the bar grows every
 * time the child plays and never freezes waiting for "tomorrow".
 */
export const MASTERY_CORRECT = 40;

/** 0–100 progress toward mastering a skill, from correct answers alone. */
export function masteryPct(p: SkillProgress | null | undefined): number {
  if (!p) return 0;
  return Math.min(100, Math.round(((p.correctAttempts ?? 0) / MASTERY_CORRECT) * 100));
}

/** A skill is mastered once enough answers are correct. */
export function isMastered(p: SkillProgress | null | undefined): boolean {
  return !!p && (p.correctAttempts ?? 0) >= MASTERY_CORRECT;
}
