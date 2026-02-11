import { describe, it, expect } from 'vitest';
import { applyBattleResultToSave, isChapterCleared } from '../models/SaveDataUpdater.ts';
import type { SaveData, BattleResult, TurnResult } from '../models/types.ts';
import { createInitialZukanJodoushi, createInitialZukanEnemies } from '../models/ZukanManager.ts';

function createTestSave(): SaveData {
  return {
    player: {
      level: 1, exp: 0, maxHP: 110, attackBonus: 2, stones: 0,
      cards: [], equippedDeck: [],
    },
    stageClears: [],
    zukanJodoushi: createInitialZukanJodoushi(),
    zukanEnemies: createInitialZukanEnemies(),
    currentChapter: 1,
    totalPlayTime: 0,
    lastPlayed: '2025-01-01T00:00:00.000Z',
  };
}

function createTestBattleResult(overrides: Partial<BattleResult> = {}): BattleResult {
  return {
    victory: true,
    stageId: 's1_1',
    enemyId: 'e1_1',
    turns: 4,
    correctCount: 3,
    totalQuestions: 4,
    accuracyRate: 0.75,
    starRating: 1,
    expGained: 20,
    stonesGained: 10,
    comboMax: 3,
    ...overrides,
  };
}

function createTestTurnResults(): TurnResult[] {
  return [
    { turn: 1, correct: true, damage: 20, speedBonus: 1.3, comboMultiplier: 1.0, elementBonus: 1.0, questionType: 'connection', askedJodoushiId: 'ru', selectedJodoushiId: 'ru', timeElapsed: 2 },
    { turn: 2, correct: true, damage: 25, speedBonus: 1.0, comboMultiplier: 1.15, elementBonus: 1.0, questionType: 'meaning', askedJodoushiId: 'zu', selectedJodoushiId: 'zu', timeElapsed: 5 },
    { turn: 3, correct: false, damage: 0, speedBonus: 0.8, comboMultiplier: 1.0, elementBonus: 1.0, questionType: 'connection', askedJodoushiId: 'su', selectedJodoushiId: 'raru', timeElapsed: 9 },
    { turn: 4, correct: true, damage: 30, speedBonus: 1.3, comboMultiplier: 1.0, elementBonus: 1.5, questionType: 'conjugation', askedJodoushiId: 'ru', selectedJodoushiId: 'ru', timeElapsed: 1 },
  ];
}

describe('SaveDataUpdater', () => {
  describe('applyBattleResultToSave', () => {
    it('バトル後に助動詞図鑑の遭遇データが更新される', () => {
      const save = createTestSave();
      const result = createTestBattleResult();
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      const ruEntry = updated.zukanJodoushi.find(z => z.id === 'ru');
      expect(ruEntry!.encountered).toBe(true);
      expect(ruEntry!.totalCount).toBe(2); // ruは2回出題
      expect(ruEntry!.correctCount).toBe(2); // 2回とも正解
    });

    it('不正解の助動詞も図鑑に反映される', () => {
      const save = createTestSave();
      const result = createTestBattleResult();
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      const suEntry = updated.zukanJodoushi.find(z => z.id === 'su');
      expect(suEntry!.encountered).toBe(true);
      expect(suEntry!.totalCount).toBe(1);
      expect(suEntry!.correctCount).toBe(0); // 不正解
    });

    it('敵の遭遇データが更新される', () => {
      const save = createTestSave();
      const result = createTestBattleResult({ victory: true, enemyId: 'e1_1' });
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      const enemyEntry = updated.zukanEnemies.find(z => z.id === 'e1_1');
      expect(enemyEntry!.encountered).toBe(true);
      expect(enemyEntry!.defeated).toBe(true);
      expect(enemyEntry!.defeatCount).toBe(1);
    });

    it('敗北時は撃破カウントが増えない', () => {
      const save = createTestSave();
      const result = createTestBattleResult({ victory: false, enemyId: 'e1_1' });
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      const enemyEntry = updated.zukanEnemies.find(z => z.id === 'e1_1');
      expect(enemyEntry!.encountered).toBe(true);
      expect(enemyEntry!.defeated).toBe(false);
      expect(enemyEntry!.defeatCount).toBe(0);
    });

    it('複数回バトルで図鑑データが累積する', () => {
      const save = createTestSave();
      const result = createTestBattleResult();
      const turnResults = createTestTurnResults();

      const updated1 = applyBattleResultToSave(save, result, turnResults);
      const updated2 = applyBattleResultToSave(updated1, result, turnResults);

      const ruEntry = updated2.zukanJodoushi.find(z => z.id === 'ru');
      expect(ruEntry!.totalCount).toBe(4); // 2回 x 2バトル
      expect(ruEntry!.correctCount).toBe(4);
    });

    it('元のセーブデータを変更しない（イミュータブル）', () => {
      const save = createTestSave();
      const result = createTestBattleResult();
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      const originalRu = save.zukanJodoushi.find(z => z.id === 'ru');
      expect(originalRu!.encountered).toBe(false);
      expect(updated).not.toBe(save);
    });

    it('図鑑が空の場合でも初期化して更新する', () => {
      const save = createTestSave();
      save.zukanJodoushi = [];
      save.zukanEnemies = [];
      const result = createTestBattleResult();
      const turnResults = createTestTurnResults();

      const updated = applyBattleResultToSave(save, result, turnResults);

      expect(updated.zukanJodoushi.length).toBe(26);
      expect(updated.zukanEnemies.length).toBeGreaterThan(0);
      const ruEntry = updated.zukanJodoushi.find(z => z.id === 'ru');
      expect(ruEntry!.encountered).toBe(true);
    });
  });

  describe('isChapterCleared', () => {
    it('全ステージクリアでtrueを返す', () => {
      const stageClears = [
        { stageId: 's1_1', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_2', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_3', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_4', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_5', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_6', cleared: true, bestStars: 1 as const, clearCount: 1 },
      ];
      expect(isChapterCleared(1, stageClears)).toBe(true);
    });

    it('一部未クリアでfalseを返す', () => {
      const stageClears = [
        { stageId: 's1_1', cleared: true, bestStars: 1 as const, clearCount: 1 },
        { stageId: 's1_2', cleared: true, bestStars: 1 as const, clearCount: 1 },
      ];
      expect(isChapterCleared(1, stageClears)).toBe(false);
    });

    it('空のクリアデータでfalseを返す', () => {
      expect(isChapterCleared(1, [])).toBe(false);
    });
  });
});
