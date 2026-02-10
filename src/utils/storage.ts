// ============================================================
// localStorage ラッパー（RPGセーブデータ用）
// ============================================================

import type { SaveData, PlayerData, SkillCard } from '../models/types.ts';

const SAVE_KEY = 'bunpou_musou_save';

export function createDefaultCard(jodoushiId: string, name: string): SkillCard {
  return {
    id: `card_${jodoushiId}_default`,
    jodoushiId,
    name,
    rarity: 'N',
    element: 'earth',
    level: 1,
    power: 10,
  };
}

export function createDefaultPlayer(): PlayerData {
  return {
    level: 1,
    exp: 0,
    maxHP: 110,
    attackBonus: 2,
    stones: 0,
    cards: [
      createDefaultCard('zu', 'ず'),
      createDefaultCard('ki', 'き'),
      createDefaultCard('keri', 'けり'),
      createDefaultCard('mu', 'む'),
      createDefaultCard('ru', 'る'),
    ],
    equippedDeck: ['card_zu_default', 'card_ki_default', 'card_keri_default', 'card_mu_default', 'card_ru_default'],
  };
}

export function createDefaultSave(): SaveData {
  return {
    player: createDefaultPlayer(),
    stageClears: [],
    zukanJodoushi: [],
    zukanEnemies: [],
    currentChapter: 1,
    totalPlayTime: 0,
    lastPlayed: new Date().toISOString(),
  };
}

export function saveSaveData(data: SaveData): void {
  data.lastPlayed = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadSaveData(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function getOrCreateSave(): SaveData {
  const existing = loadSaveData();
  if (existing) return existing;
  const fresh = createDefaultSave();
  saveSaveData(fresh);
  return fresh;
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
