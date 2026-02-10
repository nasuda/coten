// ============================================================
// リザルト画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap, playLevelUp } from '../utils/audio.ts';
import { getOrCreateSave, saveSaveData } from '../utils/storage.ts';
import { calculateLevelUp, calculatePlayerStats, calculateExpReward, calculateStonesReward } from '../models/ProgressManager.ts';
import { renderMenuScreen } from './MenuScreen.ts';
import { renderWorldScreen } from './WorldScreen.ts';
import type { BattleResult } from '../models/types.ts';
import { getStageById } from '../data/stages.ts';

export function renderResultScreen(result: BattleResult): void {
  setScreen('result', () => {
    const screen = el('div', { class: 'result-screen' });
    const save = getOrCreateSave();
    const stage = getStageById(result.stageId);

    // 勝敗タイトル
    const titleText = result.victory ? 'VICTORY' : 'DEFEAT';
    const titleClass = result.victory ? 'text-gold victory-text' : 'text-red defeat-text';
    const title = el('div', { class: `result-title ${titleClass}` }, titleText);

    // 星評価
    const stars = el('div', { class: 'result-stars' });
    stars.textContent = '★'.repeat(result.starRating) + '☆'.repeat(3 - result.starRating);

    // 統計
    const stats = el('div', { class: 'result-stats' });
    stats.appendChild(createRow('正答率', `${result.correctCount}/${result.totalQuestions} (${Math.floor(result.accuracyRate * 100)}%)`));
    stats.appendChild(createRow('最大コンボ', `x${result.comboMax}`));
    stats.appendChild(createRow('ターン数', `${result.turns}`));

    // 報酬計算
    const alreadyCleared = save.stageClears.some(c => c.stageId === result.stageId && c.cleared);
    const isBoss = stage?.isBossStage ?? false;
    const stonesReward = result.victory ? calculateStonesReward(alreadyCleared, isBoss, false) : 0;
    const expReward = calculateExpReward(result.expGained, result.starRating);

    stats.appendChild(el('div', { style: 'border-top: 1px solid #444; margin: 8px 0' }));
    stats.appendChild(createRow('獲得EXP', `+${expReward}`, 'text-green'));
    if (stonesReward > 0) {
      stats.appendChild(createRow('獲得石', `+${stonesReward} 💎`, 'text-gold'));
    }

    // セーブデータ更新
    if (result.victory) {
      // ステージクリア記録
      const existingClear = save.stageClears.find(c => c.stageId === result.stageId);
      if (existingClear) {
        existingClear.cleared = true;
        existingClear.clearCount++;
        if (result.starRating > existingClear.bestStars) {
          existingClear.bestStars = result.starRating;
        }
      } else {
        save.stageClears.push({
          stageId: result.stageId,
          cleared: true,
          bestStars: result.starRating,
          clearCount: 1,
        });
      }

      save.player.stones += stonesReward;
    }

    // 経験値・レベルアップ
    const levelResult = calculateLevelUp(save.player.level, save.player.exp, expReward);
    const levelsGained = levelResult.levelsGained;

    save.player.level = levelResult.newLevel;
    save.player.exp = levelResult.remainingExp;
    const newStats = calculatePlayerStats(levelResult.newLevel);
    save.player.maxHP = newStats.maxHP;
    save.player.attackBonus = newStats.attackBonus;

    saveSaveData(save);

    if (levelsGained > 0) {
      stats.appendChild(createRow('レベルアップ！', `Lv.${levelResult.newLevel}`, 'text-gold'));
      setTimeout(() => playLevelUp(), 500);
    }

    // ボタン
    const btnArea = el('div', { style: 'display: flex; gap: 12px; width: 100%' });

    const menuBtn = el('button', { class: 'btn', style: 'flex: 1' }, 'メニュー');
    onClick(menuBtn, () => { playTap(); renderMenuScreen(); });

    const nextBtn = el('button', { class: 'btn btn--gold', style: 'flex: 1' },
      result.victory ? '次へ' : 'リトライ');
    onClick(nextBtn, () => { playTap(); renderWorldScreen(); });

    btnArea.appendChild(menuBtn);
    btnArea.appendChild(nextBtn);

    screen.appendChild(title);
    screen.appendChild(stars);
    screen.appendChild(stats);
    screen.appendChild(btnArea);

    return screen;
  });
}

function createRow(label: string, value: string, valueClass = ''): HTMLElement {
  const row = el('div', { class: 'result-row' });
  row.appendChild(el('span', { class: 'result-row-label' }, label));
  row.appendChild(el('span', { class: `result-row-value ${valueClass}` }, value));
  return row;
}
