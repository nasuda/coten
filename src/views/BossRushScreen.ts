// ============================================================
// ボスラッシュ画面 (Chapter 5 連続戦闘)
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap, playBossRushStart, playVictory } from '../utils/audio.ts';
import { getOrCreateSave, saveSaveData } from '../utils/storage.ts';
import { createBossRushState, advanceBossRush, isBossRushComplete, getCurrentBoss, getBossRushBosses } from '../models/BossRush.ts';
import type { BossRushState } from '../models/BossRush.ts';
import type { BattleResult, TurnResult } from '../models/types.ts';
import { calculateLevelUp, calculatePlayerStats } from '../models/ProgressManager.ts';
import { applyBattleResultToSave } from '../models/SaveDataUpdater.ts';
import { renderBattleScreen } from './BattleScreen.ts';
import { renderWorldScreen } from './WorldScreen.ts';
import { renderResultScreen } from './ResultScreen.ts';

// モジュールレベルでボスラッシュ状態を管理
let rushState: BossRushState | null = null;

export function startBossRush(): void {
  rushState = createBossRushState();
  renderBossRushIntro();
}

function renderBossRushIntro(): void {
  setScreen('boss_rush', () => {
    const screen = el('div', { class: 'boss-rush-screen' });

    const title = el('div', { class: 'boss-rush-title' }, 'BOSS RUSH');
    const subtitle = el('div', { style: 'color: var(--accent-purple); font-size: 0.9rem; letter-spacing: 0.1em' },
      '～ 歴代ボス連続戦闘 ～');

    const bossListEl = el('div', { class: 'boss-rush-boss-list' });
    const bosses = getBossRushBosses();

    for (let i = 0; i < bosses.length; i++) {
      const boss = bosses[i]!;
      const bossItem = el('div', { class: 'boss-rush-boss-item' });
      bossItem.appendChild(el('span', { style: 'font-size: 1.5rem' }, boss.emoji));
      bossItem.appendChild(el('span', { style: 'font-weight: 700' }, boss.name));
      bossItem.appendChild(el('span', { style: 'font-size: 0.75rem; color: var(--text-secondary)' }, `Lv.${boss.level}`));
      bossListEl.appendChild(bossItem);
    }

    const desc = el('div', { style: 'color: var(--text-secondary); font-size: 0.8rem; text-align: center; padding: 0 16px' });
    desc.appendChild(el('div', {}, '4体のボスと連続で戦闘！'));
    desc.appendChild(el('div', {}, '全て撃破でクリアボーナス獲得'));

    const startBtn = el('button', { class: 'btn btn--gold btn--large', style: 'width: 100%' }, '挑戦開始');
    onClick(startBtn, () => {
      playBossRushStart();
      proceedToNextBoss();
    });

    const backBtn = el('button', { class: 'btn', style: 'width: 100%' }, '← 戻る');
    onClick(backBtn, () => { playTap(); renderWorldScreen(); });

    screen.appendChild(title);
    screen.appendChild(subtitle);
    screen.appendChild(bossListEl);
    screen.appendChild(desc);
    screen.appendChild(startBtn);
    screen.appendChild(backBtn);

    return screen;
  });
}

function proceedToNextBoss(): void {
  if (!rushState) {
    console.error('ボスラッシュ: rushStateがnullです。ワールドマップに戻ります。');
    renderWorldScreen();
    return;
  }

  if (isBossRushComplete(rushState)) {
    renderBossRushComplete();
    return;
  }

  const boss = getCurrentBoss(rushState);
  if (!boss) {
    renderBossRushComplete();
    return;
  }

  renderBossRushTransition(rushState.currentBossIndex, () => {
    renderBattleScreen('s5_4', boss);
  });
}

function renderBossRushTransition(bossIndex: number, onReady: () => void): void {
  setScreen('boss_rush', () => {
    const screen = el('div', { class: 'boss-rush-screen' });
    const bosses = getBossRushBosses();
    const boss = bosses[bossIndex];
    if (!boss) {
      onReady();
      return screen;
    }

    const roundLabel = el('div', { class: 'boss-rush-round' }, `ROUND ${bossIndex + 1} / ${bosses.length}`);
    const emoji = el('div', { style: 'font-size: 4rem; margin: 16px 0' }, boss.emoji);
    const bossName = el('div', { class: 'text-gold', style: 'font-size: 1.3rem; font-weight: 900; font-family: var(--font-serif)' }, boss.name);
    const bossLv = el('div', { style: 'color: var(--text-secondary); font-size: 0.85rem' }, `Lv.${boss.level}  HP:${boss.maxHP}`);

    // 進捗ドット
    const progressDots = el('div', { style: 'display: flex; gap: 8px; margin-top: 16px' });
    for (let i = 0; i < bosses.length; i++) {
      const dotClass = i < bossIndex ? 'boss-rush-dot cleared' : i === bossIndex ? 'boss-rush-dot current' : 'boss-rush-dot';
      progressDots.appendChild(el('div', { class: dotClass }));
    }

    screen.appendChild(roundLabel);
    screen.appendChild(emoji);
    screen.appendChild(bossName);
    screen.appendChild(bossLv);
    screen.appendChild(progressDots);

    setTimeout(() => onReady(), 2000);

    return screen;
  });
}

