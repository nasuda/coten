// ============================================================
// TCG AI行動選択
// ============================================================

import type { TCGBattleState, TCGAction, AIDifficulty, TCGJodoushiCard } from './tcg-types.ts';
import {
  getPlayableVerbIndices,
  getEquippableJodoushiIndices,
  getEmptySlotIndices,
  getOccupiedSlotIndices,
  getEquippedSlotIndices,
  canEquipTo,
} from './TCGBattleEngine.ts';
import { checkConnection } from './ConnectionValidator.ts';

export function selectAIAction(
  state: TCGBattleState,
  difficulty: AIDifficulty,
): TCGAction {
  const ai = state.opponent;

  // 1. 攻撃可能なスロットがあれば攻撃
  const equippedSlots = getEquippedSlotIndices(ai);
  if (equippedSlots.length > 0) {
    const playerTargets = getOccupiedSlotIndices(state.player);
    if (playerTargets.length > 0) {
      const attackerSlot = equippedSlots[0]!;
      const targetSlot = selectTarget(playerTargets, difficulty, state);
      return { type: 'attack', attackerSlot, targetSlot };
    }
  }

  // 2. 助動詞を装備できるか
  const jodoushiIndices = getEquippableJodoushiIndices(ai);
  for (const jIdx of jodoushiIndices) {
    const card = ai.hand[jIdx]!;
    if (card.type !== 'jodoushi') continue;
    const jodoushi = card.card as TCGJodoushiCard;
    const equipableSlots = canEquipTo(jodoushi, ai);
    if (equipableSlots.length > 0) {
      const slotIdx = equipableSlots[0]!;
      const verb = ai.field[slotIdx]!;
      const conn = checkConnection(jodoushi, verb.card);
      if (conn.canConnect && conn.requiredForm) {
        const selectedForm = selectForm(conn.requiredForm, verb.card as unknown as { conjugation: { [key: string]: string } }, difficulty);
        return { type: 'equip', handIndex: jIdx, slotIndex: slotIdx, selectedForm };
      }
    }
  }

  // 3. 動詞カードを配置できるか
  const verbIndices = getPlayableVerbIndices(ai);
  const emptySlots = getEmptySlotIndices(ai);
  if (verbIndices.length > 0 && emptySlots.length > 0) {
    return { type: 'place', handIndex: verbIndices[0]!, slotIndex: emptySlots[0]! };
  }

  // 4. 何もできなければパス
  return { type: 'pass' };
}

function selectTarget(
  targets: number[],
  difficulty: AIDifficulty,
  state: TCGBattleState,
): number {
  if (difficulty === 'expert') {
    // HPが最も低いターゲットを狙う
    let minHP = Infinity;
    let best = targets[0]!;
    for (const t of targets) {
      const slot = state.player.field[t];
      if (slot && slot.currentHP < minHP) {
        minHP = slot.currentHP;
        best = t;
      }
    }
    return best;
  }
  // beginner/intermediate: ランダム
  return targets[Math.floor(Math.random() * targets.length)]!;
}

function selectForm(
  correctForm: string,
  verb: { conjugation: { [key: string]: string } },
  difficulty: AIDifficulty,
): string {
  // AIの正解率を難易度で制御
  const correctChance = difficulty === 'beginner' ? 0.6 : difficulty === 'intermediate' ? 0.85 : 1.0;

  if (Math.random() < correctChance) {
    return correctForm;
  }

  // 不正解: ランダムに別の活用形を選ぶ
  const forms = Object.values(verb.conjugation).filter(f => f !== correctForm);
  if (forms.length === 0) return correctForm;
  return forms[Math.floor(Math.random() * forms.length)]!;
}

export function getAICorrectForm(
  state: TCGBattleState,
  jodoushiIdx: number,
  slotIdx: number,
): string | null {
  const ai = state.opponent;
  const card = ai.hand[jodoushiIdx];
  if (!card || card.type !== 'jodoushi') return null;
  const slot = ai.field[slotIdx];
  if (!slot) return null;
  const conn = checkConnection(card.card as TCGJodoushiCard, slot.card);
  return conn.requiredForm;
}
