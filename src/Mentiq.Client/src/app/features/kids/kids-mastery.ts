import { SkillProgress } from './exercise/exercise.models';

/**
 * Shared mastery model for MENTIQ Kids, so Home, the journey, achievements and
 * the parent view all tell the same story.
 *
 * A tour is mastered only after BOTH:
 *   - enough correct answers (volume), AND
 *   - practice spread across several distinct days.
 *
 * The day requirement is what stops a child grinding all 8 tours in one sitting —
 * progress is deliberately paced over time. The visible % is the smaller of the
 * two fractions, so it can't run ahead of the days actually practised.
 */
export const MASTERY_CORRECT = 40;
export const MASTERY_DAYS = 5;

/** 0–100 progress toward mastering a skill (capped by days practised). */
export function masteryPct(p: SkillProgress | null | undefined): number {
  if (!p) return 0;
  const volume = Math.min(1, (p.correctAttempts ?? 0) / MASTERY_CORRECT);
  const days = Math.min(1, (p.daysPracticed ?? 0) / MASTERY_DAYS);
  return Math.round(100 * Math.min(volume, days));
}

/** A skill is mastered once both the volume and the days requirements are met. */
export function isMastered(p: SkillProgress | null | undefined): boolean {
  return !!p && (p.correctAttempts ?? 0) >= MASTERY_CORRECT && (p.daysPracticed ?? 0) >= MASTERY_DAYS;
}
