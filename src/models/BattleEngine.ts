// ============================================================
// バトルロジック本体
// ============================================================

import type { BattleState, Enemy, SkillCard, TurnResult, BattleResult, StarRating } from './types.ts';
import { COMBO_GAUGE_PER_CORRECT, COMBO_GAUGE_PENALTY, ENEMY_COUNTER_RATIO, CHAPTER_TIME_LIMITS, CHAPTER_COUNTER_RATIOS } from './types.ts';
import { calculateDamage, calculateSpeedBonus, calculateElementBonus, calculateComboMultiplier, calculateCounterDamage } from './DamageCalculator.ts';
import { calculateStarRating } from './ProgressManager.ts';
import { getCardPower } from '../data/cards.ts';

export function createBattleState(
  enemy: Enemy,
  hand: SkillCard[],
  chapter: number,
  playerMaxHP: number,
  playerAttack: number,
): BattleState {
  const maxTurns = enemy.isBoss ? 6 : 4 + Math.floor(Math.random() * 2);
  const baseTimeLimit = CHAPTER_TIME_LIMITS[chapter] ?? 10;
  const timeLimit = enemy.gimmick?.type === 'timeAccel' ? enemy.gimmick.value : baseTimeLimit;

  return {
    enemy,
    enemyCurrentHP: enemy.maxHP,
    playerCurrentHP: playerMaxHP,
    playerMaxHP,
    playerAttack,
    turn: 0,
    maxTurns,
    combo: 0,
    comboGauge: 0,
    specialReady: false,
    hand,
    currentQuestion: null,
    timerStartedAt: 0,
    timeLimit,
    phase: 'intro',
    log: [],
    turnResults: [],
    chapter,
  };
}

export function processTurnAnswer(
  state: BattleState,
  correct: boolean,
  timeElapsed: number,
  cardIndex: number,
): { state: BattleState; turnResult: TurnResult } {
  const newState = { ...state };
  newState.turn = state.turn + 1;

  // 選択肢から実際のカードを取得（手札フォールバックはテスト用）
  // cardIndex < 0 はタイムアウト（未選択）を示す
  const isTimeout = cardIndex < 0;
  const choiceCard = isTimeout ? undefined : state.currentQuestion?.choices[cardIndex];
  const card = (choiceCard && state.hand.find(h => h.jodoushiId === choiceCard.jodoushiId))
    ?? choiceCard
    ?? state.hand[Math.max(0, cardIndex)]
    ?? state.hand[0]!;
  const speedResult = calculateSpeedBonus(timeElapsed);

  let damage = 0;
  let combo = state.combo;
  let comboGauge = state.comboGauge;

  if (correct) {
    combo++;
    comboGauge = Math.min(100, comboGauge + COMBO_GAUGE_PER_CORRECT);

    const comboMult = calculateComboMultiplier(combo);
    const elemBonus = calculateElementBonus(card.element, state.enemy.element);
    const isCritical = Math.random() < 0.1;

    damage = calculateDamage({
      basePower: getCardPower(card),
      playerAttack: state.playerAttack,
      enemyDefense: state.enemy.defense,
      comboMultiplier: comboMult,
      speedBonus: speedResult.multiplier,
      elementBonus: elemBonus,
      isCritical,
      isSpecial: false,
    });

    // バリアギミック
    if (state.enemy.gimmick?.type === 'barrier' && state.turn === 0) {
      damage = Math.floor(damage * state.enemy.gimmick.value);
    }

    newState.enemyCurrentHP = Math.max(0, state.enemyCurrentHP - damage);
    newState.log = [...state.log, `${card.name}で${damage}ダメージ！${speedResult.label}`];
  } else {
    combo = 0;
    comboGauge = Math.floor(comboGauge * COMBO_GAUGE_PENALTY);

    const counterRatio = CHAPTER_COUNTER_RATIOS[state.chapter] ?? ENEMY_COUNTER_RATIO;
    const counterDamage = calculateCounterDamage(state.playerMaxHP, counterRatio);
    const actualCounter = state.enemy.gimmick?.type === 'reflect'
      ? Math.floor(counterDamage * state.enemy.gimmick.value)
      : counterDamage;

    newState.playerCurrentHP = Math.max(0, state.playerCurrentHP - actualCounter);
    newState.log = [...state.log, `不正解！${actualCounter}ダメージを受けた`];
    damage = 0;
  }

  newState.combo = combo;
  newState.comboGauge = comboGauge;
  newState.specialReady = comboGauge >= 100;

  // ボスHP回復ギミック
  if (correct && state.enemy.gimmick?.type === 'heal' && newState.turn % 3 === 0) {
    const healAmount = Math.floor(state.enemy.maxHP * state.enemy.gimmick.value);
    newState.enemyCurrentHP = Math.min(state.enemy.maxHP, newState.enemyCurrentHP + healAmount);
    newState.log = [...newState.log, `${state.enemy.name}がHP${healAmount}回復！`];
  }

  // 復習用データ
  const question = state.currentQuestion;
  const correctChoice = question ? question.choices[question.correctCardIndex] : undefined;

  const turnResult: TurnResult = {
    turn: newState.turn,
    correct,
    damage,
    speedBonus: speedResult.multiplier,
    comboMultiplier: calculateComboMultiplier(combo),
    elementBonus: calculateElementBonus(card.element, state.enemy.element),
    questionType: state.currentQuestion?.type ?? 'connection',
    askedJodoushiId: correctChoice?.jodoushiId ?? card.jodoushiId,
    selectedJodoushiId: isTimeout ? '' : (choiceCard?.jodoushiId ?? card.jodoushiId),
    timeElapsed,
    correctJodoushiName: correctChoice?.name,
    selectedJodoushiName: isTimeout ? undefined : (choiceCard?.name ?? card.name),
    questionText: question?.displayText,
    explanation: question?.template.hint ?? question?.template.targetMeaning ?? question?.template.targetAnswer,
  };

  newState.turnResults = [...state.turnResults, turnResult];

  return { state: newState, turnResult };
}

