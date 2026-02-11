// ============================================================
// JodoushiData → TCGJodoushiCard 変換
// ============================================================

import type { JodoushiData } from '../../models/types.ts';
import type { TCGJodoushiCard } from '../models/tcg-types.ts';
import { allJodoushi } from '../../data/jodoushi.ts';

export function convertToTCGCard(j: JodoushiData): TCGJodoushiCard {
  return {
    id: `tcg_${j.id}`,
    jodoushiId: j.id,
    name: j.name,
    connectionCategory: j.connectionCategory,
    connection: j.connection,
    element: j.element,
    rarity: j.rarity,
    power: j.basePower,
    meanings: j.meanings,
    skillName: j.skillName,
  };
}

export const allTCGJodoushiCards: TCGJodoushiCard[] = allJodoushi.map(convertToTCGCard);

export function getTCGJodoushiById(id: string): TCGJodoushiCard | undefined {
  return allTCGJodoushiCards.find(c => c.jodoushiId === id || c.id === id);
}

export function getTCGJodoushiByIds(ids: string[]): TCGJodoushiCard[] {
  return ids.map(id => getTCGJodoushiById(id)).filter((c): c is TCGJodoushiCard => c != null);
}
