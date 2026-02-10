// ============================================================
// カードレベルアップ・強化ロジック
// ============================================================

import type { SkillCard, Rarity } from './types.ts';
import { MAX_CARD_LEVEL } from './types.ts';

const RARITY_COST_MULTIPLIER: Record<Rarity, number> = {
  N: 1,
  R: 2,
  SR: 3,
  SSR: 5,
};

const RARITY_POWER_INCREASE: Record<Rarity, number> = {
  N: 2,
  R: 3,
  SR: 4,
  SSR: 5,
};

export function calculateUpgradeCost(currentLevel: number, rarity: Rarity): number {
  return (3 + currentLevel * 2) * RARITY_COST_MULTIPLIER[rarity];
}

export function canUpgradeCard(card: SkillCard, stones: number): boolean {
  if (card.level >= MAX_CARD_LEVEL) return false;
  return stones >= calculateUpgradeCost(card.level, card.rarity);
}

export function upgradeCard(card: SkillCard): SkillCard {
  if (card.level >= MAX_CARD_LEVEL) return { ...card };

  return {
    ...card,
    level: card.level + 1,
    power: card.power + RARITY_POWER_INCREASE[card.rarity],
  };
}
