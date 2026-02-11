// ============================================================
// TCG プロフィール選択画面
// ============================================================

import { el, onClick, setTCGScreen, clearElement } from './tcg-render.ts';
import { playTap } from '../../utils/audio.ts';
import {
  getProfiles,
  createProfile,
  setActiveProfile,
} from '../../utils/storage.ts';
import { MAX_PROFILES } from '../../models/types.ts';
import { migrateLegacyTCGSave } from './tcg-storage.ts';
import { renderTCGTitleScreen } from './TCGTitleScreen.ts';

export function renderTCGProfileScreen(): void {
  setTCGScreen('tcg_profile', () => {
    const container = el('div', { class: 'tcg-title' });

    const title = el('h1', {}, '言霊大戦');
    const subtitle = el('p', { class: 'subtitle' }, 'プレイヤーを選択してください');
    container.appendChild(title);
    container.appendChild(subtitle);

    const slotsArea = el('div', {
      style: 'display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 400px;',
    });
    container.appendChild(slotsArea);

    renderProfileSlots(slotsArea);

    return container;
  });
}

function renderProfileSlots(container: HTMLElement): void {
  clearElement(container);
  const profiles = getProfiles();

  for (const profile of profiles) {
    const slot = el('div', { class: 'opponent-card' });

    const emoji = el('span', { class: 'emoji' }, '👤');
    const info = el('div', { class: 'info' });
    const nameEl = el('div', { class: 'name' }, profile.name);
    info.appendChild(nameEl);

    slot.appendChild(emoji);
    slot.appendChild(info);

    onClick(slot, () => {
      playTap();
      setActiveProfile(profile.id);
      migrateLegacyTCGSave();
      renderTCGTitleScreen();
    });

    container.appendChild(slot);
  }

  if (profiles.length < MAX_PROFILES) {
    const createSlot = el('div', {
      class: 'opponent-card',
      style: 'border-style: dashed; opacity: 0.7;',
    });

    const emoji = el('span', { class: 'emoji' }, '➕');
    const info = el('div', { class: 'info' });
    const label = el('div', { class: 'name' }, '新規作成');
    info.appendChild(label);

    createSlot.appendChild(emoji);
    createSlot.appendChild(info);

    onClick(createSlot, () => {
      playTap();
      showNameInput(container);
    });

    container.appendChild(createSlot);
  }
}

function showNameInput(container: HTMLElement): void {
  clearElement(container);

  const promptLabel = el('div', {
    style: 'font-size: 1.1rem; font-weight: bold; margin-bottom: 0.75rem;',
  }, '名前を入力');
  container.appendChild(promptLabel);

  const input = el('input', {
    type: 'text',
    maxlength: '8',
    placeholder: 'なまえ',
    style: 'width: 100%; padding: 0.7rem; border-radius: 8px; border: 2px solid var(--border, #444); background: var(--surface, #1e1e2e); color: var(--text, #e5e7eb); font-size: 1rem; text-align: center;',
  }) as HTMLInputElement;
  container.appendChild(input);

  const btnRow = el('div', {
    style: 'display: flex; gap: 0.75rem; justify-content: center; margin-top: 0.75rem;',
  });

  const okBtn = el('button', { class: 'btn btn-primary' }, '決定');
  onClick(okBtn, () => {
    const name = input.value.trim();
    if (!name) return;
    playTap();
    const profile = createProfile(name);
    if (profile) {
      setActiveProfile(profile.id);
      renderTCGTitleScreen();
    }
  });

  const cancelBtn = el('button', { class: 'btn btn-secondary' }, '戻る');
  onClick(cancelBtn, () => {
    playTap();
    renderProfileSlots(container);
  });

  btnRow.appendChild(okBtn);
  btnRow.appendChild(cancelBtn);
  container.appendChild(btnRow);

  input.focus();
}
