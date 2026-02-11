// ============================================================
// TCG ダメージ計算
// ============================================================

import type { Element } from '../../models/types.ts';
import { ELEMENT_ADVANTAGE } from '../../models/types.ts';
import {
  TCG_ELEMENT_ADVANTAGE_MULTIPLIER,
  TCG_ELEMENT_DISADVANTAGE_MULTIPLIER,
} from './tcg-types.ts';

export interface TCGDamageInput {
  jodoushiPower: number;
  verbAttack: number;
  jodoushiElement: Element;
  targetElement: Element;
  consecutiveCorrect: number;
}

export interface TCGDamageResult {
  damage: number;
  elementMultiplier: number;
  comboBonus: number;
  isAdvantage: boolean;
  isDisadvantage: boolean;
}

export function getElementMultiplier(attackElement: Element, defenseElement: Element): number {
  if (ELEMENT_ADVANTAGE[attackElement] === defenseElement) {
    return TCG_ELEMENT_ADVANTAGE_MULTIPLIER;
  }
  if (ELEMENT_ADVANTAGE[defenseElement] === attackElement) {
    return TCG_ELEMENT_DISADVANTAGE_MULTIPLIER;
  }
  return 1.0;
}

export function getComboBonus(consecutiveCorrect: number): number {
  if (consecutiveCorrect <= 0) return 1.0;
  if (consecutiveCorrect === 1) return 1.0;
  if (consecutiveCorrect === 2) return 1.15;
  if (consecutiveCorrect === 3) return 1.3;
  return 1.5; // 4+
}

export function calculateTCGDamage(input: TCGDamageInput): TCGDamageResult {
  const elementMultiplier = getElementMultiplier(input.jodoushiElement, input.targetElement);
  const comboBonus = getComboBonus(input.consecutiveCorrect);

  const baseDamage = input.jodoushiPower + input.verbAttack;
  const damage = Math.max(1, Math.round(baseDamage * elementMultiplier * comboBonus));

  return {
    damage,
    elementMultiplier,
    comboBonus,
    isAdvantage: elementMultiplier > 1.0,
    isDisadvantage: elementMultiplier < 1.0,
  };
}
