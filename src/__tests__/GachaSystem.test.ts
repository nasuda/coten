import { describe, it, expect } from 'vitest';
import { rollGacha, canAffordGacha } from '../models/GachaSystem.ts';
import { gachaPools } from '../data/gacha-pools.ts';

describe('GachaSystem', () => {
  describe('rollGacha', () => {
    it('ガチャ結果がカードを返す', () => {
      const pool = gachaPools[0]!;
      const result = rollGacha(pool);
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
      expect(result.jodoushiId).toBeTruthy();
      expect(result.name).toBeTruthy();
      expect(result.rarity).toBeTruthy();
    });

    it('100回回してレアリティ分布が概ね正しい', () => {
      const pool = gachaPools[0]!;
      const counts = { N: 0, R: 0, SR: 0, SSR: 0 };
      for (let i = 0; i < 100; i++) {
        const result = rollGacha(pool);
        counts[result.rarity]++;
      }
      // 大まかな分布チェック（確率的なので大きなマージン）
      expect(counts.N).toBeGreaterThan(10);
      expect(counts.R).toBeGreaterThan(5);
    });

    it('プレミアムガチャでも結果が返る', () => {
      const pool = gachaPools[1]!;
      const result = rollGacha(pool);
      expect(result).toBeDefined();
    });
  });

  describe('canAffordGacha', () => {
    it('石が足りていればtrue', () => {
      expect(canAffordGacha(10, gachaPools[0]!)).toBe(true);
    });

    it('石が足りなければfalse', () => {
      expect(canAffordGacha(5, gachaPools[0]!)).toBe(false);
    });

    it('ちょうどの場合はtrue', () => {
      expect(canAffordGacha(10, gachaPools[0]!)).toBe(true);
    });
  });
});
