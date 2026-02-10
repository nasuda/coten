import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateSpeedBonus, calculateElementBonus, calculateComboMultiplier } from '../models/DamageCalculator.ts';

describe('DamageCalculator', () => {
  describe('calculateDamage', () => {
    it('基本ダメージが正しく計算される', () => {
      const damage = calculateDamage({
        basePower: 10,
        playerAttack: 20,
        enemyDefense: 5,
        comboMultiplier: 1.0,
        speedBonus: 1.0,
        elementBonus: 1.0,
        isCritical: false,
        isSpecial: false,
      });
      expect(damage).toBeGreaterThan(0);
    });

    it('コンボ倍率が反映される', () => {
      const base = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      const combo = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.6, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      expect(combo).toBeGreaterThan(base);
    });

    it('速度ボーナスが反映される', () => {
      const fast = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.3, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      const slow = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 0.8, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      expect(fast).toBeGreaterThan(slow);
    });

    it('属性有利が反映される', () => {
      const neutral = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      const advantage = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.5,
        isCritical: false, isSpecial: false,
      });
      expect(advantage).toBeGreaterThan(neutral);
    });

    it('クリティカルで約1.5倍', () => {
      const normal = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      const crit = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: true, isSpecial: false,
      });
      // 乗算はfloor前に適用されるため、±1の誤差を許容
      expect(crit).toBeGreaterThanOrEqual(Math.floor(normal * 1.5));
      expect(crit).toBeLessThanOrEqual(Math.ceil(normal * 1.5));
    });

    it('必殺技で約2.5倍', () => {
      const normal = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      const special = calculateDamage({
        basePower: 10, playerAttack: 20, enemyDefense: 5,
        comboMultiplier: 1.0, speedBonus: 1.0, elementBonus: 1.0,
        isCritical: false, isSpecial: true,
      });
      expect(special).toBeGreaterThanOrEqual(Math.floor(normal * 2.5));
      expect(special).toBeLessThanOrEqual(Math.ceil(normal * 2.5));
    });

    it('ダメージは最低1', () => {
      const damage = calculateDamage({
        basePower: 1, playerAttack: 1, enemyDefense: 999,
        comboMultiplier: 1.0, speedBonus: 0.8, elementBonus: 1.0,
        isCritical: false, isSpecial: false,
      });
      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateSpeedBonus', () => {
    it('0-3秒で1.3倍「疾風！」', () => {
      const result = calculateSpeedBonus(2);
      expect(result.multiplier).toBe(1.3);
      expect(result.label).toBe('疾風！');
    });

    it('3-7秒で1.0倍', () => {
      const result = calculateSpeedBonus(5);
      expect(result.multiplier).toBe(1.0);
      expect(result.label).toBe('');
    });

    it('7-10秒で0.8倍', () => {
      const result = calculateSpeedBonus(8);
      expect(result.multiplier).toBe(0.8);
      expect(result.label).toBe('');
    });
  });

  describe('calculateElementBonus', () => {
    it('属性有利で1.5倍', () => {
      expect(calculateElementBonus('fire', 'ice')).toBe(1.5);
    });

    it('属性不利で0.75倍', () => {
      expect(calculateElementBonus('ice', 'fire')).toBe(0.75);
    });

    it('属性等倍で1.0倍', () => {
      expect(calculateElementBonus('fire', 'water')).toBe(1.0);
    });

    it('同属性で1.0倍', () => {
      expect(calculateElementBonus('fire', 'fire')).toBe(1.0);
    });

    it('光⇔闇は相互有利', () => {
      expect(calculateElementBonus('light', 'dark')).toBe(1.5);
      expect(calculateElementBonus('dark', 'light')).toBe(1.5);
    });
  });

  describe('calculateComboMultiplier', () => {
    it('コンボ0で1.0倍', () => {
      expect(calculateComboMultiplier(0)).toBe(1.0);
    });

    it('コンボ1で1.0倍', () => {
      expect(calculateComboMultiplier(1)).toBe(1.0);
    });

    it('コンボ3で1.3倍', () => {
      expect(calculateComboMultiplier(3)).toBe(1.3);
    });

    it('コンボ5以上で1.6倍', () => {
      expect(calculateComboMultiplier(5)).toBe(1.6);
      expect(calculateComboMultiplier(10)).toBe(1.6);
    });
  });
});
