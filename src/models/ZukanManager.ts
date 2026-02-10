// ============================================================
// 図鑑管理
// ============================================================

import type { ZukanJodoushiEntry, ZukanEnemyEntry } from './types.ts';
import { MASTERY_MAX } from './types.ts';
import { allJodoushi } from '../data/jodoushi.ts';
import { allEnemies } from '../data/enemies.ts';

export function updateJodoushiEntry(
  entry: ZukanJodoushiEntry,
  correct: boolean,
): ZukanJodoushiEntry {
  const totalCount = entry.totalCount + 1;
  const correctCount = entry.correctCount + (correct ? 1 : 0);
  const masteryLevel = calculateMasteryLevel(correctCount, totalCount);

  return {
    ...entry,
    encountered: true,
    correctCount,
    totalCount,
    masteryLevel,
  };
}

export function calculateMasteryLevel(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;

  const rate = correctCount / totalCount;

  if (correctCount >= 50 && rate >= 0.95) return 5;
  if (correctCount >= 30 && rate >= 0.90) return 4;
  if (correctCount >= 20 && rate >= 0.85) return 3;
  if (correctCount >= 10 && rate >= 0.80) return 2;
  if (correctCount >= 5 && rate >= 0.70) return 1;

  return 0;
}

export function updateEnemyEntry(
  entry: ZukanEnemyEntry,
  defeated: boolean,
): ZukanEnemyEntry {
  return {
    ...entry,
    encountered: true,
    defeated: entry.defeated || defeated,
    defeatCount: entry.defeatCount + (defeated ? 1 : 0),
  };
}

export function createInitialZukanJodoushi(): ZukanJodoushiEntry[] {
  return allJodoushi.map(j => ({
    id: j.id,
    encountered: false,
    correctCount: 0,
    totalCount: 0,
    masteryLevel: 0,
  }));
}

export function createInitialZukanEnemies(): ZukanEnemyEntry[] {
  return allEnemies.map(e => ({
    id: e.id,
    encountered: false,
    defeated: false,
    defeatCount: 0,
  }));
}

export function getMasteryStars(level: number): string {
  const filled = Math.min(level, MASTERY_MAX);
  return '★'.repeat(filled) + '☆'.repeat(MASTERY_MAX - filled);
}
