// ============================================================
// メインメニュー画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap } from '../utils/audio.ts';
import { getOrCreateSave, getActiveProfile } from '../utils/storage.ts';
import { renderWorldScreen } from './WorldScreen.ts';
import { renderGachaScreen } from './GachaScreen.ts';
import { renderZukanScreen } from './ZukanScreen.ts';
import { renderCardUpgradeScreen } from './CardUpgradeScreen.ts';
import { renderDeckEditScreen } from './DeckEditScreen.ts';
import { renderHowToPlayScreen } from './HowToPlayScreen.ts';
import { renderProfileSelectScreen } from './ProfileSelectScreen.ts';

export function renderMenuScreen(): void {
  setScreen('menu', () => {
    const screen = el('div', { class: 'menu-screen' });
    const save = getOrCreateSave();
    const profile = getActiveProfile();

    // ヘッダー
    const header = el('div', { class: 'menu-header' });
    const title = el('div', { class: 'text-gold font-serif', style: 'font-size: 1.3rem; font-weight: 900' }, '文法無双');
    header.appendChild(title);

    if (profile) {
      const profileLabel = el('div', { style: 'font-size: 0.8rem; color: var(--text-secondary); cursor: pointer' }, `👤 ${profile.name}`);
      onClick(profileLabel, () => { playTap(); renderProfileSelectScreen(); });
      header.appendChild(profileLabel);
    }

    // プレイヤー情報
    const info = el('div', { class: 'menu-player-info' });
    info.appendChild(el('span', {}, `Lv.${save.player.level}`));
    info.appendChild(el('span', {}, `HP: ${save.player.maxHP}`));
    info.appendChild(el('span', { class: 'text-gold' }, `💎 ${save.player.stones}`));

    // メニューボタン
    const buttons = el('div', { class: 'menu-buttons' });

    const questBtn = createMenuBtn('⚔️', '冒険に出る', 'ステージ選択');
    onClick(questBtn, () => { playTap(); renderWorldScreen(); });

    const gachaBtn = createMenuBtn('🎰', 'ガチャ', 'スキルカードを入手');
    onClick(gachaBtn, () => { playTap(); renderGachaScreen(); });

    const upgradeBtn = createMenuBtn('⚡', 'カード強化', '石を使ってカードを強化');
    onClick(upgradeBtn, () => { playTap(); renderCardUpgradeScreen(); });

    const deckBtn = createMenuBtn('🃏', 'デッキ編集', 'バトルデッキを組み替え');
    onClick(deckBtn, () => { playTap(); renderDeckEditScreen(); });

    const zukanBtn = createMenuBtn('📖', '図鑑', '助動詞・敵図鑑');
    onClick(zukanBtn, () => { playTap(); renderZukanScreen(); });

    const howtoBtn = createMenuBtn('📜', '遊び方', 'バトルの基本を確認');
    onClick(howtoBtn, () => { playTap(); renderHowToPlayScreen('menu'); });

    buttons.appendChild(questBtn);
    buttons.appendChild(gachaBtn);
    buttons.appendChild(upgradeBtn);
    buttons.appendChild(deckBtn);
    buttons.appendChild(zukanBtn);
    buttons.appendChild(howtoBtn);

    screen.appendChild(header);
    screen.appendChild(info);
    screen.appendChild(buttons);

    return screen;
  });
}

function createMenuBtn(icon: string, title: string, desc: string): HTMLElement {
  const btn = el('div', { class: 'menu-btn' });
  btn.appendChild(el('span', { class: 'menu-btn-icon' }, icon));
  const textArea = el('div', {});
  textArea.appendChild(el('div', { style: 'font-weight: 700' }, title));
  textArea.appendChild(el('div', { style: 'font-size: 0.75rem; color: var(--text-secondary)' }, desc));
  btn.appendChild(textArea);
  return btn;
}
