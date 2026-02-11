// ============================================================
// AI対戦相手データ 6体
// ============================================================

import type { TCGOpponent } from '../models/tcg-types.ts';

export const allOpponents: TCGOpponent[] = [
  {
    id: 'opp_1',
    name: '見習い文法士',
    emoji: '📚',
    difficulty: 'beginner',
    description: '基本の四段活用を使う初心者。未然形接続が中心。',
    deckVerbs: ['v_kaku', 'v_yomu', 'v_yuku'],
    deckJodoushi: ['zu', 'ki', 'keri', 'mu', 'ru'],
  },
  {
    id: 'opp_2',
    name: '古文道場の門番',
    emoji: '🏯',
    difficulty: 'beginner',
    description: '連用形接続を好む守りの使い手。',
    deckVerbs: ['v_tatsu', 'v_kiku', 'v_ari'],
    deckJodoushi: ['ki', 'keri', 'tsu', 'nu', 'tari_kanryou'],
  },
  {
    id: 'opp_3',
    name: '放浪の歌人',
    emoji: '🎋',
    difficulty: 'intermediate',
    description: '推量・意志の助動詞を自在に操る。下二段活用も使う。',
    deckVerbs: ['v_uku', 'v_omofu', 'v_miru'],
    deckJodoushi: ['mu', 'beshi', 'ramu', 'raru', 'sasu'],
  },
  {
    id: 'opp_4',
    name: '闇の文法師',
    emoji: '🌑',
    difficulty: 'intermediate',
    description: '打消・打消推量を駆使して相手を封じる。',
    deckVerbs: ['v_otsu', 'v_sutsu', 'v_shinu'],
    deckJodoushi: ['zu', 'ji', 'maji', 'mahoshi', 'tashi'],
  },
  {
    id: 'opp_5',
    name: '宮中の言語官',
    emoji: '👑',
    difficulty: 'expert',
    description: '断定・伝聞・特殊接続を使いこなすエリート。',
    deckVerbs: ['v_su', 'v_ku', 'v_saku'],
    deckJodoushi: ['nari_dantei', 'tari_dantei', 'nari_denbun', 'ri', 'gotoshi'],
  },
  {
    id: 'opp_6',
    name: '言霊の帝',
    emoji: '🐉',
    difficulty: 'expert',
    description: '全活用型を操り、SSR助動詞を携える最強の敵。',
    deckVerbs: ['v_ifu', 'v_miru', 'v_ari'],
    deckJodoushi: ['muzu', 'maji', 'tari_dantei', 'gotoshi', 'ri'],
  },
];

export function getOpponentById(id: string): TCGOpponent | undefined {
  return allOpponents.find(o => o.id === id);
}
