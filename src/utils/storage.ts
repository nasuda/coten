// ============================================================
// localStorage ラッパー（RPGセーブデータ用）
// ============================================================

import type { SaveData, PlayerData, SkillCard, UserProfile } from '../models/types.ts';
import { MAX_PROFILES } from '../models/types.ts';

const PROFILES_KEY = 'bunpou_musou_profiles';
const ACTIVE_PROFILE_KEY = 'bunpou_musou_active';
const SAVE_KEY_PREFIX = 'bunpou_musou_save_';
const LEGACY_SAVE_KEY = 'bunpou_musou_save';

// --- プロフィール管理 ---

function generateProfileId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getProfiles(): UserProfile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserProfile[];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfile(profileId: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

export function createProfile(name: string): UserProfile | null {
  const profiles = getProfiles();
  if (profiles.length >= MAX_PROFILES) return null;

  const profile: UserProfile = {
    id: generateProfileId(),
    name,
    createdAt: new Date().toISOString(),
  };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles().filter(p => p.id !== profileId);
  saveProfiles(profiles);
  localStorage.removeItem(SAVE_KEY_PREFIX + profileId);

  if (getActiveProfileId() === profileId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export function getActiveProfile(): UserProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return getProfiles().find(p => p.id === id) ?? null;
}

// --- レガシーデータ移行 ---

export function migrateLegacySave(): void {
  const profiles = getProfiles();
  if (profiles.length > 0) return; // 既に移行済み

  const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
  if (!legacyRaw) return;

  const profile = createProfile('プレイヤー1');
  if (!profile) return;

  localStorage.setItem(SAVE_KEY_PREFIX + profile.id, legacyRaw);
  setActiveProfile(profile.id);
  localStorage.removeItem(LEGACY_SAVE_KEY);
}

// --- セーブデータアクセス ---

function getSaveKey(): string {
  const profileId = getActiveProfileId();
  if (!profileId) throw new Error('アクティブなプロフィールがありません');
  return SAVE_KEY_PREFIX + profileId;
}

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

export function saveSaveData(data: SaveData): boolean {
  data.lastPlayed = new Date().toISOString();
  try {
    localStorage.setItem(getSaveKey(), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('セーブデータの保存に失敗しました:', e);
    return false;
  }
}

export function loadSaveData(): SaveData | null {
  let key: string;
  try {
    key = getSaveKey();
  } catch {
    return null;
  }
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch (e) {
    console.error('セーブデータの読み込みに失敗しました。データが破損している可能性があります:', e);
    try {
      localStorage.setItem(key + '_corrupted_backup', raw);
    } catch { /* バックアップ保存失敗は無視 */ }
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
  try {
    return localStorage.getItem(getSaveKey()) !== null;
  } catch {
    return false;
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(getSaveKey());
  } catch { /* no active profile */ }
}
