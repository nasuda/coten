// ============================================================
// TCG バトル画面
// ============================================================

import { el, onClick, setTCGScreen, clearElement } from './tcg-render.ts';
import { playTap, playCorrect, playWrong, playHit, playVictory, playDefeat } from '../../utils/audio.ts';
import type {
  TCGOpponent,
  TCGBattleState,
  TCGCard,
  TCGFieldSlot,
  TCGJodoushiCard,
  TCGVerbCardDef,
} from '../models/tcg-types.ts';
import {
  createBattleState,
  drawPhase,
  placeVerb,
  equipJodoushi,
  attack,
  resolvePhase,
  getEquippedSlotIndices,
  createBattleResult,
} from '../models/TCGBattleEngine.ts';
import { selectAIAction } from '../models/TCGAIPlayer.ts';
import { checkConnection, getConjugationChoices } from '../models/ConnectionValidator.ts';
import { getSelectedDeck, applyBattleResult } from './tcg-storage.ts';
import { renderTCGResultScreen } from './TCGResultScreen.ts';

let battleState: TCGBattleState;
let selectedHandIndex: number | null = null;
let actionMode: 'idle' | 'placing' | 'equipping' | 'attacking' = 'idle';
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timerStart = 0;
let currentOpponentRef: TCGOpponent | null = null;

export function renderTCGBattleScreen(opponent: TCGOpponent): void {
  currentOpponentRef = opponent;
  const playerDeck = getSelectedDeck();
  battleState = createBattleState(
    playerDeck,
    { verbs: opponent.deckVerbs, jodoushi: opponent.deckJodoushi },
    opponent.name,
  );

  // 最初のドロー
  battleState = drawPhase(battleState);

  setTCGScreen('tcg_battle', () => {
    const container = el('div', { class: 'tcg-battle' });
    renderBattleUI(container, opponent);
    return container;
  });
}

function renderBattleUI(container: HTMLElement, opponent: TCGOpponent, resetTimer = true): void {
  clearElement(container);

  // ヘッダー
  const header = el('div', { class: 'tcg-battle-header' });
  header.appendChild(el('span', {}, `R${battleState.currentRound}/${battleState.maxRounds}`));
  header.appendChild(el('span', {}, `${opponent.emoji} ${opponent.name}`));
  container.appendChild(header);

  // タイマー
  const timer = el('div', { class: 'tcg-timer' });
  const timerFill = el('div', { class: 'tcg-timer-fill' });
  timerFill.style.width = '100%';
  timer.appendChild(timerFill);
  container.appendChild(timer);

  // フィールド
  const field = el('div', { class: 'tcg-field' });

  // 相手フィールド
  const oppRow = el('div', { class: 'tcg-field-row opponent-row' });
  for (let i = 0; i < 3; i++) {
    oppRow.appendChild(renderSlot(battleState.opponent.field[i] ?? null, i, 'opponent'));
  }
  field.appendChild(oppRow);

  // VS
  field.appendChild(el('div', { class: 'tcg-vs-divider' }, 'VS'));

  // 自分フィールド
  const playerRow = el('div', { class: 'tcg-field-row' });
  for (let i = 0; i < 3; i++) {
    const slotEl = renderSlot(battleState.player.field[i] ?? null, i, 'player');
    playerRow.appendChild(slotEl);
  }
  field.appendChild(playerRow);

  container.appendChild(field);

  // 手札
  const handArea = el('div', { class: 'tcg-hand' });
  battleState.player.hand.forEach((card, idx) => {
    handArea.appendChild(renderHandCard(card, idx, container, opponent));
  });
  container.appendChild(handArea);

  // アクションボタン
  const actions = el('div', { class: 'tcg-actions' });

  const attackBtn = el('button', { class: 'btn-attack' }, '攻撃');
  const equippedSlots = getEquippedSlotIndices(battleState.player);
  if (equippedSlots.length === 0) attackBtn.setAttribute('disabled', '');
  onClick(attackBtn, () => {
    playTap();
    actionMode = 'attacking';
    selectedHandIndex = null;
    renderBattleUI(container, opponent, false);
  });

  const passBtn = el('button', { class: 'btn-pass' }, 'パス');
  onClick(passBtn, () => {
    playTap();
    endPlayerTurn(container, opponent);
  });

  actions.appendChild(attackBtn);
  actions.appendChild(passBtn);
  container.appendChild(actions);

  // バトルログ（最新3件）
  const logEl = el('div', { class: 'tcg-log' });
  const recentLogs = battleState.log.slice(-3);
  for (const msg of recentLogs) {
    logEl.appendChild(el('div', {}, msg));
  }
  container.appendChild(logEl);

  // タイマー開始（新ラウンド時のみリセット）
  if (resetTimer) {
    startTimer(timerFill, container, opponent);
  } else {
    // タイマーをリセットせず、表示だけ継続更新する
    updateTimerTarget(timerFill, container, opponent);
  }
}

