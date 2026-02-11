// ============================================================
// TCG バトルエンジン（純粋関数）
// ============================================================

import type {
  TCGBattleState,
  TCGPlayerState,
  TCGCard,
  TCGFieldSlot,
  TCGVerbInPlay,
  TCGVerbCardDef,
  TCGJodoushiCard,
  ConnectionQuizResult,
  TCGBattleResult,
  TCGDeckConfig,
} from './tcg-types.ts';
import {
  TCG_FIELD_SLOTS,
  TCG_MAX_ROUNDS,
  TCG_ACTION_TIME_LIMIT,
  TCG_INITIAL_DRAW,
} from './tcg-types.ts';
import { checkConnection, validateAnswer } from './ConnectionValidator.ts';
import { calculateTCGDamage } from './TCGDamageCalc.ts';
import { getVerbById } from '../data/verbs.ts';
import { getTCGJodoushiById } from '../data/tcg-cards.ts';
import { shuffle } from '../../utils/shuffle.ts';

// --- 初期状態生成 ---
export function createPlayerState(
  name: string,
  deckConfig: TCGDeckConfig,
): TCGPlayerState {
  const cards: TCGCard[] = [];

  for (const vId of deckConfig.verbs) {
    const v = getVerbById(vId);
    if (v) cards.push({ type: 'verb', card: v });
  }
  for (const jId of deckConfig.jodoushi) {
    const j = getTCGJodoushiById(jId);
    if (j) cards.push({ type: 'jodoushi', card: j });
  }

  const shuffled = shuffle([...cards]);
  const hand = shuffled.slice(0, TCG_INITIAL_DRAW);
  const deck = shuffled.slice(TCG_INITIAL_DRAW);

  return {
    name,
    field: Array(TCG_FIELD_SLOTS).fill(null) as TCGFieldSlot[],
    hand,
    deck,
    discard: [],
  };
}

export function createBattleState(
  playerDeck: TCGDeckConfig,
  opponentDeck: TCGDeckConfig,
  opponentName: string,
): TCGBattleState {
  return {
    player: createPlayerState('プレイヤー', playerDeck),
    opponent: createPlayerState(opponentName, opponentDeck),
    currentRound: 0,
    maxRounds: TCG_MAX_ROUNDS,
    phase: 'setup',
    actionTimeLimit: TCG_ACTION_TIME_LIMIT,
    connectionHistory: [],
    log: [],
    winner: null,
  };
}

// --- ドローフェーズ ---
export function drawPhase(state: TCGBattleState): TCGBattleState {
  const newState = {
    ...state,
    currentRound: state.currentRound + 1,
    phase: 'player_action' as const,
    player: drawCard(state.player),
    opponent: drawCard(state.opponent),
    log: [...state.log, `--- ラウンド ${state.currentRound + 1} ---`],
  };
  return newState;
}

function drawCard(ps: TCGPlayerState): TCGPlayerState {
  if (ps.deck.length === 0) return ps;
  const [drawn, ...remaining] = ps.deck;
  return {
    ...ps,
    hand: [...ps.hand, drawn!],
    deck: remaining,
  };
}

// --- 配置: 動詞カードを手札からフィールドに ---
export function placeVerb(
  state: TCGBattleState,
  who: 'player' | 'opponent',
  handIndex: number,
  slotIndex: number,
): TCGBattleState {
  const ps = state[who];
  const card = ps.hand[handIndex];

  if (!card || card.type !== 'verb') return state;
  if (slotIndex < 0 || slotIndex >= TCG_FIELD_SLOTS) return state;
  if (ps.field[slotIndex] !== null) return state;

  const verbInPlay: TCGVerbInPlay = {
    card: card.card as TCGVerbCardDef,
    currentHP: (card.card as TCGVerbCardDef).maxHP,
    equippedJodoushi: null,
    hasAttacked: false,
  };

  const newHand = ps.hand.filter((_, i) => i !== handIndex);
  const newField = [...ps.field];
  newField[slotIndex] = verbInPlay;

  const newPs: TCGPlayerState = { ...ps, hand: newHand, field: newField };
  const logMsg = `${ps.name}: 「${verbInPlay.card.name}」をスロット${slotIndex + 1}に配置`;

  return {
    ...state,
    [who]: newPs,
    log: [...state.log, logMsg],
  };
}

