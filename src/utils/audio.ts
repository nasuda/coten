// ============================================================
// Web Audio API 効果音生成（RPG用）
// ============================================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function initAudio(): void {
  getCtx();
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  rampDown = true,
): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// UI タップ音
export function playTap(): void {
  playTone(600, 0.05, 'sine', 0.1);
}

// 正解音（上昇音）
export function playCorrect(): void {
  playTone(523, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 80);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160);
}

// 不正解音（下降ブザー）
export function playWrong(): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}

// ダメージ音（ヒット）
export function playHit(): void {
  playTone(200, 0.08, 'square', 0.2);
  setTimeout(() => playTone(150, 0.06, 'square', 0.15), 40);
}

// コンボ音（コンボ数に応じて音階上昇）
export function playCombo(combo: number): void {
  const baseFreq = 400 + combo * 80;
  playTone(baseFreq, 0.12, 'triangle', 0.2);
}

// 必殺技発動音
export function playSpecial(): void {
  const ctx = getCtx();
  const notes = [392, 523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }, i * 80);
  });
}

// 勝利ファンファーレ
export function playVictory(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 120);
  });
  setTimeout(() => {
    playTone(1047, 0.6, 'sine', 0.15);
    playTone(784, 0.6, 'sine', 0.1);
  }, 500);
}

// 敗北音
export function playDefeat(): void {
  const notes = [392, 349, 311, 262];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 'sine', 0.15), i * 200);
  });
}

// ガチャ演出音
export function playGacha(): void {
  playTone(300, 0.15, 'triangle', 0.15);
  setTimeout(() => playTone(500, 0.15, 'triangle', 0.15), 150);
  setTimeout(() => playTone(800, 0.3, 'sine', 0.2), 300);
}

// SSR演出音
export function playSSR(): void {
  setTimeout(() => {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.25), i * 100);
    });
  }, 200);
}

// レベルアップ音
export function playLevelUp(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'triangle', 0.2), i * 100);
  });
}
