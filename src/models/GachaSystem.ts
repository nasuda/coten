// ============================================================
// ガチャロジック
// ============================================================

import type { SkillCard, GachaPool, Rarity } from './types.ts';
import { allJodoushi } from '../data/jodoushi.ts';

export function rollGacha(pool: GachaPool): SkillCard {
  const rarity = rollRarity(pool.rates);
  const cardId = pickCardFromPool(pool.availableCards, rarity);

  const jodoushi = allJodoushi.find(j => j.id === cardId)!;

  return {
    id: `gacha_${jodoushi.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    jodoushiId: jodoushi.id,
    name: jodoushi.name,
    rarity,
    element: jodoushi.element,
    level: 1,
    power: jodoushi.basePower + rarityPowerBonus(rarity),
  };
}

function rollRarity(rates: GachaPool['rates']): Rarity {
  const rand = Math.random();
  let cumulative = 0;

  cumulative += rates.SSR;
  if (rand < cumulative) return 'SSR';

  cumulative += rates.SR;
  if (rand < cumulative) return 'SR';

  cumulative += rates.R;
  if (rand < cumulative) return 'R';

  return 'N';
}

function pickCardFromPool(availableCards: string[], targetRarity: Rarity): string {
  // ターゲットレアリティに合う助動詞をフィルタ
  const matching = availableCards.filter(id => {
    const j = allJodoushi.find(d => d.id === id);
    return j && j.rarity === targetRarity;
  });

  // マッチするカードがなければ全体からランダム
  const pool = matching.length > 0 ? matching : availableCards;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function rarityPowerBonus(rarity: Rarity): number {
  switch (rarity) {
    case 'N': return 0;
    case 'R': return 3;
    case 'SR': return 8;
    case 'SSR': return 15;
  }
}

export function canAffordGacha(stones: number, pool: GachaPool): boolean {
  return stones >= pool.cost;
}
