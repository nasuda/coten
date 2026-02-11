import { describe, it, expect } from 'vitest';
import { selectAIAction } from '../models/TCGAIPlayer.ts';
import { createBattleState } from '../models/TCGBattleEngine.ts';
import type { TCGBattleState, TCGDeckConfig } from '../models/tcg-types.ts';
import { getVerbById } from '../data/verbs.ts';

const playerDeck: TCGDeckConfig = {
  verbs: ['v_kaku', 'v_yomu', 'v_yuku'],
  jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'],
};

const aiDeck: TCGDeckConfig = {
  verbs: ['v_tatsu', 'v_saku', 'v_ari'],
  jodoushi: ['tsu', 'nu', 'tari_kanryou', 'ki', 'keri'],
};

describe('TCGAIPlayer', () => {
  describe('selectAIAction', () => {
    it('動詞を配置可能なら配置する', () => {
      const state = createBattleState(playerDeck, aiDeck, 'AI');
      // AIの手札に動詞があり、フィールドが空ならplaceアクション
      const hasVerb = state.opponent.hand.some(c => c.type === 'verb');
      if (!hasVerb) return;
      const action = selectAIAction(state, 'beginner');
      expect(action.type).toBe('place');
    });

    it('何もできない場合はパスする', () => {
      const state = createBattleState(playerDeck, aiDeck, 'AI');
      // 手札を空にする
      const emptyState: TCGBattleState = {
        ...state,
        opponent: { ...state.opponent, hand: [], deck: [] },
      };
      const action = selectAIAction(emptyState, 'beginner');
      expect(action.type).toBe('pass');
    });

    it('フィールドに動詞があり助動詞が装備可能なら装備を試みる', () => {
      const state = createBattleState(playerDeck, aiDeck, 'AI');
      const tatsu = getVerbById('v_tatsu')!;
      // フィールドに動詞を配置済み、手札に連用形接続助動詞あり
      const modState: TCGBattleState = {
        ...state,
        opponent: {
          ...state.opponent,
          field: [
            { card: tatsu, currentHP: tatsu.maxHP, equippedJodoushi: null, hasAttacked: false },
            null,
            null,
          ],
          hand: [
            { type: 'jodoushi', card: { id: 'tcg_ki', jodoushiId: 'ki', name: 'き', connectionCategory: 'renyoukei', connection: '連用形', element: 'earth', rarity: 'N', power: 12, meanings: ['過去'], skillName: '追憶の刻' } },
          ],
          deck: [],
        },
      };
      const action = selectAIAction(modState, 'expert');
      expect(action.type).toBe('equip');
    });

    it('装備済みスロットがあればプレイヤーを攻撃する', () => {
      const state = createBattleState(playerDeck, aiDeck, 'AI');
      const tatsu = getVerbById('v_tatsu')!;
      const kaku = getVerbById('v_kaku')!;

      const modState: TCGBattleState = {
        ...state,
        player: {
          ...state.player,
          field: [
            { card: kaku, currentHP: kaku.maxHP, equippedJodoushi: null, hasAttacked: false },
            null, null,
          ],
        },
        opponent: {
          ...state.opponent,
          field: [
            {
              card: tatsu, currentHP: tatsu.maxHP, hasAttacked: false,
              equippedJodoushi: { id: 'tcg_ki', jodoushiId: 'ki', name: 'き', connectionCategory: 'renyoukei', connection: '連用形', element: 'earth', rarity: 'N', power: 12, meanings: ['過去'], skillName: '追憶の刻' },
            },
            null, null,
          ],
          hand: [],
          deck: [],
        },
      };
      const action = selectAIAction(modState, 'beginner');
      expect(action.type).toBe('attack');
    });

    it('expertはHPが最も低いターゲットを狙う', () => {
      const state = createBattleState(playerDeck, aiDeck, 'AI');
      const kaku = getVerbById('v_kaku')!;
      const yomu = getVerbById('v_yomu')!;
      const tatsu = getVerbById('v_tatsu')!;

      const modState: TCGBattleState = {
        ...state,
        player: {
          ...state.player,
          field: [
            { card: kaku, currentHP: 20, equippedJodoushi: null, hasAttacked: false },
            { card: yomu, currentHP: 5, equippedJodoushi: null, hasAttacked: false },
            null,
          ],
        },
        opponent: {
          ...state.opponent,
          field: [
            {
              card: tatsu, currentHP: tatsu.maxHP, hasAttacked: false,
              equippedJodoushi: { id: 'tcg_ki', jodoushiId: 'ki', name: 'き', connectionCategory: 'renyoukei', connection: '連用形', element: 'earth', rarity: 'N', power: 12, meanings: ['過去'], skillName: '追憶の刻' },
            },
            null, null,
          ],
          hand: [],
          deck: [],
        },
      };
      const action = selectAIAction(modState, 'expert');
      expect(action.type).toBe('attack');
      if (action.type === 'attack') {
        expect(action.targetSlot).toBe(1); // HP 5 のyomuを狙う
      }
    });
  });
});
