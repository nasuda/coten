// ============================================================
// TCG 結果画面
// ============================================================

import { el, onClick, setTCGScreen } from './tcg-render.ts';
import { playTap } from '../../utils/audio.ts';
import type { TCGBattleResult } from '../models/tcg-types.ts';
import { renderTCGTitleScreen } from './TCGTitleScreen.ts';

export function renderTCGResultScreen(result: TCGBattleResult): void {
  setTCGScreen('tcg_result', () => {
    const container = el('div', { class: 'tcg-result' });

    // 勝敗表示
    const title = el('h1', {}, result.victory ? '勝利' : '敗北');
    container.appendChild(title);

    const subtitle = el('p', {},
      result.victory ? '見事な言霊の使い手だ!' : '次こそは言霊を極めよ...',
    );
    container.appendChild(subtitle);

    // 統計
    const stats = el('div', { class: 'stats' });

    const rows: [string, string][] = [
      ['ラウンド数', `${result.rounds}`],
      ['接続正解', `${result.connectionCorrect}/${result.connectionTotal}`],
      ['正答率', `${result.connectionAccuracy}%`],
      ['残り動詞(自分)', `${result.playerVerbsAlive}`],
      ['残り動詞(相手)', `${result.opponentVerbsAlive}`],
    ];

    for (const [label, value] of rows) {
      const row = el('div', { class: 'stat-row' });
      row.appendChild(el('span', { class: 'stat-label' }, label));
      row.appendChild(el('span', { class: 'stat-value' }, value));
      stats.appendChild(row);
    }

    container.appendChild(stats);

    // 接続正答率ハイライト
    const accuracyEl = el('div', { class: 'accuracy-highlight' },
      `接続正答率: ${result.connectionAccuracy}%`,
    );
    container.appendChild(accuracyEl);

    // 戻るボタン
    const backBtn = el('button', { class: 'btn btn-primary' }, 'タイトルに戻る');
    onClick(backBtn, () => {
      playTap();
      renderTCGTitleScreen();
    });
    container.appendChild(backBtn);

    return container;
  });
}
