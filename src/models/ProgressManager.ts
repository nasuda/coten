// ============================================================
// 進行度・経験値管理
// ============================================================

import type { StarRating } from './types.ts';
import { MAX_PLAYER_LEVEL } from './types.ts';

export function calculateExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateLevelUp(
  currentLevel: number,
  currentExp: number,
  gainedExp: number,
): { newLevel: number; remainingExp: number; levelsGained: number } {
  let level = currentLevel;
  let exp = currentExp + gainedExp;
  let levelsGained = 0;

  while (level < MAX_PLAYER_LEVEL) {
    const required = calculateExpForLevel(level);
    if (exp < required) break;
    exp -= required;
    level++;
    levelsGained++;
  }

  if (level >= MAX_PLAYER_LEVEL) {
    level = MAX_PLAYER_LEVEL;
  }

  return { newLevel: level, remainingExp: exp, levelsGained };
}

export function calculatePlayerStats(level: number): { maxHP: number; attackBonus: number } {
  return {
    maxHP: 100 + level * 10,
    attackBonus: level * 2,
  };
}

export function calculateStarRating(accuracyRate: number): StarRating {
  if (accuracyRate >= 1.0) return 3;
  if (accuracyRate >= 0.8) return 2;
  if (accuracyRate >= 0.6) return 1;
  return 0;
}

export function calculateStonesReward(
  alreadyCleared: boolean,
  isBoss: boolean,
  _isChapterClear: boolean,
): number {
  if (alreadyCleared) return 0;
  if (isBoss) return 30;
  return 10;
}

export function calculateExpReward(baseExp: number, starRating: StarRating): number {
  const multipliers: Record<StarRating, number> = { 0: 0.5, 1: 1.0, 2: 1.2, 3: 1.5 };
  return Math.floor(baseExp * multipliers[starRating]);
}
