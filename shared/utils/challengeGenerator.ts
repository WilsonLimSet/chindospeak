import { DailyChallenge, ChallengeType } from '@/shared/types';

// Simple hash function for deterministic challenge selection
function hashDateString(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const challengeConfigs: Record<ChallengeType, { description: string; baseTarget: number; icon: string }> = {
  review_count: {
    description: 'Review {n} cards today',
    baseTarget: 10,
    icon: 'BookOpen'
  },
  correct_streak: {
    description: 'Get {n} cards correct in a row',
    baseTarget: 5,
    icon: 'Zap'
  },
  listening_practice: {
    description: 'Complete {n} listening reviews',
    baseTarget: 8,
    icon: 'Headphones'
  },
  speaking_practice: {
    description: 'Complete {n} speaking reviews',
    baseTarget: 5,
    icon: 'Mic'
  }
};

export function generateDailyChallenge(date: string, totalCards: number): DailyChallenge {
  const seed = hashDateString(date);
  const challengeTypes: ChallengeType[] = ['review_count', 'correct_streak', 'listening_practice', 'speaking_practice'];

  const type = challengeTypes[seed % challengeTypes.length];
  const config = challengeConfigs[type];

  // Scale target based on user's card count (but keep reasonable bounds)
  let targetValue = config.baseTarget;
  if (totalCards > 50) {
    targetValue = Math.min(config.baseTarget + 5, Math.floor(totalCards * 0.2));
  }

  // Add some variation based on day of week
  const dayVariation = (seed % 3) - 1; // -1, 0, or 1
  targetValue = Math.max(3, targetValue + dayVariation);

  return {
    id: `challenge-${date}`,
    type,
    targetValue,
    currentValue: 0,
    date,
    completed: false
  };
}

export function getChallengeDescription(challenge: DailyChallenge): string {
  const config = challengeConfigs[challenge.type];
  return config.description.replace('{n}', challenge.targetValue.toString());
}

export function getChallengeIcon(challenge: DailyChallenge): string {
  return challengeConfigs[challenge.type].icon;
}
