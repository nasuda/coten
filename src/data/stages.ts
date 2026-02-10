// ============================================================
// ステージ・チャプターデータ
// ============================================================

import type { Stage, Chapter } from '../models/types.ts';

export const allChapters: Chapter[] = [
  { id: 1, name: '迷いの森', theme: '受身・使役・打消', description: '未然形に接続する助動詞たちが支配する森', stages: ['s1_1','s1_2','s1_3','s1_4','s1_5','s1_6'], bossName: '虚無の番人' },
  { id: 2, name: '時の回廊', theme: '過去・完了', description: '連用形に接続する助動詞が時を操る回廊', stages: ['s2_1','s2_2','s2_3','s2_4','s2_5','s2_6'], bossName: '時の守護者' },
  { id: 3, name: '幻惑の城', theme: '推量・意志', description: '未来を左右する推量の助動詞が住む城', stages: ['s3_1','s3_2','s3_3','s3_4','s3_5','s3_6'], bossName: '幻影の王' },
  { id: 4, name: '光闇の塔', theme: '断定・伝聞・打消推量・希望・比況', description: '真実と虚偽が交錯する最後の塔', stages: ['s4_1','s4_2','s4_3','s4_4','s4_5'], bossName: '真偽の裁定者' },
  { id: 5, name: '願いの果て', theme: '全助動詞複合', description: '全ての助動詞の力が集う最終決戦の地', stages: ['s5_1','s5_2','s5_3','s5_4'], bossName: '最終文法帝' },
  { id: 6, name: '裏ステージ', theme: '高難度', description: '真の文法マスターだけが挑める裏の世界', stages: ['ex_1','ex_2','ex_3','ex_4','ex_5'], bossName: '古文の闇王' },
];

