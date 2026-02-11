// ============================================================
// デッキ編集画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap, playEquip } from '../utils/audio.ts';
import { getOrCreateSave, saveSaveData } from '../utils/storage.ts';
import { swapDeckCard, getAvailableCardsForDeck, DECK_SIZE } from '../models/DeckManager.ts';
import { renderMenuScreen } from './MenuScreen.ts';
import type { SkillCard } from '../models/types.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function renderDeckEditScreen(): void {
  setScreen('deck_edit', () => {
    const screen = el('div', { class: 'deck-edit-screen' });
    const save = getOrCreateSave();

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => { playTap(); renderMenuScreen(); });
    header.appendChild(backBtn);
    header.appendChild(el('span', { class: 'text-gold', style: 'font-weight: 700' }, 'デッキ編集'));
    header.appendChild(el('span', {}, `${save.player.equippedDeck.length}/${DECK_SIZE}`));

    // 現在のデッキ表示
    const deckLabel = el('div', { style: 'color: var(--text-secondary); font-size: 0.8rem; padding: 0 8px' }, '現在のデッキ');
    const deckArea = el('div', { class: 'deck-current-area' });

    // 控えカード表示
    const benchLabel = el('div', { style: 'color: var(--text-secondary); font-size: 0.8rem; padding: 0 8px; margin-top: 8px' }, '控えカード');
    const benchArea = el('div', { class: 'deck-bench-area scroll-container' });

    let selectedDeckSlot: string | null = null;

    function renderDeck(): void {
      clearElement(deckArea);
      for (let i = 0; i < DECK_SIZE; i++) {
        const cardId = save.player.equippedDeck[i];
        const card = save.player.cards.find(c => c.id === cardId);
        const slot = createDeckSlot(card);
        deckArea.appendChild(slot);
      }
    }

    function createDeckSlot(card: SkillCard | undefined): HTMLElement {
      if (!card) {
        const emptySlot = el('div', { class: 'deck-slot empty' }, '空');
        return emptySlot;
      }

      const slot = el('div', {
        class: `deck-slot rarity-border-${card.rarity}${selectedDeckSlot === card.id ? ' selected' : ''}`,
      });
      slot.appendChild(el('div', { class: `element-${card.element}`, style: 'font-family: var(--font-serif); font-size: 1.2rem; font-weight: 900' }, card.name));
      slot.appendChild(el('div', { style: 'font-size: 0.65rem; color: var(--text-secondary)' }, `Lv.${card.level}`));
      slot.appendChild(el('div', { style: 'font-size: 0.6rem; color: var(--text-secondary)' }, `Pow.${card.power}`));

      onClick(slot, () => {
        playTap();
        selectedDeckSlot = card.id;
        renderDeck();
        renderBench();
      });

      return slot;
    }

    function renderBench(): void {
      clearElement(benchArea);
      const available = getAvailableCardsForDeck(save.player.cards, save.player.equippedDeck);

      if (available.length === 0) {
        benchArea.appendChild(el('div', { style: 'color: var(--text-secondary); text-align: center; padding: 16px; font-size: 0.85rem' },
          '控えカードがありません'));
        return;
      }

      const sorted = [...available].sort((a, b) => {
        const rarityOrder = { SSR: 0, SR: 1, R: 2, N: 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity] || b.power - a.power;
      });

      for (const card of sorted) {
        const item = createBenchItem(card);
        benchArea.appendChild(item);
      }
    }

    function createBenchItem(card: SkillCard): HTMLElement {
      const item = el('div', { class: `deck-bench-item rarity-border-${card.rarity}` });

      const nameRow = el('div', { style: 'display: flex; align-items: center; gap: 4px' });
      nameRow.appendChild(el('span', { class: `rarity-${card.rarity}`, style: 'font-size: 0.65rem' }, card.rarity));
      nameRow.appendChild(el('span', { class: `element-${card.element}`, style: 'font-weight: 700' }, card.name));
      item.appendChild(nameRow);

      const stats = el('div', { style: 'font-size: 0.7rem; color: var(--text-secondary)' }, `Lv.${card.level} Pow.${card.power}`);
      item.appendChild(stats);

      if (selectedDeckSlot) {
        const swapBtn = el('button', { class: 'btn btn--small btn--gold', style: 'font-size: 0.7rem; padding: 4px 8px' }, '入替');
        onClick(swapBtn, () => {
          playEquip();
          save.player.equippedDeck = swapDeckCard(save.player.equippedDeck, selectedDeckSlot!, card.id);
          saveSaveData(save);
          selectedDeckSlot = null;
          renderDeck();
          renderBench();
        });
        item.appendChild(swapBtn);
      }

      return item;
    }

    renderDeck();
    renderBench();

    screen.appendChild(header);
    screen.appendChild(deckLabel);
    screen.appendChild(deckArea);
    screen.appendChild(benchLabel);
    screen.appendChild(benchArea);

    return screen;
  });
}
