// ============================================================
// 敵キャラデータ
// ============================================================

import type { Enemy } from '../models/types.ts';

export const allEnemies: Enemy[] = [
  // === Chapter 1: 迷いの森 ===
  { id: 'e1_1', name: '未然のスライム', level: 1, maxHP: 80, attack: 8, defense: 2, element: 'earth', emoji: '🟢', isBoss: false, stageId: 's1_1', dropStones: 3, dropExp: 20 },
  { id: 'e1_2', name: '受身の亡霊', level: 2, maxHP: 100, attack: 10, defense: 3, element: 'water', emoji: '👻', isBoss: false, stageId: 's1_2', dropStones: 3, dropExp: 25 },
  { id: 'e1_3', name: '使役のゴーレム', level: 3, maxHP: 120, attack: 12, defense: 5, element: 'fire', emoji: '🗿', isBoss: false, stageId: 's1_3', dropStones: 4, dropExp: 30 },
  { id: 'e1_4', name: '尊敬のファントム', level: 4, maxHP: 130, attack: 13, defense: 4, element: 'phantom', emoji: '🌀', isBoss: false, stageId: 's1_4', dropStones: 4, dropExp: 35 },
  { id: 'e1_5', name: '打消の影', level: 5, maxHP: 150, attack: 15, defense: 5, element: 'dark', emoji: '🌑', isBoss: false, stageId: 's1_5', dropStones: 5, dropExp: 40 },
  { id: 'e1_boss', name: '虚無の番人', level: 7, maxHP: 300, attack: 20, defense: 8, element: 'dark', emoji: '💀', isBoss: true, stageId: 's1_6', dropStones: 30, dropExp: 100, gimmick: { type: 'barrier', description: '1ターン目ダメージ半減', value: 0.5 } },

  // === Chapter 2: 時の回廊 ===
  { id: 'e2_1', name: '時の砂蟲', level: 6, maxHP: 160, attack: 16, defense: 6, element: 'earth', emoji: '🐛', isBoss: false, stageId: 's2_1', dropStones: 4, dropExp: 45 },
  { id: 'e2_2', name: '過去の残像', level: 7, maxHP: 180, attack: 18, defense: 7, element: 'earth', emoji: '👤', isBoss: false, stageId: 's2_2', dropStones: 5, dropExp: 50 },
  { id: 'e2_3', name: '完了の石像', level: 8, maxHP: 200, attack: 19, defense: 9, element: 'earth', emoji: '🏛️', isBoss: false, stageId: 's2_3', dropStones: 5, dropExp: 55 },
  { id: 'e2_4', name: '詠嘆のバンシー', level: 9, maxHP: 210, attack: 20, defense: 7, element: 'wind', emoji: '😱', isBoss: false, stageId: 's2_4', dropStones: 5, dropExp: 60 },
  { id: 'e2_5', name: '存続のミイラ', level: 10, maxHP: 230, attack: 22, defense: 10, element: 'earth', emoji: '🧟', isBoss: false, stageId: 's2_5', dropStones: 6, dropExp: 65 },
  { id: 'e2_boss', name: '時の守護者', level: 12, maxHP: 450, attack: 28, defense: 12, element: 'earth', emoji: '⏳', isBoss: true, stageId: 's2_6', dropStones: 30, dropExp: 150, gimmick: { type: 'timeAccel', description: '制限時間8秒に短縮', value: 8 } },

  // === Chapter 3: 幻惑の城 ===
  { id: 'e3_1', name: '推量のコウモリ', level: 11, maxHP: 240, attack: 23, defense: 9, element: 'wind', emoji: '🦇', isBoss: false, stageId: 's3_1', dropStones: 5, dropExp: 70 },
  { id: 'e3_2', name: '意志の騎士', level: 12, maxHP: 260, attack: 25, defense: 11, element: 'wind', emoji: '⚔️', isBoss: false, stageId: 's3_2', dropStones: 6, dropExp: 75 },
  { id: 'e3_3', name: '婉曲のキツネ', level: 13, maxHP: 270, attack: 26, defense: 10, element: 'phantom', emoji: '🦊', isBoss: false, stageId: 's3_3', dropStones: 6, dropExp: 80 },
  { id: 'e3_4', name: '仮定のユニコーン', level: 14, maxHP: 290, attack: 28, defense: 12, element: 'light', emoji: '🦄', isBoss: false, stageId: 's3_4', dropStones: 6, dropExp: 85 },
  { id: 'e3_5', name: '勧誘のセイレーン', level: 15, maxHP: 300, attack: 29, defense: 11, element: 'water', emoji: '🧜', isBoss: false, stageId: 's3_5', dropStones: 7, dropExp: 90 },
  { id: 'e3_boss', name: '幻影の王', level: 17, maxHP: 600, attack: 35, defense: 15, element: 'wind', emoji: '👑', isBoss: true, stageId: 's3_6', dropStones: 30, dropExp: 200, gimmick: { type: 'extraChoices', description: '選択肢が7枚に増加', value: 7 } },

  // === Chapter 4: 光闇の塔 ===
  { id: 'e4_1', name: '断定のガーゴイル', level: 16, maxHP: 320, attack: 30, defense: 13, element: 'light', emoji: '🗽', isBoss: false, stageId: 's4_1', dropStones: 6, dropExp: 95 },
  { id: 'e4_2', name: '伝聞の幽鬼', level: 17, maxHP: 340, attack: 32, defense: 14, element: 'dark', emoji: '👁️', isBoss: false, stageId: 's4_2', dropStones: 7, dropExp: 100 },
  { id: 'e4_3', name: '希望の堕天使', level: 18, maxHP: 360, attack: 34, defense: 14, element: 'light', emoji: '😇', isBoss: false, stageId: 's4_3', dropStones: 7, dropExp: 110 },
  { id: 'e4_4', name: '比況のキメラ', level: 19, maxHP: 380, attack: 36, defense: 15, element: 'phantom', emoji: '🐉', isBoss: false, stageId: 's4_4', dropStones: 8, dropExp: 120 },
  { id: 'e4_boss', name: '真偽の裁定者', level: 22, maxHP: 800, attack: 42, defense: 18, element: 'light', emoji: '⚖️', isBoss: true, stageId: 's4_5', dropStones: 30, dropExp: 300, gimmick: { type: 'reflect', description: '不正解時追加ダメージ', value: 1.5 } },

  // === Chapter 5: 願いの果て ===
  { id: 'e5_1', name: '混沌の文法兵', level: 20, maxHP: 400, attack: 38, defense: 16, element: 'dark', emoji: '🧙', isBoss: false, stageId: 's5_1', dropStones: 8, dropExp: 130 },
  { id: 'e5_2', name: '全能の語彙獣', level: 22, maxHP: 450, attack: 42, defense: 18, element: 'phantom', emoji: '🐺', isBoss: false, stageId: 's5_2', dropStones: 9, dropExp: 150 },
  { id: 'e5_3', name: '終焉のワイバーン', level: 24, maxHP: 500, attack: 45, defense: 20, element: 'fire', emoji: '🐲', isBoss: false, stageId: 's5_3', dropStones: 10, dropExp: 170 },
  { id: 'e5_boss', name: '最終文法帝', level: 28, maxHP: 1200, attack: 55, defense: 25, element: 'dark', emoji: '👿', isBoss: true, stageId: 's5_4', dropStones: 50, dropExp: 500, gimmick: { type: 'heal', description: '3ターンごとにHP10%回復', value: 0.1 } },

  // === EX: 裏ステージ ===
  { id: 'ex_1', name: '古典の魔獣', level: 25, maxHP: 550, attack: 48, defense: 22, element: 'phantom', emoji: '🦁', isBoss: false, stageId: 'ex_1', dropStones: 10, dropExp: 200 },
  { id: 'ex_2', name: '文法の暴龍', level: 27, maxHP: 600, attack: 52, defense: 24, element: 'fire', emoji: '🔥', isBoss: false, stageId: 'ex_2', dropStones: 12, dropExp: 250 },
  { id: 'ex_3', name: '活用の魔人', level: 29, maxHP: 650, attack: 55, defense: 25, element: 'wind', emoji: '🌪️', isBoss: false, stageId: 'ex_3', dropStones: 12, dropExp: 280 },
  { id: 'ex_4', name: '接続の深淵', level: 30, maxHP: 700, attack: 58, defense: 26, element: 'dark', emoji: '🕳️', isBoss: false, stageId: 'ex_4', dropStones: 15, dropExp: 300 },
  { id: 'ex_boss', name: '古文の闇王', level: 35, maxHP: 1500, attack: 65, defense: 30, element: 'dark', emoji: '🫅', isBoss: true, stageId: 'ex_5', dropStones: 100, dropExp: 1000, gimmick: { type: 'barrier', description: '偶数ターンダメージ半減', value: 0.5 } },
];

export function getEnemyById(id: string): Enemy | undefined {
  return allEnemies.find(e => e.id === id);
}

export function getEnemiesByStage(stageId: string): Enemy[] {
  return allEnemies.filter(e => e.stageId === stageId);
}
