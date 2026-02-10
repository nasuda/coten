// ============================================================
// バトル画面本体
// ============================================================

import { el, onClick, setScreen, waitMs, animateElement } from '../utils/render.ts';
import { playCorrect, playWrong, playHit, playCombo, playSpecial, playVictory, playDefeat } from '../utils/audio.ts';
import { getOrCreateSave } from '../utils/storage.ts';
import { createBattleState, processTurnAnswer, processSpecialAttack, checkBattleEnd, createBattleResult } from '../models/BattleEngine.ts';
import { generateQuestion, selectQuestionType } from '../models/QuestionGenerator.ts';
import { calculatePlayerStats } from '../models/ProgressManager.ts';
import { getStageById } from '../data/stages.ts';
import { createHPBar, updateHPBar } from './components/HPBar.ts';
import { createTimerBar, updateTimerBar } from './components/TimerBar.ts';
import { createComboGauge, updateComboGauge } from './components/ComboGauge.ts';
import { createSkillCardView, setCardState } from './components/SkillCardView.ts';
import { createEnemySprite, shakeEnemy } from './components/EnemySprite.ts';
import { showDamageNumber, showSpeedLabel } from './components/DamageNumber.ts';
import { showCutinOverlay } from './components/CutinOverlay.ts';
import { renderResultScreen } from './ResultScreen.ts';
import type { Enemy } from '../models/types.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function renderBattleScreen(stageId: string, enemy: Enemy): void {
  setScreen('battle', () => {
    const screen = el('div', { class: 'battle-screen' });
    const save = getOrCreateSave();
    const stats = calculatePlayerStats(save.player.level);
    const stage = getStageById(stageId);

    let state = createBattleState(enemy, save.player.cards.slice(0, 5), stage?.chapterId ?? 1, stats.maxHP, stats.attackBonus);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let answerLocked = false;

    // --- 敵エリア ---
    const enemyHPBar = createHPBar(state.enemyCurrentHP, state.enemy.maxHP, true);
    const enemySprite = createEnemySprite(enemy);

    // --- 問題エリア ---
    const questionArea = el('div', { class: 'question-area' });
    const questionTypeLabel = el('div', { class: 'question-type-label' });
    const questionText = el('div', { class: 'question-text' });
    questionArea.appendChild(questionTypeLabel);
    questionArea.appendChild(questionText);

    // --- タイマー ---
    const timerBar = createTimerBar();

    // --- 手札エリア ---
    const handArea = el('div', { class: 'hand-area' });

    // --- ステータスエリア ---
    const statusArea = el('div', { class: 'status-area' });
    const comboGauge = createComboGauge(state.combo, state.comboGauge);
    const playerHPBar = createHPBar(state.playerCurrentHP, state.playerMaxHP, false);
    const specialBtn = el('button', { class: 'special-btn' }, '★ 必殺技（ゲージ不足）');
    const logArea = el('div', { class: 'battle-log' });

    onClick(specialBtn, async () => {
      if (!state.specialReady || answerLocked) return;
      answerLocked = true;
      if (timerInterval) clearInterval(timerInterval);

      playSpecial();
      await showCutinOverlay(state.hand[0]?.jodoushiId ?? 'zu');

      state = processSpecialAttack(state, 0);

      updateHPBar(enemyHPBar, state.enemyCurrentHP, state.enemy.maxHP);
      updateComboGauge(comboGauge, state.combo, state.comboGauge);
      updateSpecialBtn();
      shakeEnemy(enemySprite);
      showDamageNumber(screen, state.enemy.maxHP - state.enemyCurrentHP, 'player', true);

      await waitMs(800);

      const endResult = checkBattleEnd(state);
      if (endResult) {
        endBattle(endResult);
      } else {
        answerLocked = false;
        nextTurn();
      }
    });

    statusArea.appendChild(comboGauge);
    statusArea.appendChild(playerHPBar);
    statusArea.appendChild(specialBtn);
    statusArea.appendChild(logArea);

    screen.appendChild(enemyHPBar);
    screen.appendChild(enemySprite);
    screen.appendChild(questionArea);
    screen.appendChild(timerBar);
    screen.appendChild(handArea);
    screen.appendChild(statusArea);

    // --- 更新関数 ---
    function updateSpecialBtn(): void {
      if (state.specialReady) {
        specialBtn.className = 'special-btn ready';
        specialBtn.textContent = '★ 必殺技発動！';
      } else {
        specialBtn.className = 'special-btn';
        specialBtn.textContent = `★ 必殺技（${Math.floor(state.comboGauge)}%）`;
      }
    }

    function startTimer(): void {
      let remaining = state.timeLimit;
      state.timerStartedAt = Date.now();
      updateTimerBar(timerBar, remaining, state.timeLimit);

      timerInterval = setInterval(() => {
        remaining = state.timeLimit - (Date.now() - state.timerStartedAt) / 1000;
        if (remaining <= 0) {
          remaining = 0;
          if (timerInterval) clearInterval(timerInterval);
          handleTimeout();
        }
        updateTimerBar(timerBar, remaining, state.timeLimit);
      }, 100);
    }

    function handleTimeout(): void {
      if (answerLocked) return;
      answerLocked = true;
      playWrong();

      const timeElapsed = state.timeLimit;
      const result = processTurnAnswer(state, false, timeElapsed, 0);
      state = result.state;

      updateHPBar(playerHPBar, state.playerCurrentHP, state.playerMaxHP);
      updateComboGauge(comboGauge, state.combo, state.comboGauge);
      updateSpecialBtn();
      logArea.textContent = '時間切れ！';

      showDamageNumber(screen, Math.floor(state.playerMaxHP * 0.125), 'enemy');

      setTimeout(() => {
        const endResult = checkBattleEnd(state);
        if (endResult) {
          endBattle(endResult);
        } else {
          answerLocked = false;
          nextTurn();
        }
      }, 1000);
    }

    async function handleAnswer(selectedIndex: number): Promise<void> {
      if (answerLocked || !state.currentQuestion) return;
      answerLocked = true;
      if (timerInterval) clearInterval(timerInterval);

      const timeElapsed = (Date.now() - state.timerStartedAt) / 1000;
      const correct = selectedIndex === state.currentQuestion.correctCardIndex;

      // カード状態を更新
      const cards = handArea.querySelectorAll('.skill-card');
      cards.forEach((card, i) => {
        if (i === state.currentQuestion!.correctCardIndex) {
          setCardState(card as HTMLElement, 'correct');
        } else if (i === selectedIndex && !correct) {
          setCardState(card as HTMLElement, 'wrong');
        } else {
          setCardState(card as HTMLElement, 'disabled');
        }
      });

      if (correct) {
        playCorrect();
        await waitMs(200);
        playHit();
      } else {
        playWrong();
      }

      const result = processTurnAnswer(state, correct, timeElapsed, selectedIndex);
      state = result.state;

      updateHPBar(enemyHPBar, state.enemyCurrentHP, state.enemy.maxHP);
      updateHPBar(playerHPBar, state.playerCurrentHP, state.playerMaxHP);
      updateComboGauge(comboGauge, state.combo, state.comboGauge);
      updateSpecialBtn();

      if (correct) {
        shakeEnemy(enemySprite);
        showDamageNumber(screen, result.turnResult.damage, 'player', result.turnResult.speedBonus > 1.2);
        const { label } = { label: result.turnResult.speedBonus >= 1.3 ? '疾風！' : '' };
        showSpeedLabel(screen, label);
        if (state.combo > 1) playCombo(state.combo);
        logArea.textContent = `${result.turnResult.damage}ダメージ！ Combo x${state.combo}`;
      } else {
        showDamageNumber(screen, Math.floor(state.playerMaxHP * 0.125), 'enemy');
        logArea.textContent = '不正解... 反撃を受けた！';
        await animateElement(screen, 'shake', 400);
      }

      await waitMs(1200);

      const endResult = checkBattleEnd(state);
      if (endResult) {
        endBattle(endResult);
      } else if (state.turn >= state.maxTurns) {
        endBattle(state.enemyCurrentHP <= 0 ? 'victory' : 'defeat');
      } else {
        answerLocked = false;
        nextTurn();
      }
    }

    function nextTurn(): void {
      const chapter = stage?.chapterId ?? 1;
      const isBoss = enemy.isBoss;
      const qType = selectQuestionType(chapter, isBoss);
      const question = generateQuestion(chapter, state.hand, qType);

      if (!question) {
        logArea.textContent = '問題生成エラー';
        return;
      }

      state.currentQuestion = question;
      state.phase = 'question';

      // 問題表示更新
      questionTypeLabel.textContent = question.typeLabel;
      questionText.textContent = question.displayText;

      // 手札更新
      clearElement(handArea);
      const numChoices = enemy.gimmick?.type === 'extraChoices' ? enemy.gimmick.value : 5;
      const choices = question.choices.slice(0, numChoices);
      choices.forEach((card, i) => {
        const cardView = createSkillCardView(card, i, handleAnswer);
        handArea.appendChild(cardView);
      });

      startTimer();
    }

    function endBattle(result: 'victory' | 'defeat'): void {
      if (timerInterval) clearInterval(timerInterval);
      state.phase = result;

      if (result === 'victory') {
        playVictory();
      } else {
        playDefeat();
      }

      const battleResult = createBattleResult(state, stageId);

      setTimeout(() => {
        renderResultScreen(battleResult, state.turnResults);
      }, 1500);
    }

    // バトル開始
    setTimeout(() => {
      logArea.textContent = `${enemy.name} が現れた！`;
      setTimeout(() => nextTurn(), 1000);
    }, 500);

    return screen;
  });
}