function renderSlot(slot: TCGFieldSlot, index: number, who: 'player' | 'opponent'): HTMLElement {
  const slotEl = el('div', { class: 'tcg-slot' });

  if (!slot) {
    slotEl.appendChild(el('div', { class: 'verb-type' }, `スロット${index + 1}`));

    // プレイヤー側で配置モード
    if (who === 'player' && actionMode === 'placing') {
      slotEl.classList.add('placeable');
      onClick(slotEl, () => {
        if (selectedHandIndex !== null) {
          playTap();
          battleState = placeVerb(battleState, 'player', selectedHandIndex, index);
          selectedHandIndex = null;
          actionMode = 'idle';
          // renderBattleUI will be called from the parent
          const container = slotEl.closest('.tcg-battle') as HTMLElement;
          const opp = getCurrentOpponent();
          if (container && opp) renderBattleUI(container, opp, false);
        }
      });
    }
    return slotEl;
  }

  slotEl.classList.add('occupied');

  // 属性表示
  slotEl.classList.add(`element-${slot.card.element}`);

  const emoji = el('div', {}, slot.card.emoji);
  const nameEl = el('div', { class: 'verb-name' }, slot.card.name);
  const typeEl = el('div', { class: 'verb-type' }, getVerbTypeLabel(slot.card.verbType));

  // HPバー
  const hpBar = el('div', { class: 'hp-bar' });
  const hpFill = el('div', { class: 'hp-bar-fill' });
  const hpRatio = slot.currentHP / slot.card.maxHP;
  hpFill.style.width = `${hpRatio * 100}%`;
  if (hpRatio < 0.3) hpFill.classList.add('low');
  hpBar.appendChild(hpFill);

  const hpText = el('div', { class: 'verb-type' }, `${slot.currentHP}/${slot.card.maxHP}`);

  slotEl.appendChild(emoji);
  slotEl.appendChild(nameEl);
  slotEl.appendChild(typeEl);
  slotEl.appendChild(hpBar);
  slotEl.appendChild(hpText);

  // 装備済み表示
  if (slot.equippedJodoushi) {
    const badge = el('div', { class: 'equipped-badge' }, slot.equippedJodoushi.name);
    slotEl.appendChild(badge);
  }

  // プレイヤー側で装備モード
  if (who === 'player' && actionMode === 'equipping' && selectedHandIndex !== null) {
    const handCard = battleState.player.hand[selectedHandIndex];
    if (handCard?.type === 'jodoushi' && !slot.equippedJodoushi) {
      const conn = checkConnection(handCard.card as TCGJodoushiCard, slot.card);
      if (conn.canConnect) {
        slotEl.classList.add('placeable');
        onClick(slotEl, () => {
          showConnectionQuiz(handCard.card as TCGJodoushiCard, slot.card, selectedHandIndex!, index);
        });
      }
    }
  }

  // 攻撃モード - 相手ターゲット選択
  if (who === 'opponent' && actionMode === 'attacking') {
    slotEl.classList.add('targetable');
    onClick(slotEl, () => {
      const equippedSlots = getEquippedSlotIndices(battleState.player);
      if (equippedSlots.length > 0) {
        playHit();
        battleState = attack(battleState, 'player', equippedSlots[0]!, index);
        actionMode = 'idle';
        const battleContainer = slotEl.closest('.tcg-battle') as HTMLElement;
        const opp = getCurrentOpponent();
        if (battleContainer && opp) endPlayerTurn(battleContainer, opp);
      }
    });
  }

  return slotEl;
}

