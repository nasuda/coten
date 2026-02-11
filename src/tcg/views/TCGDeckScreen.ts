// ============================================================
// TCG デッキ編集画面
// ============================================================

import { el, onClick, setTCGScreen, clearElement } from './tcg-render.ts';
import { playTap, playEquip } from '../../utils/audio.ts';
import { allVerbs } from '../data/verbs.ts';
import { allTCGJodoushiCards } from '../data/tcg-cards.ts';
import { validateDeck } from '../models/TCGDeckManager.ts';
import type { TCGDeckConfig } from '../models/tcg-types.ts';
import { getSelectedDeck, saveSelectedDeck } from './tcg-storage.ts';
import { renderTCGTitleScreen } from './TCGTitleScreen.ts';

let currentDeck: TCGDeckConfig;

export function renderTCGDeckScreen(): void {
  currentDeck = { ...getSelectedDeck() };

  setTCGScreen('tcg_deck', () => {
    const container = el('div', { class: 'tcg-deck-edit' });
    renderDeckUI(container);
    return container;
  });
}

function renderDeckUI(container: HTMLElement): void {
  clearElement(container);

  container.appendChild(el('h2', {}, 'デッキ編集'));

  // 動詞セクション
  const verbSection = el('div', { class: 'tcg-deck-section' });
  verbSection.appendChild(el('h3', {}, `動詞カード（${currentDeck.verbs.length}/3）`));

  const verbGrid = el('div', { class: 'tcg-card-grid' });
  for (const verb of allVerbs) {
    const isSelected = currentDeck.verbs.includes(verb.id);
    const pick = el('div', { class: `tcg-card-pick${isSelected ? ' selected' : ''}` });
    pick.appendChild(el('div', {}, verb.emoji));
    pick.appendChild(el('div', { class: 'pick-name' }, verb.name));
    pick.appendChild(el('div', {}, getVerbTypeLabel(verb.verbType)));

    onClick(pick, () => {
      playTap();
      if (isSelected) {
        currentDeck = {
          ...currentDeck,
          verbs: currentDeck.verbs.filter(v => v !== verb.id),
        };
      } else if (currentDeck.verbs.length < 3) {
        currentDeck = {
          ...currentDeck,
          verbs: [...currentDeck.verbs, verb.id],
        };
      }
      renderDeckUI(container);
    });

    verbGrid.appendChild(pick);
  }
  verbSection.appendChild(verbGrid);
  container.appendChild(verbSection);

  // 助動詞セクション
  const jodoushiSection = el('div', { class: 'tcg-deck-section' });
  jodoushiSection.appendChild(el('h3', {}, `助動詞カード（${currentDeck.jodoushi.length}/5）`));

  const jodoushiGrid = el('div', { class: 'tcg-card-grid' });
  for (const j of allTCGJodoushiCards) {
    const isSelected = currentDeck.jodoushi.includes(j.jodoushiId);
    const pick = el('div', { class: `tcg-card-pick${isSelected ? ' selected' : ''}` });
    pick.appendChild(el('div', { class: 'pick-name' }, j.name));
    pick.appendChild(el('div', {}, j.connection));
    pick.appendChild(el('div', {}, `P:${j.power}`));

    onClick(pick, () => {
      playTap();
      if (isSelected) {
        currentDeck = {
          ...currentDeck,
          jodoushi: currentDeck.jodoushi.filter(id => id !== j.jodoushiId),
        };
      } else if (currentDeck.jodoushi.length < 5) {
        currentDeck = {
          ...currentDeck,
          jodoushi: [...currentDeck.jodoushi, j.jodoushiId],
        };
      }
      renderDeckUI(container);
    });

    jodoushiGrid.appendChild(pick);
  }
  jodoushiSection.appendChild(jodoushiGrid);
  container.appendChild(jodoushiSection);

  // バリデーションメッセージ
  const validation = validateDeck(currentDeck);
  if (!validation.valid) {
    const errorEl = el('div', { class: 'tcg-log' });
    for (const err of validation.errors) {
      errorEl.appendChild(el('div', {}, err));
    }
    container.appendChild(errorEl);
  }

  // ボタン
  const btnRow = el('div', { class: 'tcg-actions' });

  const saveBtn = el('button', { class: 'btn-attack' }, '保存');
  if (!validation.valid) saveBtn.setAttribute('disabled', '');
  onClick(saveBtn, () => {
    if (!validation.valid) return;
    playEquip();
    saveSelectedDeck(currentDeck);
    renderTCGTitleScreen();
  });

  const backBtn = el('button', { class: 'btn-pass' }, '戻る');
  onClick(backBtn, () => {
    playTap();
    renderTCGTitleScreen();
  });

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(backBtn);
  container.appendChild(btnRow);
}

function getVerbTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    yodan: '四段',
    kami_nidan: '上二段',
    shimo_nidan: '下二段',
    kami_ichidan: '上一段',
    shimo_ichidan: '下一段',
    ka_hen: 'カ変',
    sa_hen: 'サ変',
    na_hen: 'ナ変',
    ra_hen: 'ラ変',
  };
  return labels[type] ?? type;
}
