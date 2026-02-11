import { describe, it, expect } from 'vitest';
import {
  calculateTCGDamage,
  getElementMultiplier,
  getComboBonus,
} from '../models/TCGDamageCalc.ts';

describe('TCGDamageCalc', () => {
  describe('getElementMultiplier', () => {
    it('有利属性 (fire→ice) → 1.5', () => {
      expect(getElementMultiplier('fire', 'ice')).toBe(1.5);
    });

    it('不利属性 (ice→fire) → 0.75', () => {
      expect(getElementMultiplier('ice', 'fire')).toBe(0.75);
    });

    it('同属性 → 1.0', () => {
      expect(getElementMultiplier('fire', 'fire')).toBe(1.0);
    });

    it('相性なし → 1.0', () => {
      expect(getElementMultiplier('fire', 'earth')).toBe(1.0);
    });

    it('光⇔闇 (light→dark) → 1.5', () => {
      expect(getElementMultiplier('light', 'dark')).toBe(1.5);
    });

    it('闇⇔光 (dark→light) → 1.5', () => {
      expect(getElementMultiplier('dark', 'light')).toBe(1.5);
    });
  });

  describe('getComboBonus', () => {
    it('連続0回 → 1.0', () => {
      expect(getComboBonus(0)).toBe(1.0);
    });

    it('連続1回 → 1.0', () => {
      expect(getComboBonus(1)).toBe(1.0);
    });

    it('連続2回 → 1.15', () => {
      expect(getComboBonus(2)).toBe(1.15);
    });

    it('連続3回 → 1.3', () => {
      expect(getComboBonus(3)).toBe(1.3);
    });

    it('連続4回以上 → 1.5', () => {
      expect(getComboBonus(4)).toBe(1.5);
      expect(getComboBonus(10)).toBe(1.5);
    });
  });

  describe('calculateTCGDamage', () => {
    it('基本ダメージ = power + attack (等倍、コンボなし)', () => {
      const result = calculateTCGDamage({
        jodoushiPower: 15,
        verbAttack: 8,
        jodoushiElement: 'earth',
        targetElement: 'earth',
        consecutiveCorrect: 0,
      });
      expect(result.damage).toBe(23);
      expect(result.elementMultiplier).toBe(1.0);
      expect(result.comboBonus).toBe(1.0);
      expect(result.isAdvantage).toBe(false);
      expect(result.isDisadvantage).toBe(false);
    });

    it('属性有利 → ダメージ1.5倍', () => {
      const result = calculateTCGDamage({
        jodoushiPower: 20,
        verbAttack: 10,
        jodoushiElement: 'fire',
        targetElement: 'ice',
        consecutiveCorrect: 0,
      });
      expect(result.damage).toBe(45); // (20+10) * 1.5
      expect(result.isAdvantage).toBe(true);
    });

    it('コンボ2 → ダメージ1.15倍', () => {
      const result = calculateTCGDamage({
        jodoushiPower: 20,
        verbAttack: 0,
        jodoushiElement: 'earth',
        targetElement: 'earth',
        consecutiveCorrect: 2,
      });
      expect(result.damage).toBe(23); // 20 * 1.15 = 23
      expect(result.comboBonus).toBe(1.15);
    });

    it('属性有利 + コンボ3 → 複合倍率', () => {
      const result = calculateTCGDamage({
        jodoushiPower: 10,
        verbAttack: 10,
        jodoushiElement: 'fire',
        targetElement: 'ice',
        consecutiveCorrect: 3,
      });
      // (10+10) * 1.5 * 1.3 = 39
      expect(result.damage).toBe(39);
    });

    it('最低ダメージは1', () => {
      const result = calculateTCGDamage({
        jodoushiPower: 0,
        verbAttack: 0,
        jodoushiElement: 'ice',
        targetElement: 'fire',
        consecutiveCorrect: 0,
      });
      expect(result.damage).toBe(1);
    });
  });
});
