// ============================================================
// ガチャ画面
// ============================================================

import { el, onClick, setScreen, waitMs } from '../utils/render.ts';
import { playTap, playGacha, playSSR } from '../utils/audio.ts';
import { getOrCreateSave, saveSaveData } from '../utils/storage.ts';
import { rollGacha, canAffordGacha } from '../models/GachaSystem.ts';
import { gachaPools } from '../data/gacha-pools.ts';
import { renderMenuScreen } from './MenuScreen.ts';

export function renderGachaScreen(): void {
  setScreen('gacha', () => {
    const screen = el('div', { class: 'gacha-screen' });
    const save = getOrCreateSave();

    const title = el('div', { class: 'gacha-title' }, 'ガチャ');
    const stonesDisplay = el('div', { class: 'gacha-stones' }, `所持石: 💎 ${save.player.stones}`);

    // カード表示エリア
    const revealArea = el('div', { style: 'min-height: 220px; display: flex; align-items: center; justify-content: center' });
    const placeholder = el('div', { style: 'color: var(--text-secondary); font-size: 0.9rem' }, 'ガチャを回してスキルカードを入手！');
    revealArea.appendChild(placeholder);

    // ガチャボタン
    const btnArea = el('div', { style: 'display: flex; flex-direction: column; gap: 10px; width: 100%' });

    for (const pool of gachaPools) {
      const canAfford = canAffordGacha(save.player.stones, pool);
      const btn = el('button', {
        class: `btn ${canAfford ? 'btn--gold' : 'btn--disabled'}`,
        style: 'width: 100%',
      }, `${pool.name} (💎${pool.cost})`);

      onClick(btn, async () => {
        if (!canAffordGacha(save.player.stones, pool)) return;

        save.player.stones -= pool.cost;
        const card = rollGacha(pool);
        save.player.cards.push(card);
        saveSaveData(save);

        stonesDisplay.textContent = `所持石: 💎 ${save.player.stones}`;

        // 演出
        while (revealArea.firstChild) revealArea.removeChild(revealArea.firstChild);
        revealArea.appendChild(el('div', { class: 'pulse', style: 'font-size: 2rem; color: var(--text-secondary)' }, '...'));

        playGacha();
        await waitMs(800);

        while (revealArea.firstChild) revealArea.removeChild(revealArea.firstChild);

        const cardEl = el('div', { class: `gacha-card-reveal gacha-reveal rarity-${card.rarity}` });
        cardEl.appendChild(el('div', { class: `skill-card-rarity rarity-${card.rarity}`, style: 'font-size: 1rem' }, card.rarity));
        cardEl.appendChild(el('div', { class: `gacha-card-name element-${card.element}` }, card.name));
        cardEl.appendChild(el('div', { style: 'font-size: 0.7rem; color: var(--text-secondary)' }, `Power: ${card.power}`));

        if (card.rarity === 'SSR') {
          cardEl.classList.add('gacha-ssr-bg');
          playSSR();
        }

        revealArea.appendChild(cardEl);

        // ボタン更新
        btnArea.querySelectorAll('.btn').forEach((b) => {
          const poolForBtn = gachaPools.find(p => b.textContent?.includes(p.name));
          if (poolForBtn && !canAffordGacha(save.player.stones, poolForBtn)) {
            b.classList.add('btn--disabled');
            b.classList.remove('btn--gold');
          }
        });
      });

      btnArea.appendChild(btn);
    }

    // 戻るボタン
    const backBtn = el('button', { class: 'btn', style: 'width: 100%' }, '← メニューに戻る');
    onClick(backBtn, () => { playTap(); renderMenuScreen(); });

    screen.appendChild(title);
    screen.appendChild(stonesDisplay);
    screen.appendChild(revealArea);
    screen.appendChild(btnArea);
    screen.appendChild(backBtn);

    return screen;
  });
}
