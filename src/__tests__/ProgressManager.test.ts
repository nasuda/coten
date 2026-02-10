import { describe, it, expect } from 'vitest';
import { calculateExpForLevel, calculateLevelUp, calculatePlayerStats, calculateStarRating, calculateStonesReward } from '../models/ProgressManager.ts';

describe('ProgressManager', () => {
  describe('calculateExpForLevel', () => {
    it('レベル1の必要経験値は100', () => {
      expect(calculateExpForLevel(1)).toBe(100);
    });

    it('レベルが上がると必要経験値が増える', () => {
      const exp1 = calculateExpForLevel(1);
      const exp2 = calculateExpForLevel(2);
      const exp10 = calculateExpForLevel(10);
      expect(exp2).toBeGreaterThan(exp1);
      expect(exp10).toBeGreaterThan(exp2);
    });

    it('レベル50の必要経験値が計算できる', () => {
      const exp = calculateExpForLevel(50);
      expect(exp).toBeGreaterThan(0);
    });
  });

  describe('calculateLevelUp', () => {
    it('十分な経験値でレベルアップする', () => {
      const result = calculateLevelUp(1, 0, 150);
      expect(result.newLevel).toBe(2);
      expect(result.remainingExp).toBe(50);
      expect(result.levelsGained).toBe(1);
    });

    it('経験値不足ではレベルアップしない', () => {
      const result = calculateLevelUp(1, 0, 50);
      expect(result.newLevel).toBe(1);
      expect(result.remainingExp).toBe(50);
      expect(result.levelsGained).toBe(0);
    });

    it('複数レベル同時に上がれる', () => {
      const result = calculateLevelUp(1, 0, 500);
      expect(result.newLevel).toBeGreaterThan(2);
      expect(result.levelsGained).toBeGreaterThan(1);
    });

    it('最大レベル50を超えない', () => {
      const result = calculateLevelUp(49, 0, 99999);
      expect(result.newLevel).toBeLessThanOrEqual(50);
    });
  });

  describe('calculatePlayerStats', () => {
    it('レベル1のステータス', () => {
      const stats = calculatePlayerStats(1);
      expect(stats.maxHP).toBe(110);
      expect(stats.attackBonus).toBe(2);
    });

    it('レベル50のステータス', () => {
      const stats = calculatePlayerStats(50);
      expect(stats.maxHP).toBe(600);
      expect(stats.attackBonus).toBe(100);
    });
  });

  describe('calculateStarRating', () => {
    it('全問正解で★3', () => {
      expect(calculateStarRating(1.0)).toBe(3);
    });

    it('正答率80%以上で★2', () => {
      expect(calculateStarRating(0.85)).toBe(2);
    });

    it('正答率60%以上で★1', () => {
      expect(calculateStarRating(0.65)).toBe(1);
    });

    it('正答率60%未満で★0', () => {
      expect(calculateStarRating(0.5)).toBe(0);
    });
  });

  describe('calculateStonesReward', () => {
    it('初回クリアで石10個', () => {
      const stones = calculateStonesReward(false, false, false);
      expect(stones).toBe(10);
    });

    it('ボス撃破で石30個', () => {
      const stones = calculateStonesReward(false, true, false);
      expect(stones).toBe(30);
    });

    it('再クリアでは石0個', () => {
      const stones = calculateStonesReward(true, false, false);
      expect(stones).toBe(0);
    });

    it('チャプタークリアでボーナス50個が加算される', () => {
      const stones = calculateStonesReward(false, true, true);
      expect(stones).toBe(80); // ボス30 + チャプターボーナス50
    });

    it('通常ステージでもチャプタークリアなら+50個', () => {
      const stones = calculateStonesReward(false, false, true);
      expect(stones).toBe(60); // 通常10 + チャプターボーナス50
    });

    it('再クリアはチャプタークリアでも0個', () => {
      const stones = calculateStonesReward(true, true, true);
      expect(stones).toBe(0);
    });
  });
});