// --- 装備: 助動詞カードを動詞に装備（接続クイズ） ---
export function equipJodoushi(
  state: TCGBattleState,
  who: 'player' | 'opponent',
  handIndex: number,
  slotIndex: number,
  selectedForm: string,
): TCGBattleState {
  const ps = state[who];
  const card = ps.hand[handIndex];

  if (!card || card.type !== 'jodoushi') return state;
  const jodoushi = card.card as TCGJodoushiCard;
  const slot = ps.field[slotIndex];
  if (!slot) return state;
  if (slot.equippedJodoushi !== null) return state;

  const connection = checkConnection(jodoushi, slot.card);
  if (!connection.canConnect) return state;

  const answer = validateAnswer(jodoushi, slot.card, selectedForm);

  const quizResult: ConnectionQuizResult = {
    jodoushiId: jodoushi.jodoushiId,
    verbId: slot.card.id,
    selectedForm,
    correctForm: answer.correctForm ?? '',
    isCorrect: answer.correct,
    who,
  };

  if (answer.correct) {
    const newField = [...ps.field];
    newField[slotIndex] = { ...slot, equippedJodoushi: jodoushi };
    const newHand = ps.hand.filter((_, i) => i !== handIndex);
    const newPs: TCGPlayerState = { ...ps, hand: newHand, field: newField };
    const logMsg = `${ps.name}: 「${jodoushi.name}」を「${slot.card.name}」に装備（${selectedForm} = ${connection.requiredFormName} 正解!）`;

    return {
      ...state,
      [who]: newPs,
      connectionHistory: [...state.connectionHistory, quizResult],
      log: [...state.log, logMsg],
    };
  } else {
    // 不正解: カードは手札に残り、ターン消費
    const logMsg = `${ps.name}: 「${jodoushi.name}」→「${slot.card.name}」 接続失敗（${selectedForm} は不正解、正解は ${answer.correctForm}）`;
    return {
      ...state,
      connectionHistory: [...state.connectionHistory, quizResult],
      log: [...state.log, logMsg],
    };
  }
}

// --- 攻撃 ---
export function attack(
  state: TCGBattleState,
  who: 'player' | 'opponent',
  attackerSlot: number,
  targetSlot: number,
): TCGBattleState {
  const attacker = state[who];
  const defender = who === 'player' ? state.opponent : state.player;
  const defenderKey = who === 'player' ? 'opponent' : 'player';

  const attackSlot = attacker.field[attackerSlot];
  const defSlot = defender.field[targetSlot];

  if (!attackSlot || !defSlot) return state;
  if (!attackSlot.equippedJodoushi) return state;
  if (attackSlot.hasAttacked) return state;

  const consecutiveCorrect = countConsecutiveCorrect(state.connectionHistory, who);

  const dmgResult = calculateTCGDamage({
    jodoushiPower: attackSlot.equippedJodoushi.power,
    verbAttack: attackSlot.card.attack,
    jodoushiElement: attackSlot.equippedJodoushi.element,
    targetElement: defSlot.card.element,
    consecutiveCorrect,
  });

  const newTargetHP = Math.max(0, defSlot.currentHP - dmgResult.damage);
  const newDefField = [...defender.field];
  newDefField[targetSlot] = { ...defSlot, currentHP: newTargetHP };

  // 攻撃後、助動詞はdiscardへ、attackedフラグon
  const newAtkField = [...attacker.field];
  newAtkField[attackerSlot] = {
    ...attackSlot,
    equippedJodoushi: null,
    hasAttacked: true,
  };

  const newAttacker: TCGPlayerState = {
    ...attacker,
    field: newAtkField,
    discard: [...attacker.discard, { type: 'jodoushi', card: attackSlot.equippedJodoushi }],
  };
  const newDefender: TCGPlayerState = { ...defender, field: newDefField };

  let logMsg = `${attacker.name}: 「${attackSlot.card.name}+${attackSlot.equippedJodoushi.name}」で攻撃 → ${dmgResult.damage}ダメージ`;
  if (dmgResult.isAdvantage) logMsg += '（属性有利!）';
  if (dmgResult.isDisadvantage) logMsg += '（属性不利...）';
  if (newTargetHP === 0) logMsg += ` 「${defSlot.card.name}」撃破!`;

  return {
    ...state,
    [who]: newAttacker,
    [defenderKey]: newDefender,
    log: [...state.log, logMsg],
  };
}

function countConsecutiveCorrect(history: ConnectionQuizResult[], who: 'player' | 'opponent'): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i]!;
    if (entry.who !== who) continue;
    if (entry.isCorrect) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// --- ラウンド解決（HP0カード除去、勝敗判定） ---