function renderHandCard(card: TCGCard, index: number, container: HTMLElement, opponent: TCGOpponent): HTMLElement {
  const cardEl = el('div', {
    class: `tcg-hand-card ${card.type === 'verb' ? 'verb-card' : 'jodoushi-card'}`,
  });

  if (index === selectedHandIndex) cardEl.classList.add('selected');

  if (card.type === 'verb') {
    cardEl.appendChild(el('div', {}, (card.card as TCGVerbCardDef).emoji));
    cardEl.appendChild(el('div', { class: 'card-name' }, card.card.name));
    cardEl.appendChild(el('div', { class: 'card-type' }, '動詞'));

    onClick(cardEl, () => {
      playTap();
      selectedHandIndex = index;
      actionMode = 'placing';
      renderBattleUI(container, opponent, false);
    });
  } else {
    const j = card.card as TCGJodoushiCard;
    cardEl.appendChild(el('div', { class: 'card-name' }, j.name));
    cardEl.appendChild(el('div', { class: 'card-type' }, j.meanings[0] ?? ''));
    cardEl.appendChild(el('div', { class: 'card-type' }, `P:${j.power}`));

    onClick(cardEl, () => {
      playTap();
      selectedHandIndex = index;
      actionMode = 'equipping';
      renderBattleUI(container, opponent, false);
    });
  }

  return cardEl;
}

