import { describe, it, expect } from 'vitest';
import { validateDeck, swapDeckCard, getAvailableCardsForDeck, DECK_SIZE } from '../models/DeckManager.ts';
import type { SkillCard } from '../models/types.ts';

function makeCard(id: string, jodoushiId: string): SkillCard {
  return { id, jodoushiId, name: jodoushiId, rarity: 'N', element: 'dark', level: 1, power: 10 };
}

const allCards: SkillCard[] = [
  makeCard('c1', 'zu'),
  makeCard('c2', 'ki'),
  makeCard('c3', 'keri'),
  makeCard('c4', 'mu'),
  makeCard('c5', 'ru'),
  makeCard('c6', 'nu'),
  makeCard('c7', 'tsu'),
];

const validDeck = ['c1', 'c2', 'c3', 'c4', 'c5'];

describe('DeckManager', () => {
  describe('validateDeck', () => {
    it('5枚のデッキは有効', () => {
      expect(validateDeck(validDeck, allCards).valid).toBe(true);
    });

    it('5枚未満のデッキは無効', () => {
      const result = validateDeck(['c1', 'c2'], allCards);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain(`${DECK_SIZE}`);
    });

    it('重複カードがあると無効', () => {
      const result = validateDeck(['c1', 'c1', 'c3', 'c4', 'c5'], allCards);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('重複');
    });

    it('所持していないカードがあると無効', () => {
      const result = validateDeck(['c1', 'c2', 'c3', 'c4', 'c_unknown'], allCards);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('所持');
    });
  });

  describe('swapDeckCard', () => {
    it('デッキのカードを入れ替える', () => {
      const newDeck = swapDeckCard(validDeck, 'c1', 'c6');
      expect(newDeck).toContain('c6');
      expect(newDeck).not.toContain('c1');
      expect(newDeck).toHaveLength(5);
    });

    it('入れ替え対象がデッキにない場合は元のデッキを返す', () => {
      const newDeck = swapDeckCard(validDeck, 'c_notfound', 'c6');
      expect(newDeck).toEqual(validDeck);
    });

    it('入れ替え先がすでにデッキにある場合は位置を交換する', () => {
      const newDeck = swapDeckCard(validDeck, 'c1', 'c3');
      expect(newDeck[0]).toBe('c3');
      expect(newDeck[2]).toBe('c1');
    });

    it('元のデッキ配列を変更しない', () => {
      const original = [...validDeck];
      swapDeckCard(validDeck, 'c1', 'c6');
      expect(validDeck).toEqual(original);
    });
  });

  describe('getAvailableCardsForDeck', () => {
    it('デッキに入っていないカードを返す', () => {
      const available = getAvailableCardsForDeck(allCards, validDeck);
      expect(available).toHaveLength(2);
      expect(available.map(c => c.id)).toContain('c6');
      expect(available.map(c => c.id)).toContain('c7');
    });

    it('全カードがデッキに入っている場合は空配列を返す', () => {
      const fiveCards = allCards.slice(0, 5);
      const deck = fiveCards.map(c => c.id);
      const available = getAvailableCardsForDeck(fiveCards, deck);
      expect(available).toHaveLength(0);
    });
  });
});