export function resolvePhase(state: TCGBattleState): TCGBattleState {
  const newPlayer = resetAttackFlags(state.player);
  const newOpponent = resetAttackFlags(state.opponent);

  // フィールドの生存動詞 + 手札/デッキの未配置動詞を含む全生存チェック
  const playerAlive = countAliveVerbs(newPlayer);
  const opponentAlive = countAliveVerbs(newOpponent);

  let winner = state.winner;
  let phase = state.phase;

  if (opponentAlive === 0 && playerAlive === 0) {
    winner = null;
    phase = 'draw_game';
  } else if (opponentAlive === 0) {
    winner = 'player';
    phase = 'victory';
  } else if (playerAlive === 0) {
    winner = 'opponent';
    phase = 'defeat';
  } else if (state.currentRound >= state.maxRounds) {
    // 最終ラウンド: HP合計で判定
    const playerHP = totalHP(newPlayer);
    const opponentHP = totalHP(newOpponent);
    if (playerHP >= opponentHP) {
      winner = 'player';
      phase = 'victory';
    } else {
      winner = 'opponent';
      phase = 'defeat';
    }
  } else {
    phase = 'draw'; // next round
  }

  return {
    ...state,
    player: newPlayer,
    opponent: newOpponent,
    phase,
    winner,
  };
}

function resetAttackFlags(ps: TCGPlayerState): TCGPlayerState {
  return {
    ...ps,
    field: ps.field.map(slot => {
      if (!slot) return null;
      if (slot.currentHP <= 0) return null; // remove dead
      return { ...slot, hasAttacked: false };
    }),
  };
}

export function countAliveVerbs(ps: TCGPlayerState): number {
  return countFieldAlive(ps) +
    ps.hand.filter(c => c.type === 'verb').length +
    ps.deck.filter(c => c.type === 'verb').length;
}

export function countFieldAlive(ps: TCGPlayerState): number {
  return ps.field.filter(s => s !== null && s.currentHP > 0).length;
}

function totalHP(ps: TCGPlayerState): number {
  return ps.field.reduce((sum, s) => sum + (s ? s.currentHP : 0), 0);
}

// --- 勝敗チェック ---
export function checkWinner(state: TCGBattleState): 'player' | 'opponent' | null {
  return state.winner;
}

// --- バトル結果生成 ---
export function createBattleResult(state: TCGBattleState, opponentId: string): TCGBattleResult {
  const playerHistory = state.connectionHistory.filter(h => h.who === 'player');
  const playerCorrect = playerHistory.filter(h => h.isCorrect).length;
  const total = playerHistory.length;

  return {
    victory: state.winner === 'player',
    isDraw: state.phase === 'draw_game',
    opponentId,
    rounds: state.currentRound,
    connectionCorrect: playerCorrect,
    connectionTotal: total,
    connectionAccuracy: total > 0 ? Math.round((playerCorrect / total) * 100) : 0,
    playerVerbsAlive: countFieldAlive(state.player),
    opponentVerbsAlive: countFieldAlive(state.opponent),
  };
}

// --- ユーティリティ ---
export function getPlayableVerbIndices(ps: TCGPlayerState): number[] {
  return ps.hand
    .map((c, i) => (c.type === 'verb' ? i : -1))
    .filter(i => i !== -1);
}

export function getEquippableJodoushiIndices(ps: TCGPlayerState): number[] {
  return ps.hand
    .map((c, i) => (c.type === 'jodoushi' ? i : -1))
    .filter(i => i !== -1);
}

export function getEmptySlotIndices(ps: TCGPlayerState): number[] {
  return ps.field
    .map((s, i) => (s === null ? i : -1))
    .filter(i => i !== -1);
}

export function getOccupiedSlotIndices(ps: TCGPlayerState): number[] {
  return ps.field
    .map((s, i) => (s !== null && s.currentHP > 0 ? i : -1))
    .filter(i => i !== -1);
}

export function getEquippedSlotIndices(ps: TCGPlayerState): number[] {
  return ps.field
    .map((s, i) => (s !== null && s.equippedJodoushi !== null && !s.hasAttacked ? i : -1))
    .filter(i => i !== -1);
}

export function canEquipTo(
  jodoushi: TCGJodoushiCard,
  ps: TCGPlayerState,
): number[] {
  return ps.field
    .map((s, i) => {
      if (!s || s.equippedJodoushi !== null) return -1;
      const conn = checkConnection(jodoushi, s.card);
      return conn.canConnect ? i : -1;
    })
    .filter(i => i !== -1);
}
