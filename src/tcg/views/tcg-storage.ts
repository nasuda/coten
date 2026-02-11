// ============================================================
// TCG セーブデータ管理
// ============================================================

import type { TCGSaveData, TCGBattleResult, TCGDeckConfig } from '../models/tcg-types.ts';
import { TCG_SAVE_KEY } from '../models/tcg-types.ts';
import { createDefaultDeck } from '../models/TCGDeckManager.ts';

function createDefaultTCGSave(): TCGSaveData {
  return {
    wins: 0,
    losses: 0,
    draws: 0,
    connectionStats: { correct: 0, total: 0 },
    unlockedOpponents: ['opp_1', 'opp_2'],
    selectedDeck: createDefaultDeck(),
    lastPlayed: new Date().toISOString(),
  };
}

export function loadTCGSave(): TCGSaveData {
  const raw = localStorage.getItem(TCG_SAVE_KEY);
  if (!raw) return createDefaultTCGSave();
  try {
    return JSON.parse(raw) as TCGSaveData;
  } catch {
    return createDefaultTCGSave();
  }
}

export function saveTCGSave(data: TCGSaveData): void {
  data.lastPlayed = new Date().toISOString();
  try {
    localStorage.setItem(TCG_SAVE_KEY, JSON.stringify(data));
  } catch {
    // save failure is non-critical
  }
}

export function applyBattleResult(result: TCGBattleResult): void {
  const save = loadTCGSave();
  if (result.isDraw) {
    save.draws = (save.draws ?? 0) + 1;
  } else if (result.victory) {
    save.wins++;
  } else {
    save.losses++;
  }
  save.connectionStats.correct += result.connectionCorrect;
  save.connectionStats.total += result.connectionTotal;
  saveTCGSave(save);
}

export function applyPracticeResult(correct: number, total: number): void {
  const save = loadTCGSave();
  save.connectionStats.correct += correct;
  save.connectionStats.total += total;
  saveTCGSave(save);
}

export function getSelectedDeck(): TCGDeckConfig {
  return loadTCGSave().selectedDeck;
}

export function saveSelectedDeck(deck: TCGDeckConfig): void {
  const save = loadTCGSave();
  save.selectedDeck = deck;
  saveTCGSave(save);
}
