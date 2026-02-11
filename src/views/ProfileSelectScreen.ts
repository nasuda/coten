// ============================================================
// プロフィール選択画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap } from '../utils/audio.ts';
import {
  getProfiles,
  createProfile,
  deleteProfile,
  setActiveProfile,
  loadSaveData,
} from '../utils/storage.ts';
import { MAX_PROFILES } from '../models/types.ts';
import { renderMenuScreen } from './MenuScreen.ts';
import { renderTitleScreen } from './TitleScreen.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function renderProfileSelectScreen(): void {
  setScreen('profile_select', () => {
    const screen = el('div', { class: 'profile-screen' });

    const title = el('div', { class: 'profile-title' }, 'プレイヤー選択');
    screen.appendChild(title);

    const slotsArea = el('div', { class: 'profile-slots' });
    screen.appendChild(slotsArea);

    renderSlots(slotsArea);

    const backBtn = el('button', { class: 'btn btn--secondary profile-back-btn' }, '戻る');
    onClick(backBtn, () => {
      playTap();
      renderTitleScreen();
    });
    screen.appendChild(backBtn);

    return screen;
  });
}

function renderSlots(container: HTMLElement): void {
  clearElement(container);
  const profiles = getProfiles();

  for (let i = 0; i < MAX_PROFILES; i++) {
    const profile = profiles[i];
    if (profile) {
      container.appendChild(renderFilledSlot(profile, container));
    } else {
      container.appendChild(renderEmptySlot(container));
    }
  }
}

function renderFilledSlot(profile: { id: string; name: string; createdAt: string }, container: HTMLElement): HTMLElement {
  const slot = el('div', { class: 'profile-slot filled' });

  const nameEl = el('div', { class: 'profile-name' }, profile.name);
  slot.appendChild(nameEl);

  // セーブデータの要約を表示
  const prevActive = localStorage.getItem('bunpou_musou_active');
  localStorage.setItem('bunpou_musou_active', profile.id);
  const save = loadSaveData();
  if (prevActive) {
    localStorage.setItem('bunpou_musou_active', prevActive);
  } else {
    localStorage.removeItem('bunpou_musou_active');
  }

  if (save) {
    const info = el('div', { class: 'profile-info' });
    info.appendChild(el('span', {}, `Lv.${save.player.level}`));
    info.appendChild(el('span', {}, `Ch.${save.currentChapter}`));
    info.appendChild(el('span', { class: 'text-gold' }, `💎${save.player.stones}`));
    slot.appendChild(info);
  } else {
    slot.appendChild(el('div', { class: 'profile-info' }, '新規データ'));
  }

  const btnRow = el('div', { class: 'profile-btn-row' });

  const playBtn = el('button', { class: 'btn btn--gold' }, 'プレイ');
  onClick(playBtn, () => {
    playTap();
    setActiveProfile(profile.id);
    renderMenuScreen();
  });

  const deleteBtn = el('button', { class: 'btn btn--danger' }, '削除');
  onClick(deleteBtn, () => {
    playTap();
    if (confirm(`「${profile.name}」のデータを削除しますか？`)) {
      deleteProfile(profile.id);
      renderSlots(container);
    }
  });

  btnRow.appendChild(playBtn);
  btnRow.appendChild(deleteBtn);
  slot.appendChild(btnRow);

  return slot;
}

function renderEmptySlot(container: HTMLElement): HTMLElement {
  const slot = el('div', { class: 'profile-slot empty' });

  const label = el('div', { class: 'profile-empty-label' }, '空きスロット');
  slot.appendChild(label);

  const createBtn = el('button', { class: 'btn btn--primary' }, '新規作成');
  onClick(createBtn, () => {
    playTap();
    showNameInput(slot, container);
  });
  slot.appendChild(createBtn);

  return slot;
}

function showNameInput(slot: HTMLElement, container: HTMLElement): void {
  clearElement(slot);
  slot.className = 'profile-slot creating';

  const promptLabel = el('div', { class: 'profile-name-prompt' }, '名前を入力');
  slot.appendChild(promptLabel);

  const input = el('input', {
    type: 'text',
    class: 'profile-name-input',
    maxlength: '8',
    placeholder: 'なまえ',
  }) as HTMLInputElement;
  slot.appendChild(input);

  const btnRow = el('div', { class: 'profile-btn-row' });

  const okBtn = el('button', { class: 'btn btn--gold' }, '決定');
  onClick(okBtn, () => {
    const name = input.value.trim();
    if (!name) return;
    playTap();
    const profile = createProfile(name);
    if (profile) {
      setActiveProfile(profile.id);
      renderMenuScreen();
    }
  });

  const cancelBtn = el('button', { class: 'btn btn--secondary' }, '戻る');
  onClick(cancelBtn, () => {
    playTap();
    renderSlots(container);
  });

  btnRow.appendChild(okBtn);
  btnRow.appendChild(cancelBtn);
  slot.appendChild(btnRow);

  input.focus();
}
