/**
 * Lesson (trick) id → Georgian title. Mirrors the titles in the learn catalogue
 * for the lessons wired into belt progression (ProgressionConfig.LessonsByBelt).
 * Used to name a freshly-unlocked trick on the dashboard and results screens.
 */
export const LESSON_TITLES: Record<string, string> = {
  'round-up': 'მრგვალამდე მიდი, დაუმატე',
  'left-to-right': 'მარცხნიდან მარჯვნივ',
  'add9': '9-ის დამატება',
  'sub-round': 'მრგვალამდე გამოკლება',
  'halving': 'გაჩერებული განახევრება',
  'mul5': 'გამრავლება 5-ზე',
  'mul11': 'გამრავლება 11-ზე',
  'mul9-fingers': '9-ზე თითებით',
  'sq5': '5-ით დამთავრებული კვადრატი',
  'pct10': '10%-ის გამოთვლა',
  'pct15': '15%-ის გამოთვლა თავში'
};

export const lessonTitle = (id: string): string => LESSON_TITLES[id] ?? id;
