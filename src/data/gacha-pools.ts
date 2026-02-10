// ============================================================
// ガチャプール定義
// ============================================================

import type { GachaPool } from '../models/types.ts';

export const gachaPools: GachaPool[] = [
  {
    id: 'normal',
    name: '通常ガチャ',
    cost: 10,
    rates: { N: 0.50, R: 0.30, SR: 0.15, SSR: 0.05 },
    availableCards: [
      'zu', 'ki', 'keri', 'mu', 'nari_dantei',
      'ru', 'raru', 'su', 'sasu', 'tsu', 'nu', 'tari_kanryou', 'beshi',
      'shimu', 'ri', 'ramu', 'kemu', 'mashi', 'ji', 'tashi',
      'muzu', 'maji', 'mahoshi', 'tari_dantei', 'nari_denbun', 'gotoshi',
    ],
  },
  {
    id: 'premium',
    name: 'プレミアムガチャ',
    cost: 30,
    rates: { N: 0.20, R: 0.35, SR: 0.30, SSR: 0.15 },
    availableCards: [
      'ru', 'raru', 'su', 'sasu', 'tsu', 'nu', 'tari_kanryou', 'beshi',
      'shimu', 'ri', 'ramu', 'kemu', 'mashi', 'ji', 'tashi',
      'muzu', 'maji', 'mahoshi', 'tari_dantei', 'nari_denbun', 'gotoshi',
    ],
  },
];

export function getGachaPool(id: string): GachaPool | undefined {
  return gachaPools.find(p => p.id === id);
}
