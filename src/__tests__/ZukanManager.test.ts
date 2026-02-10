import { describe, it, expect } from 'vitest';
import { updateJodoushiEntry, calculateMasteryLevel, createInitialZukanJodoushi, createInitialZukanEnemies } from '../models/ZukanManager.ts';

describe('ZukanManager', () => {
  describe('updateJodoushiEntry', () => {
    it('初回遭遇でencounteredがtrueになる', () => {
      const entry = { id: 'zu', encountered: false, correctCount: 0, totalCount: 0, masteryLevel: 0 };
      const updated = updateJodoushiEntry(entry, true);
      expect(updated.encountered).toBe(true);
      expect(updated.totalCount).toBe(1);
      expect(updated.correctCount).toBe(1);
    });

    it('正解で正解数と総数が増える', () => {
      const entry = { id: 'zu', encountered: true, correctCount: 5, totalCount: 8, masteryLevel: 1 };
      const updated = updateJodoushiEntry(entry, true);
      expect(updated.correctCount).toBe(6);
      expect(updated.totalCount).toBe(9);
    });

    it('不正解で総数のみ増える', () => {
      const entry = { id: 'zu', encountered: true, correctCount: 5, totalCount: 8, masteryLevel: 1 };
      const updated = updateJodoushiEntry(entry, false);
      expect(updated.correctCount).toBe(5);
      expect(updated.totalCount).toBe(9);
    });
  });

  describe('calculateMasteryLevel', () => {
    it('0問でレベル0', () => {
      expect(calculateMasteryLevel(0, 0)).toBe(0);
    });

    it('正答5問/正答率80%以上でレベル1', () => {
      expect(calculateMasteryLevel(5, 5)).toBeGreaterThanOrEqual(1);
    });

    it('正答10問/正答率80%以上でレベル2', () => {
      expect(calculateMasteryLevel(10, 12)).toBeGreaterThanOrEqual(2);
    });

    it('正答20問/正答率85%以上でレベル3', () => {
      expect(calculateMasteryLevel(20, 22)).toBeGreaterThanOrEqual(3);
    });

    it('最大レベル5を超えない', () => {
      expect(calculateMasteryLevel(999, 999)).toBeLessThanOrEqual(5);
    });
  });

  describe('createInitialZukanJodoushi', () => {
    it('26個のエントリを生成する', () => {
      const entries = createInitialZukanJodoushi();
      expect(entries).toHaveLength(26);
    });

    it('全てencounteredがfalse', () => {
      const entries = createInitialZukanJodoushi();
      for (const e of entries) {
        expect(e.encountered).toBe(false);
      }
    });
  });

  describe('createInitialZukanEnemies', () => {
    it('全敵のエントリを生成する', () => {
      const entries = createInitialZukanEnemies();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('全てencounteredがfalse', () => {
      const entries = createInitialZukanEnemies();
      for (const e of entries) {
        expect(e.encountered).toBe(false);
        expect(e.defeated).toBe(false);
      }
    });
  });
});
