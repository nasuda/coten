// ============================================================
// ボスラッシュ (Chapter 5) 連続戦闘ロジック
// ============================================================

import type { Enemy, BattleResult } from './types.ts';
import { allEnemies } from '../data/enemies.ts';

export interface BossRushState {
  currentBossIndex: number;
  completedBosses: string[];
  totalExp: number;
  totalStones: number;
}

const RUSH_BOSS_IDS = ['e1_boss', 'e2_boss', 'e3_boss', 'e4_boss'];

export function getBossRushBosses(): Enemy[] {
  return RUSH_BOSS_IDS.map(id => allEnemies.find(e => e.id === id)!);
}

export function createBossRushState(): BossRushState {
  return {
    currentBossIndex: 0,
    completedBosses: [],
    totalExp: 0,
    totalStones: 0,
  };
}

export function advanceBossRush(state: BossRushState, result: BattleResult): BossRushState {
  const updated: BossRushState = {
    currentBossIndex: state.currentBossIndex,
    completedBosses: [...state.completedBosses],
    totalExp: state.totalExp + result.expGained,
    totalStones: state.totalStones + result.stonesGained,
  };

  if (result.victory) {
    updated.completedBosses.push(result.enemyId);
    updated.currentBossIndex = state.currentBossIndex + 1;
  }

  return updated;
}

export function isBossRushComplete(state: BossRushState): boolean {
  return state.completedBosses.length >= RUSH_BOSS_IDS.length;
}

export function getCurrentBoss(state: BossRushState): Enemy | null {
  const bosses = getBossRushBosses();
  return bosses[state.currentBossIndex] ?? null;
}
