// ============================================================
// TCG タイトル / 対戦相手選択画面
// ============================================================

import { el, onClick, setTCGScreen } from './tcg-render.ts';
import { allOpponents } from '../data/opponents.ts';
import { renderTCGDeckScreen } from './TCGDeckScreen.ts';
import { renderTCGBattleScreen } from './TCGBattleScreen.ts';
import { initAudio, playTap } from '../../utils/audio.ts';
import { loadTCGSave } from './tcg-storage.ts';

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

    // 戦績表示
    const save = loadTCGSave();
    if (save.wins > 0 || save.losses > 0) {
      const statsEl = el('p', { class: 'subtitle' },
        `戦績: ${save.wins}勝 ${save.losses}敗 | 接続正答率: ${save.connectionStats.total > 0 ? Math.round((save.connectionStats.correct / save.connectionStats.total) * 100) : 0}%`
      );
      container.appendChild(statsEl);
    }

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

    // デッキ編集ボタン
    const deckBtn = el('button', { class: 'btn btn-secondary' }, 'デッキ編集');
    onClick(deckBtn, () => {
      playTap();
      renderTCGDeckScreen();
    });
    container.appendChild(deckBtn);

    return container;
  });
}
