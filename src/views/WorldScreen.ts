// ============================================================
// ワールドマップ / ステージ選択画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap } from '../utils/audio.ts';
import { getOrCreateSave } from '../utils/storage.ts';
import { allChapters, getStagesByChapter } from '../data/stages.ts';
import { getEnemyById } from '../data/enemies.ts';
import { renderMenuScreen } from './MenuScreen.ts';
import { renderBattleScreen } from './BattleScreen.ts';
import type { StageClearData } from '../models/types.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function renderWorldScreen(): void {
  setScreen('world', () => {
    const screen = el('div', { class: 'world-screen' });
    const save = getOrCreateSave();

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => { playTap(); renderMenuScreen(); });
    header.appendChild(backBtn);
    header.appendChild(el('span', { class: 'text-gold', style: 'font-weight: 700' }, 'ワールドマップ'));
    header.appendChild(el('span', { class: 'text-secondary' }, `💎 ${save.player.stones}`));

    // チャプター / ステージリスト
    const listContainer = el('div', { class: 'chapter-list' });

    for (const chapter of allChapters) {
      const stages = getStagesByChapter(chapter.id);
      const clears = save.stageClears;

      const firstStage = stages[0];
      const isUnlocked = !firstStage?.unlockCondition || clears.some(c => c.stageId === firstStage.unlockCondition && c.cleared);
      const isCurrent = isUnlocked && !stages.every(s => clears.some(c => c.stageId === s.id && c.cleared));

      const card = el('div', { class: `chapter-card${isUnlocked ? '' : ' locked'}${isCurrent ? ' current' : ''}` });
      card.appendChild(el('div', { class: 'chapter-name' }, `第${chapter.id}章: ${chapter.name}`));
      card.appendChild(el('div', { class: 'chapter-theme' }, chapter.theme));

      const dots = el('div', { class: 'chapter-progress' });
      for (const stage of stages) {
        const clear = clears.find(c => c.stageId === stage.id);
        let dotClass = 'stage-dot';
        if (clear?.cleared) dotClass += ' cleared';
        if (stage.isBossStage) dotClass += ' boss';
        dots.appendChild(el('div', { class: dotClass }));
      }
      card.appendChild(dots);

      if (isUnlocked) {
        onClick(card, () => {
          playTap();
          renderStageList(listContainer, chapter.id, save.stageClears);
        });
      }

      listContainer.appendChild(card);
    }

    screen.appendChild(header);
    screen.appendChild(listContainer);

    return screen;
  });
}

function renderStageList(container: HTMLElement, chapterId: number, clears: StageClearData[]): void {
  clearElement(container);
  const stages = getStagesByChapter(chapterId);
  const chapter = allChapters.find(c => c.id === chapterId);

  const backBtn = el('button', { class: 'btn btn--small', style: 'align-self: flex-start; margin-bottom: 8px' }, '← チャプター選択');
  onClick(backBtn, () => { playTap(); renderWorldScreen(); });
  container.appendChild(backBtn);

  container.appendChild(el('div', { class: 'chapter-name', style: 'text-align: center; margin-bottom: 8px' },
    `第${chapterId}章: ${chapter?.name ?? ''}`));

  const list = el('div', { class: 'stage-list' });

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]!;
    const clear = clears.find(c => c.stageId === stage.id);
    const isUnlocked = !stage.unlockCondition || clears.some(c => c.stageId === stage.unlockCondition && c.cleared);

    const card = el('div', { class: `stage-card${isUnlocked ? '' : ' locked'}${stage.isBossStage ? ' boss' : ''}` });

    const numEl = el('div', { class: 'stage-number' }, stage.isBossStage ? '👑' : String(i + 1));
    const info = el('div', { class: 'stage-info' });
    info.appendChild(el('div', { class: 'stage-name' }, stage.name));
    info.appendChild(el('div', { class: 'stage-desc' }, stage.description));

    const stars = el('div', { class: 'stage-stars' });
    const bestStars = clear?.bestStars ?? 0;
    stars.textContent = '★'.repeat(bestStars) + '☆'.repeat(3 - bestStars);

    card.appendChild(numEl);
    card.appendChild(info);
    card.appendChild(stars);

    if (isUnlocked) {
      const enemy = getEnemyById(stage.enemies[0] ?? '');
      onClick(card, () => {
        playTap();
        if (enemy) renderBattleScreen(stage.id, enemy);
      });
    }

    list.appendChild(card);
  }

  container.appendChild(list);
}