// BattleScreenからの帰還ポイント
export function handleBossRushResult(result: BattleResult, turnResults: TurnResult[]): void {
  if (!rushState) {
    console.error('ボスラッシュ: rushStateがnullです。通常リザルトにフォールバックします。');
    renderResultScreen(result, turnResults);
    return;
  }

  // 図鑑更新
  const save = getOrCreateSave();
  const zukanUpdated = applyBattleResultToSave(save, result, turnResults);
  save.zukanJodoushi = zukanUpdated.zukanJodoushi;
  save.zukanEnemies = zukanUpdated.zukanEnemies;
  saveSaveData(save);

  rushState = advanceBossRush(rushState, result);

  if (!result.victory) {
    renderBossRushDefeat();
    return;
  }

  proceedToNextBoss();
}

function renderBossRushComplete(): void {
  if (!rushState) {
    renderWorldScreen();
    return;
  }
  const state = rushState;
  rushState = null;

  setScreen('boss_rush', () => {
    const screen = el('div', { class: 'boss-rush-screen' });

    playVictory();

    const title = el('div', { class: 'boss-rush-title text-gold' }, 'ALL CLEAR!');
    const subtitle = el('div', { style: 'color: var(--accent-purple); font-size: 0.9rem' }, 'ボスラッシュ制覇！');

    const statsBox = el('div', { class: 'result-stats', style: 'width: 100%' });
    statsBox.appendChild(createRow('撃破ボス数', `${state.completedBosses.length} / 4`));
    statsBox.appendChild(createRow('獲得EXP合計', `+${state.totalExp}`, 'text-green'));
    statsBox.appendChild(createRow('獲得石合計', `+${state.totalStones} 💎`, 'text-gold'));

    // ボーナス報酬
    const bonusStones = 100;
    statsBox.appendChild(el('div', { style: 'border-top: 1px solid #444; margin: 8px 0' }));
    statsBox.appendChild(createRow('制覇ボーナス', `+${bonusStones} 💎`, 'text-gold'));

    // セーブ反映
    const save = getOrCreateSave();
    save.player.stones += bonusStones;
    const levelResult = calculateLevelUp(save.player.level, save.player.exp, state.totalExp);
    save.player.level = levelResult.newLevel;
    save.player.exp = levelResult.remainingExp;
    const newStats = calculatePlayerStats(levelResult.newLevel);
    save.player.maxHP = newStats.maxHP;
    save.player.attackBonus = newStats.attackBonus;
    saveSaveData(save);

    if (levelResult.levelsGained > 0) {
      statsBox.appendChild(createRow('レベルアップ！', `Lv.${levelResult.newLevel}`, 'text-gold'));
    }

    const backBtn = el('button', { class: 'btn btn--gold', style: 'width: 100%' }, 'ワールドマップへ');
    onClick(backBtn, () => { playTap(); renderWorldScreen(); });

    screen.appendChild(title);
    screen.appendChild(subtitle);
    screen.appendChild(statsBox);
    screen.appendChild(backBtn);

    return screen;
  });
}

function renderBossRushDefeat(): void {
  if (!rushState) {
    renderWorldScreen();
    return;
  }
  const state = rushState;
  rushState = null;

  setScreen('boss_rush', () => {
    const screen = el('div', { class: 'boss-rush-screen' });

    const title = el('div', { style: 'font-family: var(--font-serif); font-size: 2rem; font-weight: 900; color: var(--accent-red)' }, 'DEFEATED');
    const subtitle = el('div', { style: 'color: var(--text-secondary); font-size: 0.9rem' },
      `${state.completedBosses.length} / 4 ボス撃破`);

    const statsBox = el('div', { class: 'result-stats', style: 'width: 100%' });
    statsBox.appendChild(createRow('獲得EXP合計', `+${state.totalExp}`, 'text-green'));

    // 敗北時もEXPだけ反映
    const save = getOrCreateSave();
    const levelResult = calculateLevelUp(save.player.level, save.player.exp, state.totalExp);
    save.player.level = levelResult.newLevel;
    save.player.exp = levelResult.remainingExp;
    const newStats = calculatePlayerStats(levelResult.newLevel);
    save.player.maxHP = newStats.maxHP;
    save.player.attackBonus = newStats.attackBonus;
    saveSaveData(save);

    const retryBtn = el('button', { class: 'btn btn--gold', style: 'width: 100%' }, 'もう一度挑戦');
    onClick(retryBtn, () => { playTap(); startBossRush(); });

    const backBtn = el('button', { class: 'btn', style: 'width: 100%' }, '← ワールドマップへ');
    onClick(backBtn, () => { playTap(); renderWorldScreen(); });

    screen.appendChild(title);
    screen.appendChild(subtitle);
    screen.appendChild(statsBox);
    screen.appendChild(retryBtn);
    screen.appendChild(backBtn);

    return screen;
  });
}

export function isBossRushActive(): boolean {
  return rushState !== null;
}

function createRow(label: string, value: string, valueClass = ''): HTMLElement {
  const row = el('div', { class: 'result-row' });
  row.appendChild(el('span', { class: 'result-row-label' }, label));
  row.appendChild(el('span', { class: `result-row-value ${valueClass}` }, value));
  return row;
}
