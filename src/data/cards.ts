// ============================================================
// スキルカード定義
// ============================================================

import type { SkillCard } from '../models/types.ts';
import { allJodoushi } from './jodoushi.ts';

export function createCardFromJodoushi(jodoushiId: string, suffix = 'default'): SkillCard {
  const j = allJodoushi.find(d => d.id === jodoushiId);
  if (!j) throw new Error(`Unknown jodoushi: ${jodoushiId}`);
  return {
    id: `card_${jodoushiId}_${suffix}`,
    jodoushiId: j.id,
    name: j.name,
    rarity: j.rarity,
    element: j.element,
    level: 1,
    power: j.basePower,
  };
}

export function createStarterDeck(): SkillCard[] {
  return [
    createCardFromJodoushi('zu', 'starter'),
    createCardFromJodoushi('ki', 'starter'),
    createCardFromJodoushi('keri', 'starter'),
    createCardFromJodoushi('mu', 'starter'),
    createCardFromJodoushi('ru', 'starter'),
  ];
}

export function getCardPower(card: SkillCard): number {
  return card.power + (card.level - 1) * 3;
}
