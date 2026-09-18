/**
 * MENTIQ Kids "worlds" (tours). Config-driven so more worlds can be added later
 * without touching components. `skill` maps to the cognitive skill each world
 * develops; the exercise engine (STEP 4+) will use it to pick exercises.
 */
export interface KidsWorld {
  id: string;
  order: number;
  emoji: string;
  name: string;
  /** Short child-facing subtitle (kept minimal — kids may not read). */
  tagline: string;
  /** Cognitive skill this world trains. */
  skill: KidsSkill;
  /** Accent color for the world card / theme. */
  color: string;
  /** Georgian voice line spoken when the world opens. */
  audioIntro: string;
}

export type KidsSkill =
  | 'counting'
  | 'comparison'
  | 'patterns'
  | 'classification'
  | 'addition'
  | 'attention'
  | 'memory'
  | 'speed';

export const KIDS_WORLDS: KidsWorld[] = [
  {
    id: 'apples',
    order: 1,
    emoji: '🍎',
    name: 'ვაშლების ბაღი',
    tagline: 'დათვალე',
    skill: 'counting',
    color: '#e5484d',
    audioIntro: 'მოდი ვაშლები დავთვალოთ!'
  },
  {
    id: 'rabbits',
    order: 2,
    emoji: '🐰',
    name: 'კურდღლების ტყე',
    tagline: 'მეტი და ნაკლები',
    skill: 'comparison',
    color: '#7c66dc',
    audioIntro: 'სად არის მეტი?'
  },
  {
    id: 'colors',
    order: 3,
    emoji: '🌈',
    name: 'ფერების გზა',
    tagline: 'რა მოდის შემდეგ',
    skill: 'patterns',
    color: '#f76b15',
    audioIntro: 'რა მოდის შემდეგ?'
  },
  {
    id: 'toys',
    order: 4,
    emoji: '🧸',
    name: 'სათამაშოების ოთახი',
    tagline: 'დააჯგუფე',
    skill: 'classification',
    color: '#d6409f',
    audioIntro: 'რომელია განსხვავებული?'
  },
  {
    id: 'space',
    order: 5,
    emoji: '🚀',
    name: 'კოსმოსური მისია',
    tagline: 'შეკრება',
    skill: 'addition',
    color: '#3e63dd',
    audioIntro: 'მოდი დავამატოთ!'
  },
  {
    id: 'sea',
    order: 6,
    emoji: '🔎',
    name: 'ყურადღების ველი',
    tagline: 'იპოვე და დათვალე',
    skill: 'attention',
    color: '#0ea5e9',
    audioIntro: 'იპოვე და დათვალე!'
  },
  {
    id: 'memory',
    order: 7,
    emoji: '🧠',
    name: 'მეხსიერების კუნძული',
    tagline: 'დაიმახსოვრე',
    skill: 'memory',
    color: '#30a46c',
    audioIntro: 'დაიმახსოვრე, რა დაინახე!'
  },
  {
    id: 'speed',
    order: 8,
    emoji: '⭐',
    name: 'სისწრაფის გამოწვევა',
    tagline: 'იყავი სწრაფი',
    skill: 'speed',
    color: '#f5a524',
    audioIntro: 'იყავი სწრაფი!'
  }
];
