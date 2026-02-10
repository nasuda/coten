import { describe, it, expect } from 'vitest';
import { generateQuestion, generateChoices } from '../models/QuestionGenerator.ts';
import { allJodoushi } from '../data/jodoushi.ts';
import type { SkillCard } from '../models/types.ts';

function makeCard(jodoushiId: string): SkillCard {
  const j = allJodoushi.find(d => d.id === jodoushiId)!;
  return { id: `card_${jodoushiId}`, jodoushiId, name: j.name, rarity: j.rarity, element: j.element, level: 1, power: j.basePower };
}

describe('QuestionGenerator', () => {
  describe('generateQuestion', () => {
    it('Chapter1の問題が生成できる', () => {
      const hand = [makeCard('ru'), makeCard('su'), makeCard('zu'), makeCard('ki'), makeCard('mu')];
      const q = generateQuestion(1, hand, 'connection');
      expect(q).not.toBeNull();
      if (q) {
        expect(q.type).toBe('connection');
        expect(q.displayText).toBeTruthy();
        expect(q.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.correctCardIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctCardIndex).toBeLessThan(q.choices.length);
      }
    });

    it('meaning問題が生成できる', () => {
      const hand = [makeCard('ru'), makeCard('su'), makeCard('zu'), makeCard('ki'), makeCard('mu')];
      const q = generateQuestion(1, hand, 'meaning');
      if (q) {
        expect(q.type).toBe('meaning');
        expect(q.typeLabel).toBeTruthy();
      }
    });

    it('conjugation問題が生成できる', () => {
      const hand = [makeCard('ru'), makeCard('su'), makeCard('zu'), makeCard('ki'), makeCard('mu')];
      const q = generateQuestion(1, hand, 'conjugation');
      if (q) {
        expect(q.type).toBe('conjugation');
      }
    });

    it('正解カードが選択肢に含まれる', () => {
      const hand = [makeCard('ru'), makeCard('su'), makeCard('zu'), makeCard('ki'), makeCard('mu')];
      for (let i = 0; i < 10; i++) {
        const q = generateQuestion(1, hand);
        if (q) {
          const correctCard = q.choices[q.correctCardIndex];
          expect(correctCard).toBeDefined();
        }
      }
    });
  });

  describe('generateChoices', () => {
    it('指定した数の選択肢を生成する', () => {
      const correctCard = makeCard('zu');
      const pool = [makeCard('ru'), makeCard('su'), makeCard('ki'), makeCard('mu'), makeCard('keri')];
      const result = generateChoices(correctCard, pool, 5);
      expect(result.choices).toHaveLength(5);
      expect(result.correctIndex).toBeGreaterThanOrEqual(0);
      expect(result.correctIndex).toBeLessThan(5);
    });

    it('正解カードが選択肢に含まれる', () => {
      const correctCard = makeCard('zu');
      const pool = [makeCard('ru'), makeCard('su'), makeCard('ki'), makeCard('mu'), makeCard('keri')];
      const result = generateChoices(correctCard, pool, 5);
      expect(result.choices[result.correctIndex]!.jodoushiId).toBe('zu');
    });
  });
});
