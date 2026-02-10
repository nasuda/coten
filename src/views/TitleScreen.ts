// ============================================================
// タイトル画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { initAudio, playTap } from '../utils/audio.ts';
import { renderMenuScreen } from './MenuScreen.ts';

export function renderTitleScreen(): void {
  setScreen('title', () => {
    const screen = el('div', { class: 'title-screen' });

    const subtitle = el('div', { class: 'title-subtitle' }, '～俺の詠嘆が世界を救う～');
    const logo = el('div', { class: 'title-logo title-glow' }, '文法無双');
    const sub2 = el('div', { class: 'title-subtitle' }, '古文助動詞バトルRPG');

    const startBtn = el('button', { class: 'btn btn--gold btn--large pulse' }, 'GAME START');

    onClick(startBtn, () => {
      initAudio();
      playTap();
      renderMenuScreen();
    });

    screen.appendChild(subtitle);
    screen.appendChild(logo);
    screen.appendChild(sub2);
    screen.appendChild(el('div', { style: 'height: 40px' }));
    screen.appendChild(startBtn);

    return screen;
  });
}
