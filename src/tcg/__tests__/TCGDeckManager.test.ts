import { describe, it, expect } from 'vitest';
import {
  validateDeck,
  createDefaultDeck,
  swapVerb,
  swapJodoushi,
} from '../models/TCGDeckManager.ts';
import type { TCGDeckConfig } from '../models/tcg-types.ts';

describe('TCGDeckManager', () => {
  describe('validateDeck', () => {
    it('正しいデッキはvalidを返す', () => {
      const deck = createDefaultDeck();
      const result = validateDeck(deck);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('動詞が足りないとエラー', () => {
      const deck: TCGDeckConfig = { verbs: ['v_kaku', 'v_yomu'], jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'] };
      const result = validateDeck(deck);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('動詞');
    });

    it('助動詞が足りないとエラー', () => {
      const deck: TCGDeckConfig = { verbs: ['v_kaku', 'v_yomu', 'v_yuku'], jodoushi: ['zu', 'ki'] };
      const result = validateDeck(deck);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('助動詞');
    });

    it('動詞の重複はエラー', () => {
      const deck: TCGDeckConfig = { verbs: ['v_kaku', 'v_kaku', 'v_yuku'], jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'] };
      const result = validateDeck(deck);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('重複'))).toBe(true);
    });

    it('存在しない動詞IDはエラー', () => {
      const deck: TCGDeckConfig = { verbs: ['v_kaku', 'v_yomu', 'v_unknown'], jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'] };
      const result = validateDeck(deck);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('存在しない'))).toBe(true);
    });

    it('存在しない助動詞IDはエラー', () => {
      const deck: TCGDeckConfig = { verbs: ['v_kaku', 'v_yomu', 'v_yuku'], jodoushi: ['zu', 'ki', 'keri', 'mu', 'nonexistent'] };
      const result = validateDeck(deck);
      expect(result.valid).toBe(false);
    });
  });

  describe('createDefaultDeck', () => {
    it('デフォルトデッキは有効', () => {
      const deck = createDefaultDeck();
      expect(deck.verbs).toHaveLength(3);
      expect(deck.jodoushi).toHaveLength(5);
      expect(validateDeck(deck).valid).toBe(true);
    });
  });

  describe('swapVerb', () => {
    it('動詞カードを入れ替える', () => {
      const deck = createDefaultDeck();
      const newDeck = swapVerb(deck, 0, 'v_tatsu');
      expect(newDeck.verbs[0]).toBe('v_tatsu');
      expect(newDeck.jodoushi).toEqual(deck.jodoushi);
    });

    it('既にデッキにあるカードには入れ替えない', () => {
      const deck = createDefaultDeck();
      const newDeck = swapVerb(deck, 0, deck.verbs[1]!);
      expect(newDeck.verbs[0]).toBe(deck.verbs[0]); // 変更なし
    });
  });

  describe('swapJodoushi', () => {
    it('助動詞カードを入れ替える', () => {
      const deck = createDefaultDeck();
      const newDeck = swapJodoushi(deck, 0, 'tsu');
      expect(newDeck.jodoushi[0]).toBe('tsu');
    });

    it('範囲外のインデックスでは変更なし', () => {
      const deck = createDefaultDeck();
      const newDeck = swapJodoushi(deck, -1, 'tsu');
      expect(newDeck).toEqual(deck);
    });
  });
});
