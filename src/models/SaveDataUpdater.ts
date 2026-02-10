// ============================================================
// セーブデータ更新 — バトル結果を図鑑・進行度に反映
// ============================================================

import type { SaveData, BattleResult, TurnResult, StageClearData } from './types.ts';
import { updateJodoushiEntry, updateEnemyEntry, createInitialZukanJodoushi, createInitialZukanEnemies } from './ZukanManager.ts';
import { getStagesByChapter } from '../data/stages.ts';

export function applyBattleResultToSave(
  save: SaveData,
  result: BattleResult,
  turnResults: TurnResult[],
): SaveData {
  const updated: SaveData = {
    ...save,
    zukanJodoushi: save.zukanJodoushi.length > 0
      ? save.zukanJodoushi.map(e => ({ ...e }))
      : createInitialZukanJodoushi(),
    zukanEnemies: save.zukanEnemies.length > 0
      ? save.zukanEnemies.map(e => ({ ...e }))
      : createInitialZukanEnemies(),
  };

  // 助動詞図鑑の更新: 各ターンの回答結果を反映
  for (const tr of turnResults) {
    const idx = updated.zukanJodoushi.findIndex(z => z.id === tr.answeredJodoushiId);
    if (idx !== -1) {
      updated.zukanJodoushi[idx] = updateJodoushiEntry(updated.zukanJodoushi[idx]!, tr.correct);
    }
  }

  // 敵図鑑の更新
  const enemyIdx = updated.zukanEnemies.findIndex(z => z.id === result.enemyId);
  if (enemyIdx !== -1) {
    updated.zukanEnemies[enemyIdx] = updateEnemyEntry(updated.zukanEnemies[enemyIdx]!, result.victory);
  }

  return updated;
}

export function isChapterCleared(chapterId: number, stageClears: StageClearData[]): boolean {
  const stages = getStagesByChapter(chapterId);
  if (stages.length === 0) return false;

  return stages.every(stage =>
    stageClears.some(c => c.stageId === stage.id && c.cleared)
  );
}
