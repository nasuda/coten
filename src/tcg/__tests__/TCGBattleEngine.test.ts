import { describe, it, expect } from 'vitest';
import {
  createBattleState,
  drawPhase,
  placeVerb,
  equipJodoushi,
  attack,
  resolvePhase,
  createBattleResult,
  getPlayableVerbIndices,
  getEmptySlotIndices,
  getEquippedSlotIndices,
} from '../models/TCGBattleEngine.ts';
import type { TCGBattleState, TCGDeckConfig, TCGPlayerState } from '../models/tcg-types.ts';
import { getVerbById } from '../data/verbs.ts';

const testPlayerDeck: TCGDeckConfig = {
  verbs: ['v_kaku', 'v_yomu', 'v_yuku'],
  jodoushi: ['zu', 'ki', 'keri', 'mu', 'beshi'],
};

const testOpponentDeck: TCGDeckConfig = {
  verbs: ['v_tatsu', 'v_saku', 'v_ari'],
  jodoushi: ['tsu', 'nu', 'tari_kanryou', 'ri', 'ramu'],
};

describe('TCGBattleEngine', () => {
  describe('createBattleState', () => {
    it('初期状態を正しく生成する', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト対戦相手');
      expect(state.currentRound).toBe(0);
      expect(state.maxRounds).toBe(7);
      expect(state.phase).toBe('setup');
      expect(state.winner).toBe(null);
      expect(state.player.name).toBe('プレイヤー');
      expect(state.opponent.name).toBe('テスト対戦相手');
      // 5枚ドロー + 残り3枚
      expect(state.player.hand.length).toBe(5);
      expect(state.player.deck.length).toBe(3);
      expect(state.player.field.every(s => s === null)).toBe(true);
    });
  });

  describe('drawPhase', () => {
    it('ラウンド数が増加し、各プレイヤーが1枚ドローする', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const after = drawPhase(state);
      expect(after.currentRound).toBe(1);
      expect(after.phase).toBe('player_action');
      // デッキから1枚ドロー（5→6枚）
      expect(after.player.hand.length).toBe(6);
      expect(after.player.deck.length).toBe(2);
    });

    it('デッキが空なら手札は増えない', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      // 3枚全部ドロー
      let s = state;
      s = drawPhase(s);
      s = drawPhase(s);
      s = drawPhase(s);
      const deckEmpty = s;
      expect(deckEmpty.player.deck.length).toBe(0);
      const afterEmpty = drawPhase(deckEmpty);
      expect(afterEmpty.player.hand.length).toBe(deckEmpty.player.hand.length);
    });
  });

  describe('placeVerb', () => {
    it('手札から動詞カードをフィールドに配置できる', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const verbIdx = state.player.hand.findIndex(c => c.type === 'verb');
      if (verbIdx === -1) return; // unlikely in shuffled deck
      const after = placeVerb(state, 'player', verbIdx, 0);
      expect(after.player.field[0]).not.toBe(null);
      expect(after.player.hand.length).toBe(state.player.hand.length - 1);
    });

    it('助動詞カードは配置できない', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const jIdx = state.player.hand.findIndex(c => c.type === 'jodoushi');
      if (jIdx === -1) return;
      const after = placeVerb(state, 'player', jIdx, 0);
      // 状態が変わらない
      expect(after.player.field[0]).toBe(null);
    });

    it('既にカードがあるスロットには配置できない', () => {
      let state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const verbIdx = state.player.hand.findIndex(c => c.type === 'verb');
      if (verbIdx === -1) return;
      state = placeVerb(state, 'player', verbIdx, 0);
      const verbIdx2 = state.player.hand.findIndex(c => c.type === 'verb');
      if (verbIdx2 === -1) return;
      const after = placeVerb(state, 'player', verbIdx2, 0);
      // スロット0は最初の動詞のまま
      expect(after.player.field[0]?.card.id).toBe(state.player.field[0]?.card.id);
    });
  });

  describe('equipJodoushi', () => {
    function setupFieldState(): TCGBattleState {
      // 手動で状態を構築（シャッフルに依存しない）
      const kaku = getVerbById('v_kaku')!;
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      // フィールドにv_kakuを手動配置
      const newField = [...state.player.field];
      newField[0] = { card: kaku, currentHP: kaku.maxHP, equippedJodoushi: null, hasAttacked: false };
      // 手札に「ず」を追加
      const newHand = [
        { type: 'jodoushi' as const, card: { id: 'tcg_zu', jodoushiId: 'zu', name: 'ず', connectionCategory: 'mizenkei' as const, connection: '未然形', element: 'dark' as const, rarity: 'N' as const, power: 12, meanings: ['打消'], skillName: '虚無への回帰' } },
        ...state.player.hand,
      ];
      return {
        ...state,
        player: { ...state.player, field: newField, hand: newHand },
      };
    }

    it('正しい活用形で装備成功', () => {
      const state = setupFieldState();
      const after = equipJodoushi(state, 'player', 0, 0, '書か');
      expect(after.player.field[0]?.equippedJodoushi).not.toBe(null);
      expect(after.player.hand.length).toBe(state.player.hand.length - 1);
      expect(after.connectionHistory).toHaveLength(1);
      expect(after.connectionHistory[0]?.isCorrect).toBe(true);
    });

    it('不正解の活用形で装備失敗、カードは手札に残る', () => {
      const state = setupFieldState();
      const after = equipJodoushi(state, 'player', 0, 0, '書き');
      expect(after.player.field[0]?.equippedJodoushi).toBe(null);
      expect(after.player.hand.length).toBe(state.player.hand.length); // 手札変わらず
      expect(after.connectionHistory).toHaveLength(1);
      expect(after.connectionHistory[0]?.isCorrect).toBe(false);
    });
  });

  describe('attack', () => {
    function setupBattleState(): TCGBattleState {
      const kaku = getVerbById('v_kaku')!;
      const tatsu = getVerbById('v_tatsu')!;
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');

      const playerField = [...state.player.field];
      playerField[0] = {
        card: kaku,
        currentHP: kaku.maxHP,
        equippedJodoushi: {
          id: 'tcg_zu', jodoushiId: 'zu', name: 'ず',
          connectionCategory: 'mizenkei', connection: '未然形',
          element: 'dark', rarity: 'N', power: 12,
          meanings: ['打消'], skillName: '虚無への回帰',
        },
        hasAttacked: false,
      };

      const opponentField = [...state.opponent.field];
      opponentField[0] = {
        card: tatsu,
        currentHP: tatsu.maxHP,
        equippedJodoushi: null,
        hasAttacked: false,
      };

      return {
        ...state,
        player: { ...state.player, field: playerField },
        opponent: { ...state.opponent, field: opponentField },
      };
    }

    it('装備済みカードで攻撃するとダメージを与える', () => {
      const state = setupBattleState();
      const after = attack(state, 'player', 0, 0);
      const originalHP = state.opponent.field[0]!.currentHP;
      expect(after.opponent.field[0]!.currentHP).toBeLessThan(originalHP);
    });

    it('攻撃後、助動詞はdiscardに移りhasAttackedがtrue', () => {
      const state = setupBattleState();
      const after = attack(state, 'player', 0, 0);
      expect(after.player.field[0]?.equippedJodoushi).toBe(null);
      expect(after.player.field[0]?.hasAttacked).toBe(true);
      expect(after.player.discard).toHaveLength(1);
    });

    it('装備なしでは攻撃できない', () => {
      const state = setupBattleState();
      // スロット1には何もない
      const after = attack(state, 'player', 1, 0);
      expect(after).toBe(state); // 状態変わらず
    });
  });

  describe('resolvePhase', () => {
    it('HP0のカードが除去される', () => {
      const kaku = getVerbById('v_kaku')!;
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const opponentField = [...state.opponent.field];
      opponentField[0] = { card: kaku, currentHP: 0, equippedJodoushi: null, hasAttacked: false };
      const s = { ...state, opponent: { ...state.opponent, field: opponentField } };
      const after = resolvePhase(s);
      expect(after.opponent.field[0]).toBe(null);
    });

    it('相手の全動詞撃破で勝利', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      // 相手: フィールドに動詞なし、手札にも動詞なし、デッキにも動詞なし
      const emptyOpponent: TCGPlayerState = {
        ...state.opponent,
        field: [null, null, null],
        hand: state.opponent.hand.filter(c => c.type !== 'verb'),
        deck: state.opponent.deck.filter(c => c.type !== 'verb'),
      };
      const s = { ...state, opponent: emptyOpponent };
      const after = resolvePhase(s);
      expect(after.winner).toBe('player');
      expect(after.phase).toBe('victory');
    });

    it('最大ラウンド到達でHP合計判定', () => {
      const kaku = getVerbById('v_kaku')!;
      const tatsu = getVerbById('v_tatsu')!;
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');

      const s: TCGBattleState = {
        ...state,
        currentRound: 7,
        player: {
          ...state.player,
          field: [
            { card: kaku, currentHP: 20, equippedJodoushi: null, hasAttacked: false },
            null, null,
          ],
          hand: [],
          deck: [],
        },
        opponent: {
          ...state.opponent,
          field: [
            { card: tatsu, currentHP: 5, equippedJodoushi: null, hasAttacked: false },
            null, null,
          ],
          hand: [],
          deck: [],
        },
      };
      const after = resolvePhase(s);
      expect(after.winner).toBe('player');
    });
  });

  describe('createBattleResult', () => {
    it('バトル結果を正しく生成する', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const s: TCGBattleState = {
        ...state,
        currentRound: 5,
        winner: 'player',
        connectionHistory: [
          { jodoushiId: 'zu', verbId: 'v_kaku', selectedForm: '書か', correctForm: '書か', isCorrect: true, who: 'player' },
          { jodoushiId: 'ki', verbId: 'v_yomu', selectedForm: '読み', correctForm: '読み', isCorrect: true, who: 'player' },
          { jodoushiId: 'mu', verbId: 'v_yuku', selectedForm: '行き', correctForm: '行か', isCorrect: false, who: 'player' },
        ],
      };
      const result = createBattleResult(s, 'opp_1');
      expect(result.victory).toBe(true);
      expect(result.opponentId).toBe('opp_1');
      expect(result.rounds).toBe(5);
      expect(result.connectionCorrect).toBe(2);
      expect(result.connectionTotal).toBe(3);
      expect(result.connectionAccuracy).toBe(67);
    });
  });

  describe('ユーティリティ関数', () => {
    it('getPlayableVerbIndices: 手札内の動詞インデックスを返す', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      const indices = getPlayableVerbIndices(state.player);
      for (const i of indices) {
        expect(state.player.hand[i]?.type).toBe('verb');
      }
    });

    it('getEmptySlotIndices: 空スロットのインデックスを返す', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      expect(getEmptySlotIndices(state.player)).toEqual([0, 1, 2]);
    });

    it('getEquippedSlotIndices: 装備済みスロットを返す', () => {
      const state = createBattleState(testPlayerDeck, testOpponentDeck, 'テスト');
      expect(getEquippedSlotIndices(state.player)).toEqual([]); // 初期状態は空
    });
  });
});
