import { describe, it, expect } from 'vitest';
import { upgradeCard, calculateUpgradeCost, canUpgradeCard } from '../models/CardUpgrade.ts';
import type { SkillCard } from '../models/types.ts';
import { MAX_CARD_LEVEL } from '../models/types.ts';

function createTestCard(overrides: Partial<SkillCard> = {}): SkillCard {
  return {
    id: 'card_zu_default',
    jodoushiId: 'zu',
    name: 'ず',
    rarity: 'N',
    element: 'dark',
    level: 1,
    power: 12,
    ...overrides,
  };
}

describe('CardUpgrade', () => {
  describe('calculateUpgradeCost', () => {
    it('レベル1→2の強化コストが計算できる', () => {
      const cost = calculateUpgradeCost(1, 'N');
      expect(cost).toBe(5);
    });

    it('レベルが上がるとコストが増える', () => {
      const cost1 = calculateUpgradeCost(1, 'N');
      const cost5 = calculateUpgradeCost(5, 'N');
      expect(cost5).toBeGreaterThan(cost1);
    });

    it('レアリティが高いとコストが増える', () => {
      const costN = calculateUpgradeCost(1, 'N');
      const costSR = calculateUpgradeCost(1, 'SR');
      const costSSR = calculateUpgradeCost(1, 'SSR');
      expect(costSR).toBeGreaterThan(costN);
      expect(costSSR).toBeGreaterThan(costSR);
    });

    it('各レアリティのレベル1→2コストを正確に計算できる', () => {
      // 公式: (3 + 1*2) * multiplier = 5 * multiplier
      expect(calculateUpgradeCost(1, 'N')).toBe(5);
      expect(calculateUpgradeCost(1, 'R')).toBe(10);
      expect(calculateUpgradeCost(1, 'SR')).toBe(15);
      expect(calculateUpgradeCost(1, 'SSR')).toBe(25);
    });

    it('高レベルのコストも正確に計算できる', () => {
      // 公式: (3 + 9*2) * 5 = 21 * 5 = 105
      expect(calculateUpgradeCost(9, 'SSR')).toBe(105);
    });
  });

  describe('canUpgradeCard', () => {
    it('石が十分あればtrueを返す', () => {
      const card = createTestCard({ level: 1 });
      expect(canUpgradeCard(card, 100)).toBe(true);
    });

    it('石が不足していればfalseを返す', () => {
      const card = createTestCard({ level: 1 });
      expect(canUpgradeCard(card, 0)).toBe(false);
    });

    it('最大レベルではfalseを返す', () => {
      const card = createTestCard({ level: MAX_CARD_LEVEL });
      expect(canUpgradeCard(card, 9999)).toBe(false);
    });

    it('石がコストとちょうど同じならtrueを返す', () => {
      const card = createTestCard({ level: 1, rarity: 'N' });
      const exactCost = calculateUpgradeCost(1, 'N');
      expect(canUpgradeCard(card, exactCost)).toBe(true);
    });

    it('石がコストより1少ないとfalseを返す', () => {
      const card = createTestCard({ level: 1, rarity: 'N' });
      const exactCost = calculateUpgradeCost(1, 'N');
      expect(canUpgradeCard(card, exactCost - 1)).toBe(false);
    });
  });

  describe('upgradeCard', () => {
    it('カードのレベルが1上がる', () => {
      const card = createTestCard({ level: 1, power: 12 });
      const result = upgradeCard(card);
      expect(result.level).toBe(2);
    });

    it('カードのパワーが上がる', () => {
      const card = createTestCard({ level: 1, power: 12 });
      const result = upgradeCard(card);
      expect(result.power).toBeGreaterThan(card.power);
    });

    it('最大レベルでは強化できない', () => {
      const card = createTestCard({ level: MAX_CARD_LEVEL, power: 50 });
      const result = upgradeCard(card);
      expect(result.level).toBe(MAX_CARD_LEVEL);
      expect(result.power).toBe(card.power);
    });

    it('元のカードを変更しない（イミュータブル）', () => {
      const card = createTestCard({ level: 1, power: 12 });
      const result = upgradeCard(card);
      expect(card.level).toBe(1);
      expect(result).not.toBe(card);
    });

    it('レアリティに応じたパワー上昇量が異なる', () => {
      const cardN = createTestCard({ level: 1, power: 12, rarity: 'N' });
      const cardSSR = createTestCard({ level: 1, power: 28, rarity: 'SSR' });
      const resultN = upgradeCard(cardN);
      const resultSSR = upgradeCard(cardSSR);
      const increaseN = resultN.power - cardN.power;
      const increaseSSR = resultSSR.power - cardSSR.power;
      expect(increaseSSR).toBeGreaterThan(increaseN);
    });

    it('レアリティごとのパワー上昇量が正確', () => {
      const testCases: Array<{ rarity: 'N' | 'R' | 'SR' | 'SSR'; expected: number }> = [
        { rarity: 'N', expected: 2 },
        { rarity: 'R', expected: 3 },
        { rarity: 'SR', expected: 4 },
        { rarity: 'SSR', expected: 5 },
      ];
      for (const { rarity, expected } of testCases) {
        const card = createTestCard({ level: 1, power: 10, rarity });
        const result = upgradeCard(card);
        expect(result.power - card.power).toBe(expected);
      }
    });

    it('レベル9→10に強化できるが10からは強化できない', () => {
      const card = createTestCard({ level: 9, power: 30 });
      const upgraded = upgradeCard(card);
      expect(upgraded.level).toBe(10);
      expect(upgraded.power).toBeGreaterThan(30);

      const blocked = upgradeCard(upgraded);
      expect(blocked.level).toBe(10);
      expect(blocked.power).toBe(upgraded.power);
    });
  });
});
