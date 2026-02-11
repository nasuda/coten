import { describe, it, expect } from 'vitest';
import { checkConnection, validateAnswer, getConjugationChoices } from '../models/ConnectionValidator.ts';
import { getVerbById } from '../data/verbs.ts';
import { getTCGJodoushiById } from '../data/tcg-cards.ts';
import type { TCGJodoushiCard, TCGVerbCardDef } from '../models/tcg-types.ts';

function verb(id: string): TCGVerbCardDef {
  const v = getVerbById(id);
  if (!v) throw new Error(`Verb not found: ${id}`);
  return v;
}

function jodoushi(id: string): TCGJodoushiCard {
  const j = getTCGJodoushiById(id);
  if (!j) throw new Error(`Jodoushi not found: ${id}`);
  return j;
}

describe('ConnectionValidator', () => {
  // === 未然形接続 ===
  describe('未然形接続 (ず)', () => {
    it('四段「書く」に「ず」→ 未然形「書か」が正解', () => {
      const result = checkConnection(jodoushi('zu'), verb('v_kaku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('書か');
      expect(result.requiredFormName).toBe('未然形');
    });

    it('下二段「受く」に「ず」→ 未然形「受け」が正解', () => {
      const result = checkConnection(jodoushi('zu'), verb('v_uku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('受け');
    });

    it('サ変「す」に「ず」→ 未然形「せ」が正解', () => {
      const result = checkConnection(jodoushi('zu'), verb('v_su'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('せ');
    });
  });

  // === 連用形接続 ===
  describe('連用形接続 (き, けり)', () => {
    it('四段「読む」に「き」→ 連用形「読み」が正解', () => {
      const result = checkConnection(jodoushi('ki'), verb('v_yomu'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('読み');
      expect(result.requiredFormName).toBe('連用形');
    });

    it('カ変「来」に「けり」→ 連用形「き」が正解', () => {
      const result = checkConnection(jodoushi('keri'), verb('v_ku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('き');
    });
  });

  // === 終止形接続 ===
  describe('終止形接続 (らむ, べし)', () => {
    it('四段「行く」に「らむ」→ 終止形「行く」が正解', () => {
      const result = checkConnection(jodoushi('ramu'), verb('v_yuku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('行く');
      expect(result.requiredFormName).toBe('終止形');
    });

    it('ラ変「あり」に「べし」→ 終止形「あり」が正解', () => {
      const result = checkConnection(jodoushi('beshi'), verb('v_ari'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('あり');
    });
  });

  // === 体言接続 → 連体形 ===
  describe('体言接続 → 連体形 (なり断定, たり断定, ごとし)', () => {
    it('四段「書く」に「なり(断定)」→ 連体形「書く」が正解', () => {
      const result = checkConnection(jodoushi('nari_dantei'), verb('v_kaku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('書く');
      expect(result.requiredFormName).toBe('連体形');
    });

    it('カ変「来」に「ごとし」→ 連体形「くる」が正解', () => {
      const result = checkConnection(jodoushi('gotoshi'), verb('v_ku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('くる');
    });
  });

  // === る/す の動詞タイプ制限 ===
  describe('る/す: 四段・ナ変・ラ変のみ', () => {
    it('四段「書く」に「る」→ 接続可能', () => {
      const result = checkConnection(jodoushi('ru'), verb('v_kaku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('書か');
    });

    it('ナ変「死ぬ」に「す」→ 接続可能', () => {
      const result = checkConnection(jodoushi('su'), verb('v_shinu'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('死な');
    });

    it('下二段「受く」に「る」→ 接続不可', () => {
      const result = checkConnection(jodoushi('ru'), verb('v_uku'));
      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain('四段・ナ変・ラ変');
    });

    it('上一段「見る」に「す」→ 接続不可', () => {
      const result = checkConnection(jodoushi('su'), verb('v_miru'));
      expect(result.canConnect).toBe(false);
    });

    it('ラ変「あり」に「る」→ 接続可能', () => {
      const result = checkConnection(jodoushi('ru'), verb('v_ari'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('あら');
    });

    it('ラ変「あり」に「す」→ 接続可能', () => {
      const result = checkConnection(jodoushi('su'), verb('v_ari'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('あら');
    });
  });

  // === らる/さす: 四段・ナ変・ラ変以外 ===
  describe('らる/さす: 四段・ナ変・ラ変以外のみ', () => {
    it('下二段「受く」に「らる」→ 接続可能', () => {
      const result = checkConnection(jodoushi('raru'), verb('v_uku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('受け');
    });

    it('四段「書く」に「らる」→ 接続不可', () => {
      const result = checkConnection(jodoushi('raru'), verb('v_kaku'));
      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain('四段・ナ変・ラ変以外');
    });

    it('サ変「す」に「さす」→ 接続可能', () => {
      const result = checkConnection(jodoushi('sasu'), verb('v_su'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('せ');
    });

    it('ラ変「あり」に「らる」→ 接続不可', () => {
      const result = checkConnection(jodoushi('raru'), verb('v_ari'));
      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain('四段・ナ変・ラ変以外');
    });

    it('ナ変「死ぬ」に「さす」→ 接続不可', () => {
      const result = checkConnection(jodoushi('sasu'), verb('v_shinu'));
      expect(result.canConnect).toBe(false);
    });
  });

  // === り: サ変未然形・四段已然形 ===
  describe('り: サ変未然形・四段已然形', () => {
    it('サ変「す」に「り」→ 未然形「せ」が正解', () => {
      const result = checkConnection(jodoushi('ri'), verb('v_su'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('せ');
      expect(result.requiredFormName).toBe('未然形');
    });

    it('四段「咲く」に「り」→ 已然形「咲け」が正解', () => {
      const result = checkConnection(jodoushi('ri'), verb('v_saku'));
      expect(result.canConnect).toBe(true);
      expect(result.requiredForm).toBe('咲け');
      expect(result.requiredFormName).toBe('已然形');
    });

    it('下二段「受く」に「り」→ 接続不可', () => {
      const result = checkConnection(jodoushi('ri'), verb('v_uku'));
      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain('り');
    });

    it('上一段「見る」に「り」→ 接続不可', () => {
      const result = checkConnection(jodoushi('ri'), verb('v_miru'));
      expect(result.canConnect).toBe(false);
    });
  });

  // === validateAnswer ===
  describe('validateAnswer', () => {
    it('正解の活用形を選んだ場合 → correct: true', () => {
      const result = validateAnswer(jodoushi('zu'), verb('v_kaku'), '書か');
      expect(result.correct).toBe(true);
      expect(result.correctForm).toBe('書か');
    });

    it('不正解の活用形を選んだ場合 → correct: false', () => {
      const result = validateAnswer(jodoushi('zu'), verb('v_kaku'), '書き');
      expect(result.correct).toBe(false);
      expect(result.correctForm).toBe('書か');
    });

    it('接続不可の組み合わせ → correct: false, correctForm: null', () => {
      const result = validateAnswer(jodoushi('ru'), verb('v_uku'), '受け');
      expect(result.correct).toBe(false);
      expect(result.correctForm).toBe(null);
    });
  });

  // === getConjugationChoices ===
  describe('getConjugationChoices', () => {
    it('6つの活用形選択肢を返す', () => {
      const choices = getConjugationChoices(verb('v_kaku'));
      expect(choices).toHaveLength(6);
      expect(choices[0]).toEqual({ key: 'mizenkei', label: '未然形', form: '書か' });
      expect(choices[1]).toEqual({ key: 'renyoukei', label: '連用形', form: '書き' });
    });
  });
});
