// ============================================================
// TCG デッキ管理
// ============================================================

import type { TCGDeckConfig } from './tcg-types.ts';
import { TCG_DECK_VERBS, TCG_DECK_JODOUSHI } from './tcg-types.ts';
import { allVerbs } from '../data/verbs.ts';
import { allTCGJodoushiCards } from '../data/tcg-cards.ts';

export interface DeckValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDeck(deck: TCGDeckConfig): DeckValidationResult {
  const errors: string[] = [];

  // 動詞枚数チェック
  if (deck.verbs.length !== TCG_DECK_VERBS) {
    errors.push(`動詞カードは${TCG_DECK_VERBS}枚必要です（現在: ${deck.verbs.length}枚）`);
  }

  // 助動詞枚数チェック
  if (deck.jodoushi.length !== TCG_DECK_JODOUSHI) {
    errors.push(`助動詞カードは${TCG_DECK_JODOUSHI}枚必要です（現在: ${deck.jodoushi.length}枚）`);
  }

  // 動詞の重複チェック
  const verbSet = new Set(deck.verbs);
  if (verbSet.size !== deck.verbs.length) {
    errors.push('動詞カードに重複があります');
  }

  // 助動詞の重複チェック
  const jodoushiSet = new Set(deck.jodoushi);
  if (jodoushiSet.size !== deck.jodoushi.length) {
    errors.push('助動詞カードに重複があります');
  }

  // 動詞の存在チェック
  const verbIds = new Set(allVerbs.map(v => v.id));
  for (const vId of deck.verbs) {
    if (!verbIds.has(vId)) {
      errors.push(`存在しない動詞: ${vId}`);
    }
  }

  // 助動詞の存在チェック
  const jodoushiIds = new Set(allTCGJodoushiCards.map(j => j.jodoushiId));
  for (const jId of deck.jodoushi) {
    if (!jodoushiIds.has(jId)) {
      errors.push(`存在しない助動詞: ${jId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function createDefaultDeck(): TCGDeckConfig {
  return {
    verbs: ['v_kaku', 'v_yomu', 'v_yuku'],
    jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'],
  };
}

export function swapVerb(deck: TCGDeckConfig, index: number, newVerbId: string): TCGDeckConfig {
  if (index < 0 || index >= deck.verbs.length) return deck;
  if (deck.verbs.includes(newVerbId)) return deck; // 重複防止
  const newVerbs = [...deck.verbs];
  newVerbs[index] = newVerbId;
  return { ...deck, verbs: newVerbs, jodoushi: deck.jodoushi };
}

export function swapJodoushi(deck: TCGDeckConfig, index: number, newJodoushiId: string): TCGDeckConfig {
  if (index < 0 || index >= deck.jodoushi.length) return deck;
  if (deck.jodoushi.includes(newJodoushiId)) return deck; // 重複防止
  const newJodoushi = [...deck.jodoushi];
  newJodoushi[index] = newJodoushiId;
  return { ...deck, verbs: deck.verbs, jodoushi: newJodoushi };
}
