import { describe, it, expect } from 'vitest';
import { createBossRushState, advanceBossRush, isBossRushComplete, getBossRushBosses, getCurrentBoss } from '../models/BossRush.ts';
import type { BattleResult } from '../models/types.ts';

describe('BossRush', () => {
  describe('getBossRushBosses', () => {
    it('Chapter 1-4のボス4体を返す', () => {
      const bosses = getBossRushBosses();
      expect(bosses).toHaveLength(4);
      expect(bosses[0]!.id).toBe('e1_boss');
      expect(bosses[1]!.id).toBe('e2_boss');
      expect(bosses[2]!.id).toBe('e3_boss');
      expect(bosses[3]!.id).toBe('e4_boss');
    });

    it('全てボスフラグがtrue', () => {
      const bosses = getBossRushBosses();
      for (const boss of bosses) {
        expect(boss.isBoss).toBe(true);
      }
    });
  });

  describe('createBossRushState', () => {
    it('ボスラッシュ状態を初期化する', () => {
      const state = createBossRushState();
      expect(state.currentBossIndex).toBe(0);
      expect(state.completedBosses).toEqual([]);
      expect(state.totalExp).toBe(0);
      expect(state.totalStones).toBe(0);
    });
  });

  describe('advanceBossRush', () => {
    it('勝利後に次のボスへ進む', () => {
      const state = createBossRushState();
      const result: BattleResult = {
        victory: true, stageId: 's5_4', enemyId: 'e1_boss',
        turns: 4, correctCount: 4, totalQuestions: 4,
        accuracyRate: 1.0, starRating: 3, expGained: 100, stonesGained: 30, comboMax: 4,
      };

      const next = advanceBossRush(state, result);
      expect(next.currentBossIndex).toBe(1);
      expect(next.completedBosses).toEqual(['e1_boss']);
      expect(next.totalExp).toBe(100);
      expect(next.totalStones).toBe(30);
    });

    it('敗北時はインデックスが進まない', () => {
      const state = createBossRushState();
      const result: BattleResult = {
        victory: false, stageId: 's5_4', enemyId: 'e1_boss',
        turns: 4, correctCount: 1, totalQuestions: 4,
        accuracyRate: 0.25, starRating: 0, expGained: 30, stonesGained: 0, comboMax: 1,
      };

      const next = advanceBossRush(state, result);
      expect(next.currentBossIndex).toBe(0);
      expect(next.completedBosses).toEqual([]);
      expect(next.totalExp).toBe(30);
    });

    it('元の状態を変更しない（イミュータブル）', () => {
      const state = createBossRushState();
      const result: BattleResult = {
        victory: true, stageId: 's5_4', enemyId: 'e1_boss',
        turns: 4, correctCount: 4, totalQuestions: 4,
        accuracyRate: 1.0, starRating: 3, expGained: 100, stonesGained: 30, comboMax: 4,
      };

      advanceBossRush(state, result);
      expect(state.currentBossIndex).toBe(0);
      expect(state.completedBosses).toEqual([]);
    });
  });

  describe('getCurrentBoss', () => {
    it('currentBossIndexに対応するボスを返す', () => {
      const state = createBossRushState();
      const boss = getCurrentBoss(state);
      expect(boss).not.toBeNull();
      expect(boss!.id).toBe('e1_boss');
    });

    it('全ボス撃破後はnullを返す', () => {
      const state = createBossRushState();
      state.currentBossIndex = 4;
      const boss = getCurrentBoss(state);
      expect(boss).toBeNull();
    });

    it('途中のインデックスで正しいボスを返す', () => {
      const state = createBossRushState();
      state.currentBossIndex = 2;
      const boss = getCurrentBoss(state);
      expect(boss).not.toBeNull();
      expect(boss!.id).toBe('e3_boss');
    });
  });

  describe('isBossRushComplete', () => {
    it('全ボス撃破で完了', () => {
      const state = createBossRushState();
      state.currentBossIndex = 4;
      state.completedBosses = ['e1_boss', 'e2_boss', 'e3_boss', 'e4_boss'];
      expect(isBossRushComplete(state)).toBe(true);
    });

    it('途中では未完了', () => {
      const state = createBossRushState();
      state.currentBossIndex = 2;
      state.completedBosses = ['e1_boss', 'e2_boss'];
      expect(isBossRushComplete(state)).toBe(false);
    });
  });

  describe('4連勝統合シナリオ', () => {
    it('4連勝でボスラッシュが完了し報酬が累積する', () => {
      let state = createBossRushState();
      const bossIds = ['e1_boss', 'e2_boss', 'e3_boss', 'e4_boss'];

      for (const enemyId of bossIds) {
        const result: BattleResult = {
          victory: true, stageId: 's5_4', enemyId,
          turns: 4, correctCount: 4, totalQuestions: 4,
          accuracyRate: 1.0, starRating: 3, expGained: 100, stonesGained: 30, comboMax: 4,
        };
        state = advanceBossRush(state, result);
      }

      expect(isBossRushComplete(state)).toBe(true);
      expect(state.totalExp).toBe(400);
      expect(state.totalStones).toBe(120);
      expect(state.completedBosses).toHaveLength(4);
      expect(state.currentBossIndex).toBe(4);
    });
  });
});
