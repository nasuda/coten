// ============================================================
// 言霊大戦 型定義
// ============================================================

import type { Element, Rarity, ConnectionCategory } from '../../models/types.ts';

// --- 動詞の活用型 ---
export type VerbType =
  | 'yodan'          // 四段活用
  | 'kami_nidan'     // 上二段活用
  | 'shimo_nidan'    // 下二段活用
  | 'kami_ichidan'   // 上一段活用
  | 'shimo_ichidan'  // 下一段活用
  | 'ka_hen'         // カ行変格
  | 'sa_hen'         // サ行変格
  | 'na_hen'         // ナ行変格
  | 'ra_hen';        // ラ行変格

// --- 活用形 ---
export interface VerbConjugation {
  mizenkei: string;   // 未然形
  renyoukei: string;  // 連用形
  shuushikei: string; // 終止形
  rentaikei: string;  // 連体形
  izenkei: string;    // 已然形
  meireikei: string;  // 命令形
}

// 活用形の名前ラベル
export const CONJUGATION_LABELS: Record<keyof VerbConjugation, string> = {
  mizenkei: '未然形',
  renyoukei: '連用形',
  shuushikei: '終止形',
  rentaikei: '連体形',
  izenkei: '已然形',
  meireikei: '命令形',
};

// --- 動詞カード定義 ---
export interface TCGVerbCardDef {
  id: string;
  name: string;
  verbType: VerbType;
  conjugation: VerbConjugation;
  maxHP: number;
  attack: number;
  element: Element;
  emoji: string;
}

// --- TCG用助動詞カード ---
export interface TCGJodoushiCard {
  id: string;
  jodoushiId: string;
  name: string;
  connectionCategory: ConnectionCategory;
  connection: string;
  element: Element;
  rarity: Rarity;
  power: number;
  meanings: string[];
  skillName: string;
}

// --- カード種別判定用 ---
export type TCGCard =
  | { type: 'verb'; card: TCGVerbCardDef }
  | { type: 'jodoushi'; card: TCGJodoushiCard };

// --- フィールド上の動詞カード ---
export interface TCGVerbInPlay {
  card: TCGVerbCardDef;
  currentHP: number;
  equippedJodoushi: TCGJodoushiCard | null;
  hasAttacked: boolean;
}

// --- フィールドスロット ---
export type TCGFieldSlot = TCGVerbInPlay | null;

// --- プレイヤー状態 ---
export interface TCGPlayerState {
  name: string;
  field: TCGFieldSlot[];    // 3 slots
  hand: TCGCard[];          // max 5
  deck: TCGCard[];          // draw pile
  discard: TCGCard[];       // discard pile
}

// --- 接続クイズ結果 ---
export interface ConnectionQuizResult {
  jodoushiId: string;
  verbId: string;
  selectedForm: string;
  correctForm: string;
  isCorrect: boolean;
  who: 'player' | 'opponent';
}

// --- バトルフェーズ ---
export type TCGBattlePhase =
  | 'setup'
  | 'draw'
  | 'player_action'
  | 'equip_quiz'
  | 'ai_action'
  | 'resolve'
  | 'victory'
  | 'defeat'
  | 'draw_game';

// --- バトル状態 ---
export interface TCGBattleState {
  player: TCGPlayerState;
  opponent: TCGPlayerState;
  currentRound: number;
  maxRounds: number;
  phase: TCGBattlePhase;
  actionTimeLimit: number;
  connectionHistory: ConnectionQuizResult[];
  log: string[];
  winner: 'player' | 'opponent' | null;
}

// --- アクション ---
export type TCGAction =
  | { type: 'place'; handIndex: number; slotIndex: number }
  | { type: 'equip'; handIndex: number; slotIndex: number; selectedForm: string }
  | { type: 'attack'; attackerSlot: number; targetSlot: number }
  | { type: 'pass' };

// --- AI難易度 ---
export type AIDifficulty = 'beginner' | 'intermediate' | 'expert';

// --- AI対戦相手定義 ---
export interface TCGOpponent {
  id: string;
  name: string;
  emoji: string;
  difficulty: AIDifficulty;
  description: string;
  deckVerbs: string[];     // verb card IDs
  deckJodoushi: string[];  // jodoushi IDs
}

// --- TCGバトル結果 ---
export interface TCGBattleResult {
  victory: boolean;
  isDraw: boolean;
  opponentId: string;
  rounds: number;
  connectionCorrect: number;
  connectionTotal: number;
  connectionAccuracy: number;
  playerVerbsAlive: number;
  opponentVerbsAlive: number;
}

// --- TCGデッキ構成 ---
export interface TCGDeckConfig {
  verbs: string[];      // 3 verb IDs
  jodoushi: string[];   // 5 jodoushi IDs
}

// --- TCGセーブデータ ---
export interface TCGSaveData {
  wins: number;
  losses: number;
  draws: number;
  connectionStats: {
    correct: number;
    total: number;
  };
  unlockedOpponents: string[];
  selectedDeck: TCGDeckConfig;
  lastPlayed: string;
}

// --- 定数 ---
export const TCG_FIELD_SLOTS = 3;
export const TCG_MAX_HAND = 5;
export const TCG_MAX_ROUNDS = 7;
export const TCG_ACTION_TIME_LIMIT = 10;
export const TCG_DECK_VERBS = 3;
export const TCG_DECK_JODOUSHI = 5;
export const TCG_INITIAL_DRAW = 5;

// --- 属性相性倍率 ---
export const TCG_ELEMENT_ADVANTAGE_MULTIPLIER = 1.5;
export const TCG_ELEMENT_DISADVANTAGE_MULTIPLIER = 0.75;

// --- TCG画面タイプ ---
export type TCGScreenType = 'tcg_title' | 'tcg_battle' | 'tcg_deck' | 'tcg_result' | 'tcg_practice' | 'tcg_howtoplay';

// --- TCGセーブキー ---
export const TCG_SAVE_KEY = 'kotodama_wars_save';
