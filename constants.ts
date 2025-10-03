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

export const TOPIC_DETAILS: Record<Topic, { icon: string, borderColor: string, textColor: string }> = {
    [Topic.BIODIVERSITY]: { icon: '🌿', borderColor: 'border-emerald-400/80', textColor: 'text-emerald-300' },
    [Topic.ZOOLOGY]: { icon: '🦁', borderColor: 'border-orange-400/80', textColor: 'text-orange-300' },
    [Topic.HISTORY]: { icon: '🏛️', borderColor: 'border-amber-400/80', textColor: 'text-amber-300' },
    [Topic.RELIGION]: { icon: '📜', borderColor: 'border-violet-400/80', textColor: 'text-violet-300' },
    [Topic.GEOGRAPHY]: { icon: '🌍', borderColor: 'border-sky-400/80', textColor: 'text-sky-300' },
    [Topic.SCIENCE_TECH]: { icon: '🔬', borderColor: 'border-cyan-400/80', textColor: 'text-cyan-300' },
    [Topic.ART_LITERATURE]: { icon: '🎨', borderColor: 'border-rose-400/80', textColor: 'text-rose-300' },
    [Topic.SPORTS]: { icon: '⚽', borderColor: 'border-lime-400/80', textColor: 'text-lime-300' },
};

export const QUESTIONS_PER_SET = 5;
export const SETS_PER_TOPIC = 2;
export const TOTAL_QUESTIONS_PER_TOPIC = QUESTIONS_PER_SET * SETS_PER_TOPIC;
export const TIMER_DURATION = 15; // seconds