function showConnectionQuiz(
  jodoushi: TCGJodoushiCard,
  verb: TCGVerbCardDef,
  handIndex: number,
  slotIndex: number,
): void {
  const overlay = el('div', { class: 'tcg-quiz-overlay' });
  const box = el('div', { class: 'tcg-quiz-box' });

  box.appendChild(el('h3', {}, `「${verb.name}」+「${jodoushi.name}」`));
  box.appendChild(el('div', { class: 'tcg-quiz-prompt' },
    `「${jodoushi.name}」(${jodoushi.connection})を装備するには？`));

  const choices = getConjugationChoices(verb);
  const conn = checkConnection(jodoushi, verb);
  const formsGrid = el('div', { class: 'tcg-quiz-forms' });

  for (const choice of choices) {
    const btn = el('button', {}, `${choice.form}（${choice.label}）`);
    onClick(btn, () => {
      const container = document.querySelector('.tcg-battle');
      if (!container) return;
      const opponent = getCurrentOpponent();
      if (!opponent) return;

      battleState = equipJodoushi(battleState, 'player', handIndex, slotIndex, choice.form);

      const lastResult = battleState.connectionHistory[battleState.connectionHistory.length - 1];
      if (lastResult?.isCorrect) {
        playCorrect();
        btn.classList.add('correct');
      } else {
        playWrong();
        btn.classList.add('wrong');
        // 正解を表示
        for (const otherBtn of formsGrid.children) {
          const text = (otherBtn as HTMLElement).textContent ?? '';
          if (text.includes(lastResult?.correctForm ?? '')) {
            (otherBtn as HTMLElement).classList.add('correct');
          }
        }
        // 文法理由フィードバック
        if (conn.requiredForm && conn.requiredFormName) {
          const reason = el('div', { class: 'tcg-quiz-reason' },
            `「${jodoushi.name}」は${conn.requiredFormName}に接続 → 正解は「${conn.requiredForm}」(${conn.requiredFormName})`);
          box.appendChild(reason);
        }
      }

      // 少し待ってからUIを更新（誤答時は読む時間を確保）
      const delay = lastResult?.isCorrect ? 800 : 1200;
      setTimeout(() => {
        overlay.remove();
        selectedHandIndex = null;
        actionMode = 'idle';
        renderBattleUI(container as HTMLElement, opponent, false);
      }, delay);
    });
    formsGrid.appendChild(btn);
  }

  box.appendChild(formsGrid);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function endPlayerTurn(container: HTMLElement, opponent: TCGOpponent): void {
  stopTimer();

  // クイズオーバーレイが残っていたら除去（タイムアウト時対策）
  document.querySelector('.tcg-quiz-overlay')?.remove();

  // AIアクション
  const aiAction = selectAIAction(battleState, opponent.difficulty);

  switch (aiAction.type) {
    case 'place':
      battleState = placeVerb(battleState, 'opponent', aiAction.handIndex, aiAction.slotIndex);
      break;
    case 'equip':
      battleState = equipJodoushi(battleState, 'opponent', aiAction.handIndex, aiAction.slotIndex, aiAction.selectedForm);
      break;
    case 'attack':
      playHit();
      battleState = attack(battleState, 'opponent', aiAction.attackerSlot, aiAction.targetSlot);
      break;
    case 'pass':
      battleState = { ...battleState, log: [...battleState.log, `${battleState.opponent.name}: パス`] };
      break;
  }

  // 解決フェーズ
  battleState = resolvePhase(battleState);

  if (battleState.phase === 'victory' || battleState.phase === 'defeat' || battleState.phase === 'draw_game') {
    const result = createBattleResult(battleState, opponent.id);
    applyBattleResult(result);

    if (battleState.phase === 'victory') {
      playVictory();
    } else if (battleState.phase === 'draw_game') {
      playTap();
    } else {
      playDefeat();
    }

    const playerHistory = battleState.connectionHistory.filter(h => h.who === 'player');

    stopTimer();
    setTimeout(() => {
      renderTCGResultScreen(result, playerHistory);
    }, 600);
    return;
  }

  // 次のラウンド
  battleState = drawPhase(battleState);
  selectedHandIndex = null;
  actionMode = 'idle';
  renderBattleUI(container, opponent);
}

// タイマーが参照するDOM要素（再描画で差し替わるため外部保持）
let timerTargetFill: HTMLElement | null = null;
let timerTargetContainer: HTMLElement | null = null;
let timerTargetOpponent: TCGOpponent | null = null;

function startTimer(timerFill: HTMLElement, container: HTMLElement, opponent: TCGOpponent): void {
  stopTimer();
  timerStart = Date.now();
  timerTargetFill = timerFill;
  timerTargetContainer = container;
  timerTargetOpponent = opponent;
  const limit = battleState.actionTimeLimit * 1000;

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - timerStart;
    const remaining = Math.max(0, 1 - elapsed / limit);
    if (timerTargetFill) {
      timerTargetFill.style.width = `${remaining * 100}%`;
      if (remaining < 0.3) {
        timerTargetFill.classList.add('urgent');
      }
    }

    if (elapsed >= limit) {
      stopTimer();
      // 時間切れ → 自動パス
      if (timerTargetContainer && timerTargetOpponent) {
        endPlayerTurn(timerTargetContainer, timerTargetOpponent);
      }
    }
  }, 100);
}

function updateTimerTarget(timerFill: HTMLElement, container: HTMLElement, opponent: TCGOpponent): void {
  // タイマーのDOM参照だけ更新（リセットしない）
  timerTargetFill = timerFill;
  timerTargetContainer = container;
  timerTargetOpponent = opponent;

  // 現在の残り時間を即座に反映
  const limit = battleState.actionTimeLimit * 1000;
  const elapsed = Date.now() - timerStart;
  const remaining = Math.max(0, 1 - elapsed / limit);
  timerFill.style.width = `${remaining * 100}%`;
  if (remaining < 0.3) {
    timerFill.classList.add('urgent');
  }
}

function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
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

function getCurrentOpponent(): TCGOpponent | null {
  return currentOpponentRef;
}