export function processSpecialAttack(
  state: BattleState,
  cardIndex: number,
): BattleState {
  const newState = { ...state };
  const card = state.hand[cardIndex] ?? state.hand[0]!;

  const elemBonus = calculateElementBonus(card.element, state.enemy.element);

  const damage = calculateDamage({
    basePower: getCardPower(card),
    playerAttack: state.playerAttack,
    enemyDefense: state.enemy.defense,
    comboMultiplier: calculateComboMultiplier(state.combo),
    speedBonus: 1.0,
    elementBonus: elemBonus,
    isCritical: false,
    isSpecial: true,
  });

  newState.enemyCurrentHP = Math.max(0, state.enemyCurrentHP - damage);
  newState.comboGauge = 0;
  newState.specialReady = false;
  newState.log = [...state.log, `必殺技発動！${damage}ダメージ！`];

  return newState;
}

export function checkBattleEnd(state: BattleState): 'victory' | 'defeat' | null {
  if (state.enemyCurrentHP <= 0) return 'victory';
  if (state.playerCurrentHP <= 0) return 'defeat';
  return null;
}

export function createBattleResult(state: BattleState, stageId: string): BattleResult {
  const correctCount = state.turnResults.filter(r => r.correct).length;
  const totalQuestions = state.turnResults.length;
  const accuracyRate = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const victory = state.enemyCurrentHP <= 0;
  const starRating: StarRating = victory ? calculateStarRating(accuracyRate) : 0;
  const comboMax = state.turnResults.reduce((max, _r, i) => {
    let streak = 0;
    for (let j = i; j < state.turnResults.length; j++) {
      if (state.turnResults[j]!.correct) streak++;
      else break;
    }
    return Math.max(max, streak);
  }, 0);

  return {
    victory,
    stageId,
    enemyId: state.enemy.id,
    turns: state.turn,
    correctCount,
    totalQuestions,
    accuracyRate,
    starRating,
    expGained: victory ? state.enemy.dropExp : Math.floor(state.enemy.dropExp * 0.3),
    stonesGained: victory ? state.enemy.dropStones : 0,
    comboMax,
  };
}
