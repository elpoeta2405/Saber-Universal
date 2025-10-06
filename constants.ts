import { Topic } from './types';

export const TOPICS: Topic[] = [
  Topic.BIODIVERSITY,
  Topic.ZOOLOGY,
  Topic.HISTORY,
  Topic.RELIGION,
  Topic.GEOGRAPHY,
  Topic.SCIENCE_TECH,
  Topic.ART_LITERATURE,
  Topic.SPORTS,
];

export const TOPIC_DETAILS: Record<Topic, { icon: string, borderColor: string, textColor: string, shadowColor: string }> = {
    [Topic.BIODIVERSITY]: { icon: '🌿', borderColor: 'border-emerald-400/80', textColor: 'text-emerald-300', shadowColor: 'shadow-emerald-400/30' },
    [Topic.ZOOLOGY]: { icon: '🦁', borderColor: 'border-orange-400/80', textColor: 'text-orange-300', shadowColor: 'shadow-orange-400/30' },
    [Topic.HISTORY]: { icon: '🏛️', borderColor: 'border-amber-400/80', textColor: 'text-amber-300', shadowColor: 'shadow-amber-400/30' },
    [Topic.RELIGION]: { icon: '📜', borderColor: 'border-violet-400/80', textColor: 'text-violet-300', shadowColor: 'shadow-violet-400/30' },
    [Topic.GEOGRAPHY]: { icon: '🌍', borderColor: 'border-sky-400/80', textColor: 'text-sky-300', shadowColor: 'shadow-sky-400/30' },
    [Topic.SCIENCE_TECH]: { icon: '🔬', borderColor: 'border-cyan-400/80', textColor: 'text-cyan-300', shadowColor: 'shadow-cyan-400/30' },
    [Topic.ART_LITERATURE]: { icon: '🎨', borderColor: 'border-rose-400/80', textColor: 'text-rose-300', shadowColor: 'shadow-rose-400/30' },
    [Topic.SPORTS]: { icon: '⚽', borderColor: 'border-lime-400/80', textColor: 'text-lime-300', shadowColor: 'shadow-lime-400/30' },
};

export const QUESTIONS_PER_SET = 5;
export const SETS_PER_TOPIC = 2;
export const TOTAL_QUESTIONS_PER_TOPIC = QUESTIONS_PER_SET * SETS_PER_TOPIC;
export const TIMER_DURATION = 15; // seconds