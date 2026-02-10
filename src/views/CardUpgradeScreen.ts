// ============================================================
// カード強化画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap, playUpgrade } from '../utils/audio.ts';
import { getOrCreateSave, saveSaveData } from '../utils/storage.ts';
import { upgradeCard, calculateUpgradeCost, canUpgradeCard } from '../models/CardUpgrade.ts';
import { renderMenuScreen } from './MenuScreen.ts';
import type { SkillCard } from '../models/types.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function renderCardUpgradeScreen(): void {
  setScreen('card_upgrade', () => {
    const screen = el('div', { class: 'card-upgrade-screen' });
    const save = getOrCreateSave();

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => { playTap(); renderMenuScreen(); });
    header.appendChild(backBtn);
    header.appendChild(el('span', { class: 'text-gold', style: 'font-weight: 700' }, 'カード強化'));
    const stonesLabel = el('span', { class: 'text-secondary' }, `💎 ${save.player.stones}`);
    header.appendChild(stonesLabel);

    // 選択カード詳細エリア
    const detailArea = el('div', { class: 'upgrade-detail-area' });
    const placeholder = el('div', { style: 'color: var(--text-secondary); font-size: 0.9rem; text-align: center' }, '強化するカードを選択してください');
    detailArea.appendChild(placeholder);

    // カードリスト
    const listArea = el('div', { class: 'upgrade-card-list scroll-container' });

    function renderCardList(): void {
      clearElement(listArea);
      const sorted = [...save.player.cards].sort((a, b) => {
        const rarityOrder = { SSR: 0, SR: 1, R: 2, N: 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity] || b.power - a.power;
      });

      for (const card of sorted) {
        const cardEl = createCardItem(card);
        listArea.appendChild(cardEl);
      }
    }

    function createCardItem(card: SkillCard): HTMLElement {
      const item = el('div', { class: `upgrade-card-item rarity-border-${card.rarity}` });

      const nameEl = el('div', { class: `upgrade-card-name element-${card.element}` });
      nameEl.appendChild(el('span', { class: `rarity-${card.rarity}`, style: 'font-size: 0.7rem; margin-right: 4px' }, card.rarity));
      nameEl.appendChild(document.createTextNode(card.name));
      item.appendChild(nameEl);

      const statsEl = el('div', { class: 'upgrade-card-stats' });
      statsEl.appendChild(el('span', {}, `Lv.${card.level}`));
      statsEl.appendChild(el('span', {}, `Pow.${card.power}`));
      item.appendChild(statsEl);

      onClick(item, () => {
        playTap();
        showCardDetail(card);
      });

      return item;
    }

    function showCardDetail(card: SkillCard): void {
      clearElement(detailArea);

      const cardDisplay = el('div', { class: `upgrade-selected-card rarity-border-${card.rarity}` });
      cardDisplay.appendChild(el('div', { class: `rarity-${card.rarity}`, style: 'font-size: 0.8rem' }, card.rarity));
      cardDisplay.appendChild(el('div', { class: `upgrade-card-big-name element-${card.element}` }, card.name));
      cardDisplay.appendChild(el('div', { style: 'font-size: 0.85rem' }, `Lv.${card.level} / Power: ${card.power}`));

      const cost = calculateUpgradeCost(card.level, card.rarity);
      const affordable = canUpgradeCard(card, save.player.stones);

      if (card.level >= 10) {
        cardDisplay.appendChild(el('div', { class: 'text-gold', style: 'margin-top: 8px; font-weight: 700' }, 'MAX LEVEL'));
      } else {
        const costLabel = el('div', { style: 'margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary)' },
          `強化コスト: 💎 ${cost}`);
        cardDisplay.appendChild(costLabel);

        const upgradeBtn = el('button', {
          class: `btn ${affordable ? 'btn--gold' : 'btn--disabled'}`,
          style: 'margin-top: 8px; width: 100%',
        }, `強化する (💎${cost})`);

        onClick(upgradeBtn, () => {
          if (!canUpgradeCard(card, save.player.stones)) return;

          save.player.stones -= cost;
          const upgraded = upgradeCard(card);

          // セーブデータ内のカードを更新
          const idx = save.player.cards.findIndex(c => c.id === card.id);
          if (idx !== -1) save.player.cards[idx] = upgraded;
          saveSaveData(save);

          playUpgrade();
          stonesLabel.textContent = `💎 ${save.player.stones}`;
          showCardDetail(upgraded);
          renderCardList();
        });

        cardDisplay.appendChild(upgradeBtn);
      }

      detailArea.appendChild(cardDisplay);
    }

    renderCardList();

    screen.appendChild(header);
    screen.appendChild(detailArea);
    screen.appendChild(listArea);

    return screen;
  });
}
