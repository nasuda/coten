import { describe, it, expect } from 'vitest';
import { createBattleState, processTurnAnswer, processSpecialAttack, checkBattleEnd } from '../models/BattleEngine.ts';
import { allEnemies } from '../data/enemies.ts';
import type { SkillCard } from '../models/types.ts';

function makeTestCards(): SkillCard[] {
  return [
    { id: 'c1', jodoushiId: 'zu', name: 'ず', rarity: 'N', element: 'dark', level: 1, power: 12 },
    { id: 'c2', jodoushiId: 'ki', name: 'き', rarity: 'N', element: 'earth', level: 1, power: 12 },
    { id: 'c3', jodoushiId: 'keri', name: 'けり', rarity: 'N', element: 'earth', level: 1, power: 12 },
    { id: 'c4', jodoushiId: 'mu', name: 'む', rarity: 'N', element: 'wind', level: 1, power: 14 },
    { id: 'c5', jodoushiId: 'ru', name: 'る', rarity: 'R', element: 'water', level: 1, power: 15 },
  ];
}

describe('BattleEngine', () => {
  describe('createBattleState', () => {
    it('バトル状態が正しく初期化される', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      expect(state.enemy.id).toBe(enemy.id);
      expect(state.enemyCurrentHP).toBe(enemy.maxHP);
      expect(state.playerCurrentHP).toBe(110);
      expect(state.playerMaxHP).toBe(110);
      expect(state.turn).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.comboGauge).toBe(0);
      expect(state.specialReady).toBe(false);
      expect(state.hand).toHaveLength(5);
      expect(state.phase).toBe('intro');
    });
  });

  describe('processTurnAnswer', () => {
    it('正解時に敵にダメージが入る', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      const result = processTurnAnswer(state, true, 2.0, 0);
      expect(result.state.enemyCurrentHP).toBeLessThan(enemy.maxHP);
      expect(result.turnResult.correct).toBe(true);
      expect(result.turnResult.damage).toBeGreaterThan(0);
    });

    it('不正解時にプレイヤーがダメージを受ける', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      const result = processTurnAnswer(state, false, 5.0, 0);
      expect(result.state.playerCurrentHP).toBeLessThan(110);
      expect(result.turnResult.correct).toBe(false);
    });

    it('正解時にコンボが増加する', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      const result = processTurnAnswer(state, true, 2.0, 0);
      expect(result.state.combo).toBe(1);
    });

    it('不正解時にコンボがリセットされる', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      let state = createBattleState(enemy, cards, 1, 110, 2);
      // 2回正解してコンボを積む
      let r = processTurnAnswer(state, true, 2.0, 0);
      state = r.state;
      r = processTurnAnswer(state, true, 2.0, 1);
      state = r.state;
      expect(state.combo).toBe(2);
      // 不正解でリセット
      r = processTurnAnswer(state, false, 5.0, 2);
      expect(r.state.combo).toBe(0);
    });

    it('正解でコンボゲージが上昇する', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      const result = processTurnAnswer(state, true, 2.0, 0);
      expect(result.state.comboGauge).toBeGreaterThan(0);
    });

    it('ゲージ100%で必殺技準備完了', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      let state = createBattleState(enemy, cards, 1, 110, 2);
      // 5回連続正解でゲージ100%
      for (let i = 0; i < 5; i++) {
        const r = processTurnAnswer(state, true, 2.0, i);
        state = r.state;
      }
      expect(state.comboGauge).toBeGreaterThanOrEqual(100);
      expect(state.specialReady).toBe(true);
    });
  });

  describe('processSpecialAttack', () => {
    it('必殺技で大ダメージを与える', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      let state = createBattleState(enemy, cards, 1, 110, 2);
      // ゲージを100にする
      state.comboGauge = 100;
      state.specialReady = true;
      const result = processSpecialAttack(state, 0);
      expect(result.enemyCurrentHP).toBeLessThan(state.enemyCurrentHP);
      expect(result.comboGauge).toBe(0);
      expect(result.specialReady).toBe(false);
    });
  });

  describe('checkBattleEnd', () => {
    it('敵HP0で勝利', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      state.enemyCurrentHP = 0;
      expect(checkBattleEnd(state)).toBe('victory');
    });

    it('プレイヤーHP0で敗北', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      state.playerCurrentHP = 0;
      expect(checkBattleEnd(state)).toBe('defeat');
    });

    it('両方生存中はnull', () => {
      const enemy = allEnemies[0]!;
      const cards = makeTestCards();
      const state = createBattleState(enemy, cards, 1, 110, 2);
      expect(checkBattleEnd(state)).toBeNull();
    });
  });
});
