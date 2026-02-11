// ============================================================
// TCG タイトル / 対戦相手選択画面
// ============================================================

import { el, onClick, setTCGScreen } from './tcg-render.ts';
import { allOpponents } from '../data/opponents.ts';
import { renderTCGDeckScreen } from './TCGDeckScreen.ts';
import { renderTCGBattleScreen } from './TCGBattleScreen.ts';
import { renderTCGPracticeScreen } from './TCGPracticeScreen.ts';
import { renderTCGHowToPlayScreen } from './TCGHowToPlayScreen.ts';
import { renderTCGProfileScreen } from './TCGProfileScreen.ts';
import { initAudio, playTap } from '../../utils/audio.ts';
import { loadTCGSave } from './tcg-storage.ts';
import { getActiveProfile } from '../../utils/storage.ts';

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

export function renderTCGTitleScreen(): void {
  initAudio();

  setTCGScreen('tcg_title', () => {
    const container = el('div', { class: 'tcg-title' });

    const title = el('h1', {}, '言霊大戦');
    const subtitle = el('p', { class: 'subtitle' }, '～コトダマ・ウォーズ～');
    container.appendChild(title);
    container.appendChild(subtitle);

    // プレイヤー名表示
    const activeProfile = getActiveProfile();
    if (activeProfile) {
      const playerRow = el('div', { style: 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;' });
      const playerLabel = el('span', { style: 'font-size: 0.85rem; color: var(--text-secondary, #9ca3af);' },
        `プレイヤー: ${activeProfile.name}`);
      const switchBtn = el('button', {
        class: 'btn btn-secondary',
        style: 'font-size: 0.75rem; padding: 0.2rem 0.6rem;',
      }, '切替');
      onClick(switchBtn, () => {
        playTap();
        renderTCGProfileScreen();
      });
      playerRow.appendChild(playerLabel);
      playerRow.appendChild(switchBtn);
      container.appendChild(playerRow);
    }

    // 戦績表示
    const save = loadTCGSave();
    if (save.wins > 0 || save.losses > 0 || (save.draws ?? 0) > 0) {
      const draws = save.draws ?? 0;
      const drawText = draws > 0 ? ` ${draws}分` : '';
      const statsEl = el('p', { class: 'subtitle' },
        `戦績: ${save.wins}勝 ${save.losses}敗${drawText} | 接続正答率: ${save.connectionStats.total > 0 ? Math.round((save.connectionStats.correct / save.connectionStats.total) * 100) : 0}%`
      );
      container.appendChild(statsEl);
    }

    // ボタン群（対戦相手リストの上に配置）
    const btnRow = el('div', { style: 'display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-bottom: 1.5rem;' });

    const practiceBtn = el('button', { class: 'btn btn-secondary' }, '接続練習');
    onClick(practiceBtn, () => {
      playTap();
      renderTCGPracticeScreen();
    });

    const deckBtn = el('button', { class: 'btn btn-secondary' }, 'デッキ編集');
    onClick(deckBtn, () => {
      playTap();
      renderTCGDeckScreen();
    });

    const howtoBtn = el('button', { class: 'btn btn-secondary' }, '遊び方');
    onClick(howtoBtn, () => {
      playTap();
      renderTCGHowToPlayScreen();
    });

    btnRow.appendChild(practiceBtn);
    btnRow.appendChild(deckBtn);
    btnRow.appendChild(howtoBtn);
    container.appendChild(btnRow);

    // 対戦相手リスト
    const heading = el('h2', {}, '対戦相手を選べ');
    container.appendChild(heading);

    const list = el('div', { class: 'opponent-list' });

    for (const opp of allOpponents) {
      const card = el('div', { class: 'opponent-card' });
      const emoji = el('span', { class: 'emoji' }, opp.emoji);
      const info = el('div', { class: 'info' });
      const name = el('div', { class: 'name' }, opp.name);
      const desc = el('div', { class: 'desc' }, opp.description);
      info.appendChild(name);
      info.appendChild(desc);

      const badge = el('span', {
        class: `difficulty-badge difficulty-${opp.difficulty}`,
      }, DIFFICULTY_LABELS[opp.difficulty] ?? opp.difficulty);

      card.appendChild(emoji);
      card.appendChild(info);
      card.appendChild(badge);

      onClick(card, () => {
        playTap();
        renderTCGBattleScreen(opp);
      });

      list.appendChild(card);
    }
    container.appendChild(list);

    return container;
  });
}
