import { describe, it, expect } from 'vitest';
import { buildWeaknessProfile, weightQuestions, weightedRandomPick } from '../models/WeaknessTracker.ts';
import type { ZukanJodoushiEntry, QuestionTemplate, WeaknessProfile } from '../models/types.ts';

function makeEntry(id: string, correct: number, total: number, masteryLevel = 0, typeStats?: ZukanJodoushiEntry['typeStats']): ZukanJodoushiEntry {
  return { id, encountered: total > 0, correctCount: correct, totalCount: total, masteryLevel, typeStats };
}

function makeQuestion(id: string, jodoushiId: string, type: QuestionTemplate['type'] = 'connection'): QuestionTemplate {
  return { id, type, sentence: 'test', correctJodoushiId: jodoushiId, chapter: 1 };
}

describe('WeaknessTracker', () => {
  describe('buildWeaknessProfile', () => {
    it('未遭遇の助動詞はweight=2.0になる', () => {
      const entries = [makeEntry('ru', 0, 0)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBe(2.0);
    });

    it('正答率0%の助動詞はweight=4.0になる', () => {
      const entries = [makeEntry('ru', 0, 10)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBe(4.0);
    });

    it('正答率100%の助動詞はweight=1.0になる', () => {
      const entries = [makeEntry('ru', 10, 10)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBe(1.0);
    });

    it('正答率50%の助動詞はweight=1.75になる', () => {
      const entries = [makeEntry('ru', 5, 10)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBe(1.75);
    });

    it('マスタリーLv4以上は重みが0.3倍になる', () => {
      const entries = [makeEntry('ru', 10, 10, 4)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBeCloseTo(0.3);
    });

    it('マスタリーLv3以下は重みが減少しない', () => {
      const entries = [makeEntry('ru', 10, 10, 3)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.jodoushiWeakness.get('ru')).toBe(1.0);
    });

    it('typeStatsが空の場合、全タイプweight=2.0になる', () => {
      const entries = [makeEntry('ru', 5, 10)];
      const profile = buildWeaknessProfile(entries);
      expect(profile.typeWeakness.connection).toBe(2.0);
      expect(profile.typeWeakness.meaning).toBe(2.0);
    });

    it('typeStatsを集計してタイプ別重みを計算する', () => {
      const entries = [
        makeEntry('ru', 5, 10, 0, { connection: { correct: 3, total: 10 } }),
        makeEntry('zu', 5, 10, 0, { connection: { correct: 7, total: 10 } }),
      ];
      const profile = buildWeaknessProfile(entries);
      // 合計: correct=10, total=20 → accuracy=0.5 → 1 + 0.25*3 = 1.75
      expect(profile.typeWeakness.connection).toBe(1.75);
    });
  });

  describe('weightQuestions', () => {
    it('プロファイルに基づいて問題に重みを付与する', () => {
      const profile: WeaknessProfile = {
        jodoushiWeakness: new Map([['ru', 4.0], ['zu', 1.0]]),
        typeWeakness: { connection: 2.0, meaning: 1.0, conjugation: 1.0, composite: 1.0 },
      };
      const questions = [
        makeQuestion('q1', 'ru', 'connection'),
        makeQuestion('q2', 'zu', 'meaning'),
      ];
      const weighted = weightQuestions(questions, profile);
      expect(weighted[0]!.weight).toBe(8.0); // 4.0 * 2.0
      expect(weighted[1]!.weight).toBe(1.0); // 1.0 * 1.0
    });

    it('プロファイルにない助動詞はweight=2.0として扱う', () => {
      const profile: WeaknessProfile = {
        jodoushiWeakness: new Map(),
        typeWeakness: { connection: 1.0, meaning: 1.0, conjugation: 1.0, composite: 1.0 },
      };
      const questions = [makeQuestion('q1', 'unknown', 'connection')];
      const weighted = weightQuestions(questions, profile);
      expect(weighted[0]!.weight).toBe(2.0);
    });
  });

  describe('weightedRandomPick', () => {
    it('単一要素の場合、その要素を返す', () => {
      const result = weightedRandomPick([{ item: 'a', weight: 1.0 }]);
      expect(result).toBe('a');
    });

    it('重みの高い要素が選ばれやすい（統計的検証）', () => {
      const counts: Record<string, number> = { heavy: 0, light: 0 };
      for (let i = 0; i < 1000; i++) {
        const result = weightedRandomPick([
          { item: 'heavy', weight: 9.0 },
          { item: 'light', weight: 1.0 },
        ]);
        counts[result]!++;
      }
      // heavyが80%以上選ばれるはず（期待値90%）
      expect(counts.heavy).toBeGreaterThan(700);
    });
  });
});
