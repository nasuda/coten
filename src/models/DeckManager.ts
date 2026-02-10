// ============================================================
// デッキ管理ロジック
// ============================================================

import type { SkillCard } from './types.ts';

export const DECK_SIZE = 5;

export interface DeckValidation {
  valid: boolean;
  reason?: string;
}

export function validateDeck(deck: string[], ownedCards: SkillCard[]): DeckValidation {
  if (deck.length !== DECK_SIZE) {
    return { valid: false, reason: `デッキは${DECK_SIZE}枚必要です` };
  }

  const uniqueIds = new Set(deck);
  if (uniqueIds.size !== deck.length) {
    return { valid: false, reason: '重複カードがあります' };
  }

  const ownedIds = new Set(ownedCards.map(c => c.id));
  for (const cardId of deck) {
    if (!ownedIds.has(cardId)) {
      return { valid: false, reason: '所持していないカードが含まれています' };
    }
  }

  return { valid: true };
}

export function swapDeckCard(deck: string[], removeId: string, addId: string): string[] {
  const removeIdx = deck.indexOf(removeId);
  if (removeIdx === -1) return [...deck];

  const newDeck = [...deck];
  const addIdx = deck.indexOf(addId);

  if (addIdx !== -1) {
    // 両方デッキにある場合は位置を交換
    newDeck[removeIdx] = addId;
    newDeck[addIdx] = removeId;
  } else {
    newDeck[removeIdx] = addId;
  }

  return newDeck;
}

export function getAvailableCardsForDeck(ownedCards: SkillCard[], currentDeck: string[]): SkillCard[] {
  const deckSet = new Set(currentDeck);
  return ownedCards.filter(c => !deckSet.has(c.id));
}
