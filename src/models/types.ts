// ============================================================
// 文法無双 型定義
// ============================================================

// --- 属性 ---
export type Element = 'fire' | 'ice' | 'wind' | 'light' | 'dark' | 'earth' | 'phantom' | 'water';

// --- レアリティ ---
export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

// --- 接続カテゴリ ---
export type ConnectionCategory =
  | 'mizenkei'      // 未然形
  | 'renyoukei'     // 連用形
  | 'shuushikei'    // 終止形
  | 'rentaikei'     // 連体形
  | 'taigen'        // 体言
  | 'special';      // 特殊接続

// --- 問題タイプ ---
export type QuestionType = 'connection' | 'meaning' | 'conjugation' | 'composite';

// --- 星評価 ---
export type StarRating = 0 | 1 | 2 | 3;

// --- 助動詞データ (RPG拡張) ---
export interface JodoushiData {
  id: string;
  name: string;
  meanings: string[];
  connection: string;
  connectionCategory: ConnectionCategory;
  conjugationType: string;
  conjugation: {
    mizenkei: string;
    renyoukei: string;
    shuushikei: string;
    rentaikei: string;
    izenkei: string;
    meireikei: string;
  };
  mnemonic: string;
  exampleSentence: string;
  exampleModern: string;
  chapter: number;
  element: Element;
  rarity: Rarity;
  skillName: string;
  skillRuby: string;
  basePower: number;
}

// --- スキルカード ---
export interface SkillCard {
  id: string;
  jodoushiId: string;
  name: string;
  rarity: Rarity;
  element: Element;
  level: number;
  power: number;
}

// --- 必殺技 ---
export interface SpecialSkill {
  id: string;
  jodoushiId: string;
  name: string;
  ruby: string;
  element: Element;
  power: number;
  description: string;
}

// --- 敵キャラ ---
export interface Enemy {
  id: string;
  name: string;
  level: number;
  maxHP: number;
  attack: number;
  defense: number;
  element: Element;
  emoji: string;
  isBoss: boolean;
  stageId: string;
  dropStones: number;
  dropExp: number;
  gimmick?: EnemyGimmick;
}

export interface EnemyGimmick {
  type: 'barrier' | 'timeAccel' | 'extraChoices' | 'heal' | 'reflect';
  description: string;
  value: number;
}

// --- ステージ ---
export interface Stage {
  id: string;
  chapterId: number;
  name: string;
  description: string;
  enemies: string[];  // enemy IDs
  requiredJodoushi: string[];  // jodoushi IDs used
  unlockCondition: string | null;  // stage ID to clear first
  isBossStage: boolean;
}

// --- チャプター ---
export interface Chapter {
  id: number;
  name: string;
  theme: string;
  description: string;
  stages: string[];  // stage IDs
  bossName: string;
}

// --- 問題テンプレート ---
export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  sentence: string;
  correctJodoushiId: string;
  chapter: number;
  hint?: string;
  // meaning type
  targetMeaning?: string;
  // conjugation type
  targetForm?: string;
  targetAnswer?: string;
}

// --- バトル中の問題 ---
export interface BattleQuestion {
  template: QuestionTemplate;
  type: QuestionType;
  displayText: string;
  typeLabel: string;
  correctCardIndex: number;
  choices: SkillCard[];
}

// --- バトル状態 ---
export interface BattleState {
  enemy: Enemy;
  enemyCurrentHP: number;
  playerCurrentHP: number;
  playerMaxHP: number;
  playerAttack: number;
  turn: number;
  maxTurns: number;
  combo: number;
  comboGauge: number;      // 0-100
  specialReady: boolean;
  hand: SkillCard[];
  currentQuestion: BattleQuestion | null;
  timerStartedAt: number;
  timeLimit: number;       // seconds
  phase: BattlePhase;
  log: string[];
  turnResults: TurnResult[];
}

export type BattlePhase =
  | 'intro'
  | 'question'
  | 'answering'
  | 'result_correct'
  | 'result_wrong'
  | 'result_timeout'
  | 'special_attack'
  | 'enemy_turn'
  | 'victory'
  | 'defeat';

// --- ターン結果 ---
export interface TurnResult {
  turn: number;
  correct: boolean;
  damage: number;
  speedBonus: number;
  comboMultiplier: number;
  elementBonus: number;
  questionType: QuestionType;
  answeredJodoushiId: string;
  timeElapsed: number;
}

// --- バトル結果 ---
export interface BattleResult {
  victory: boolean;
  stageId: string;
  enemyId: string;
  turns: number;
  correctCount: number;
  totalQuestions: number;
  accuracyRate: number;
  starRating: StarRating;
  expGained: number;
  stonesGained: number;
  comboMax: number;
}

// --- プレイヤーデータ ---
export interface PlayerData {
  level: number;
  exp: number;
  maxHP: number;
  attackBonus: number;
  stones: number;
  cards: SkillCard[];
  equippedDeck: string[];  // card IDs (max 5)
}

// --- 図鑑エントリ ---
export interface ZukanJodoushiEntry {
  id: string;
  encountered: boolean;
  correctCount: number;
  totalCount: number;
  masteryLevel: number;  // 0-5
}

export interface ZukanEnemyEntry {
  id: string;
  encountered: boolean;
  defeated: boolean;
  defeatCount: number;
}

// --- ステージクリアデータ ---
export interface StageClearData {
  stageId: string;
  cleared: boolean;
  bestStars: StarRating;
  clearCount: number;
}

// --- ガチャプール ---
export interface GachaPool {
  id: string;
  name: string;
  cost: number;
  rates: {
    N: number;
    R: number;
    SR: number;
    SSR: number;
  };
  availableCards: string[];  // jodoushi IDs
}

// --- セーブデータ ---
export interface SaveData {
  player: PlayerData;
  stageClears: StageClearData[];
  zukanJodoushi: ZukanJodoushiEntry[];
  zukanEnemies: ZukanEnemyEntry[];
  currentChapter: number;
  totalPlayTime: number;
  lastPlayed: string;
}

// --- 画面タイプ ---
export type ScreenType = 'title' | 'menu' | 'world' | 'battle' | 'result' | 'gacha' | 'zukan';

// --- ダメージ計算入力 ---
export interface DamageInput {
  basePower: number;
  playerAttack: number;
  enemyDefense: number;
  comboMultiplier: number;
  speedBonus: number;
  elementBonus: number;
  isCritical: boolean;
  isSpecial: boolean;
}

// --- 属性相性 ---
export const ELEMENT_ADVANTAGE: Record<Element, Element> = {
  fire: 'ice',
  ice: 'wind',
  wind: 'fire',
  light: 'dark',
  dark: 'light',
  earth: 'phantom',
  phantom: 'water',
  water: 'earth',
};

// --- レベル定数 ---
export const MAX_PLAYER_LEVEL = 50;
export const MAX_CARD_LEVEL = 10;
export const MASTERY_MAX = 5;

// --- 速度ボーナス定数 ---
export const SPEED_THRESHOLDS = {
  fast: { max: 3, multiplier: 1.3, label: '疾風！' },
  normal: { max: 7, multiplier: 1.0, label: '' },
  slow: { max: 10, multiplier: 0.8, label: '' },
} as const;

// --- コンボ定数 ---
export const COMBO_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.15,
  3: 1.3,
  4: 1.45,
  5: 1.6,
};

export const COMBO_GAUGE_PER_CORRECT = 20;
export const COMBO_GAUGE_PENALTY = 0.5;  // wrong answer: gauge × this

// --- 反撃ダメージ ---
export const ENEMY_COUNTER_RATIO = 0.125;  // 12.5% of player maxHP
