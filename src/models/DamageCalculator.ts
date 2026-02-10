// ============================================================
// ダメージ計算エンジン
// ============================================================

import type { DamageInput, Element } from './types.ts';
import { ELEMENT_ADVANTAGE, SPEED_THRESHOLDS, COMBO_MULTIPLIERS } from './types.ts';

export function calculateDamage(input: DamageInput): number {
  const { basePower, playerAttack, enemyDefense, comboMultiplier, speedBonus, elementBonus, isCritical, isSpecial } = input;

  let damage = (basePower + playerAttack - enemyDefense * 0.5) * comboMultiplier * speedBonus * elementBonus;

  if (isCritical) damage *= 1.5;
  if (isSpecial) damage *= 2.5;

  return Math.max(1, Math.floor(damage));
}

export function calculateSpeedBonus(timeElapsed: number): { multiplier: number; label: string } {
  if (timeElapsed <= SPEED_THRESHOLDS.fast.max) {
    return { multiplier: SPEED_THRESHOLDS.fast.multiplier, label: SPEED_THRESHOLDS.fast.label };
  }
  if (timeElapsed <= SPEED_THRESHOLDS.normal.max) {
    return { multiplier: SPEED_THRESHOLDS.normal.multiplier, label: SPEED_THRESHOLDS.normal.label };
  }
  return { multiplier: SPEED_THRESHOLDS.slow.multiplier, label: SPEED_THRESHOLDS.slow.label };
}

export function calculateElementBonus(attackElement: Element, defenseElement: Element): number {
  if (attackElement === defenseElement) return 1.0;
  if (ELEMENT_ADVANTAGE[attackElement] === defenseElement) return 1.5;
  if (ELEMENT_ADVANTAGE[defenseElement] === attackElement) return 0.75;
  return 1.0;
}

export function calculateComboMultiplier(combo: number): number {
  if (combo >= 5) return COMBO_MULTIPLIERS[5]!;
  return COMBO_MULTIPLIERS[combo] ?? 1.0;
}

export function calculateCounterDamage(playerMaxHP: number, ratio = 0.125): number {
  return Math.max(1, Math.floor(playerMaxHP * ratio));
}
