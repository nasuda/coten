import { describe, it, expect } from 'vitest';
import { allJodoushi } from '../data/jodoushi.ts';

describe('助動詞データ整合性', () => {
  it('26個の助動詞が存在する', () => {
    expect(allJodoushi).toHaveLength(26);
  });

  it('全てのidが一意である', () => {
    const ids = allJodoushi.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('全ての必須フィールドが存在する', () => {
    for (const j of allJodoushi) {
      expect(j.id).toBeTruthy();
      expect(j.name).toBeTruthy();
      expect(j.meanings.length).toBeGreaterThan(0);
      expect(j.connection).toBeTruthy();
      expect(j.connectionCategory).toBeTruthy();
      expect(j.conjugationType).toBeTruthy();
      expect(j.conjugation.shuushikei).toBeTruthy();
      expect(j.chapter).toBeGreaterThanOrEqual(1);
      expect(j.chapter).toBeLessThanOrEqual(4);
      expect(j.element).toBeTruthy();
      expect(j.rarity).toBeTruthy();
      expect(j.skillName).toBeTruthy();
      expect(j.skillRuby).toBeTruthy();
      expect(j.basePower).toBeGreaterThan(0);
    }
  });

  it('接続カテゴリが有効な値である', () => {
    const validCategories = ['mizenkei', 'renyoukei', 'shuushikei', 'rentaikei', 'taigen', 'special'];
    for (const j of allJodoushi) {
      expect(validCategories).toContain(j.connectionCategory);
    }
  });

  it('レアリティが有効な値である', () => {
    const validRarities = ['N', 'R', 'SR', 'SSR'];
    for (const j of allJodoushi) {
      expect(validRarities).toContain(j.rarity);
    }
  });

  it('属性が有効な値である', () => {
    const validElements = ['fire', 'ice', 'wind', 'light', 'dark', 'earth', 'phantom', 'water'];
    for (const j of allJodoushi) {
      expect(validElements).toContain(j.element);
    }
  });

  it('Chapter1は6個の助動詞を持つ', () => {
    const ch1 = allJodoushi.filter(j => j.chapter === 1);
    expect(ch1).toHaveLength(6);
  });

  it('Chapter2は6個の助動詞を持つ', () => {
    const ch2 = allJodoushi.filter(j => j.chapter === 2);
    expect(ch2).toHaveLength(6);
  });

  it('Chapter3は6個の助動詞を持つ', () => {
    const ch3 = allJodoushi.filter(j => j.chapter === 3);
    expect(ch3).toHaveLength(6);
  });

  it('Chapter4は8個の助動詞を持つ', () => {
    const ch4 = allJodoushi.filter(j => j.chapter === 4);
    expect(ch4).toHaveLength(8);
  });

  it('各活用形が文字列である', () => {
    for (const j of allJodoushi) {
      const c = j.conjugation;
      expect(typeof c.mizenkei).toBe('string');
      expect(typeof c.renyoukei).toBe('string');
      expect(typeof c.shuushikei).toBe('string');
      expect(typeof c.rentaikei).toBe('string');
      expect(typeof c.izenkei).toBe('string');
      expect(typeof c.meireikei).toBe('string');
    }
  });
});