export const allStages: Stage[] = [
  // Chapter 1
  { id: 's1_1', chapterId: 1, name: '森の入り口', description: '最初の試練。未然形の基本を学ぶ', enemies: ['e1_1'], requiredJodoushi: ['ru','raru'], unlockCondition: null, isBossStage: false },
  { id: 's1_2', chapterId: 1, name: '霧の小道', description: '受身の助動詞が待ち構える', enemies: ['e1_2'], requiredJodoushi: ['ru','raru','zu'], unlockCondition: 's1_1', isBossStage: false },
  { id: 's1_3', chapterId: 1, name: '朽ちた祠', description: '使役の力を試される', enemies: ['e1_3'], requiredJodoushi: ['su','sasu','shimu'], unlockCondition: 's1_2', isBossStage: false },
  { id: 's1_4', chapterId: 1, name: '古木の広場', description: '尊敬と使役の区別が鍵', enemies: ['e1_4'], requiredJodoushi: ['ru','raru','su','sasu'], unlockCondition: 's1_3', isBossStage: false },
  { id: 's1_5', chapterId: 1, name: '闇の泉', description: '打消の「ず」を極める', enemies: ['e1_5'], requiredJodoushi: ['zu','shimu','ru'], unlockCondition: 's1_4', isBossStage: false },
  { id: 's1_6', chapterId: 1, name: '番人の間', description: 'Chapter1ボス「虚無の番人」', enemies: ['e1_boss'], requiredJodoushi: ['ru','raru','su','sasu','shimu','zu'], unlockCondition: 's1_5', isBossStage: true },

  // Chapter 2
  { id: 's2_1', chapterId: 2, name: '回廊の入口', description: '過去の助動詞「き」「けり」との出会い', enemies: ['e2_1'], requiredJodoushi: ['ki','keri'], unlockCondition: 's1_6', isBossStage: false },
  { id: 's2_2', chapterId: 2, name: '過去の廊下', description: '体験過去と伝聞過去を見極める', enemies: ['e2_2'], requiredJodoushi: ['ki','keri'], unlockCondition: 's2_1', isBossStage: false },
  { id: 's2_3', chapterId: 2, name: '完了の間', description: '完了の「つ」「ぬ」を学ぶ', enemies: ['e2_3'], requiredJodoushi: ['tsu','nu'], unlockCondition: 's2_2', isBossStage: false },
  { id: 's2_4', chapterId: 2, name: '詠嘆の広間', description: '「けり」の詠嘆用法に挑む', enemies: ['e2_4'], requiredJodoushi: ['keri','tsu','nu'], unlockCondition: 's2_3', isBossStage: false },
  { id: 's2_5', chapterId: 2, name: '存続の回廊', description: '「たり」「り」の特殊接続に注意', enemies: ['e2_5'], requiredJodoushi: ['tari_kanryou','ri'], unlockCondition: 's2_4', isBossStage: false },
  { id: 's2_6', chapterId: 2, name: '時の玉座', description: 'Chapter2ボス「時の守護者」', enemies: ['e2_boss'], requiredJodoushi: ['ki','keri','tsu','nu','tari_kanryou','ri'], unlockCondition: 's2_5', isBossStage: true },

  // Chapter 3
  { id: 's3_1', chapterId: 3, name: '幻惑の門', description: '推量「む」の六つの意味に挑む', enemies: ['e3_1'], requiredJodoushi: ['mu','muzu'], unlockCondition: 's2_6', isBossStage: false },
  { id: 's3_2', chapterId: 3, name: '意志の回廊', description: '意志と推量を区別する', enemies: ['e3_2'], requiredJodoushi: ['mu','beshi'], unlockCondition: 's3_1', isBossStage: false },
  { id: 's3_3', chapterId: 3, name: '婉曲の間', description: '「らむ」「けむ」の推量を学ぶ', enemies: ['e3_3'], requiredJodoushi: ['ramu','kemu'], unlockCondition: 's3_2', isBossStage: false },
  { id: 's3_4', chapterId: 3, name: '仮定の庭園', description: '反実仮想「まし」に挑む', enemies: ['e3_4'], requiredJodoushi: ['mashi','mu'], unlockCondition: 's3_3', isBossStage: false },
  { id: 's3_5', chapterId: 3, name: '当然の階段', description: '「べし」の多義を極める', enemies: ['e3_5'], requiredJodoushi: ['beshi','mashi','ramu'], unlockCondition: 's3_4', isBossStage: false },
  { id: 's3_6', chapterId: 3, name: '幻影の玉座', description: 'Chapter3ボス「幻影の王」', enemies: ['e3_boss'], requiredJodoushi: ['mu','muzu','ramu','kemu','beshi','mashi'], unlockCondition: 's3_5', isBossStage: true },

  // Chapter 4
  { id: 's4_1', chapterId: 4, name: '塔の一層', description: '断定「なり」「たり」を学ぶ', enemies: ['e4_1'], requiredJodoushi: ['nari_dantei','tari_dantei'], unlockCondition: 's3_6', isBossStage: false },
  { id: 's4_2', chapterId: 4, name: '塔の二層', description: '伝聞推定「なり」と断定「なり」を区別', enemies: ['e4_2'], requiredJodoushi: ['nari_dantei','nari_denbun'], unlockCondition: 's4_1', isBossStage: false },
  { id: 's4_3', chapterId: 4, name: '塔の三層', description: '打消推量「じ」「まじ」に挑む', enemies: ['e4_3'], requiredJodoushi: ['ji','maji'], unlockCondition: 's4_2', isBossStage: false },
  { id: 's4_4', chapterId: 4, name: '塔の四層', description: '希望・比況の助動詞', enemies: ['e4_4'], requiredJodoushi: ['mahoshi','tashi','gotoshi'], unlockCondition: 's4_3', isBossStage: false },
  { id: 's4_5', chapterId: 4, name: '裁定の間', description: 'Chapter4ボス「真偽の裁定者」', enemies: ['e4_boss'], requiredJodoushi: ['ji','maji','mahoshi','tashi','nari_dantei','tari_dantei','nari_denbun','gotoshi'], unlockCondition: 's4_4', isBossStage: true },

  // Chapter 5
  { id: 's5_1', chapterId: 5, name: '混沌の荒野', description: '全助動詞の接続問題', enemies: ['e5_1'], requiredJodoushi: ['ru','su','zu','ki','mu','beshi','nari_dantei'], unlockCondition: 's4_5', isBossStage: false },
  { id: 's5_2', chapterId: 5, name: '終焉の道', description: '全助動詞の意味問題', enemies: ['e5_2'], requiredJodoushi: ['keri','tsu','ramu','mashi','ji','mahoshi','nari_denbun'], unlockCondition: 's5_1', isBossStage: false },
  { id: 's5_3', chapterId: 5, name: '最後の試練', description: '複合問題の連続', enemies: ['e5_3'], requiredJodoushi: ['raru','sasu','nu','ri','kemu','maji','tashi','gotoshi'], unlockCondition: 's5_2', isBossStage: false },
  { id: 's5_4', chapterId: 5, name: '文法帝の間', description: '最終ボス「最終文法帝」', enemies: ['e5_boss'], requiredJodoushi: [], unlockCondition: 's5_3', isBossStage: true },

  // EX
  { id: 'ex_1', chapterId: 6, name: '裏・森', description: '高難度の接続問題', enemies: ['ex_1'], requiredJodoushi: [], unlockCondition: 's5_4', isBossStage: false },
  { id: 'ex_2', chapterId: 6, name: '裏・回廊', description: '高難度の意味問題', enemies: ['ex_2'], requiredJodoushi: [], unlockCondition: 'ex_1', isBossStage: false },
  { id: 'ex_3', chapterId: 6, name: '裏・城', description: '高難度の活用問題', enemies: ['ex_3'], requiredJodoushi: [], unlockCondition: 'ex_2', isBossStage: false },
  { id: 'ex_4', chapterId: 6, name: '裏・塔', description: '高難度の複合問題', enemies: ['ex_4'], requiredJodoushi: [], unlockCondition: 'ex_3', isBossStage: false },
  { id: 'ex_5', chapterId: 6, name: '深淵の玉座', description: 'EXボス「古文の闇王」', enemies: ['ex_boss'], requiredJodoushi: [], unlockCondition: 'ex_4', isBossStage: true },
];

export function getStageById(id: string): Stage | undefined {
  return allStages.find(s => s.id === id);
}

export function getChapterById(id: number): Chapter | undefined {
  return allChapters.find(c => c.id === id);
}

export function getStagesByChapter(chapterId: number): Stage[] {
  return allStages.filter(s => s.chapterId === chapterId);
}
