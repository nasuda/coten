// ============================================================
// 動詞カードデータ 20個
// ============================================================

import type { TCGVerbCardDef } from '../models/tcg-types.ts';

export const allVerbs: TCGVerbCardDef[] = [
  // === 四段活用 (8個) ===
  {
    id: 'v_kaku', name: '書く', verbType: 'yodan',
    conjugation: { mizenkei: '書か', renyoukei: '書き', shuushikei: '書く', rentaikei: '書く', izenkei: '書け', meireikei: '書け' },
    maxHP: 28, attack: 8, element: 'earth', emoji: '📝',
  },
  {
    id: 'v_yomu', name: '読む', verbType: 'yodan',
    conjugation: { mizenkei: '読ま', renyoukei: '読み', shuushikei: '読む', rentaikei: '読む', izenkei: '読め', meireikei: '読め' },
    maxHP: 26, attack: 9, element: 'wind', emoji: '📖',
  },
  {
    id: 'v_yuku', name: '行く', verbType: 'yodan',
    conjugation: { mizenkei: '行か', renyoukei: '行き', shuushikei: '行く', rentaikei: '行く', izenkei: '行け', meireikei: '行け' },
    maxHP: 30, attack: 7, element: 'wind', emoji: '🚶',
  },
  {
    id: 'v_kiku', name: '聞く', verbType: 'yodan',
    conjugation: { mizenkei: '聞か', renyoukei: '聞き', shuushikei: '聞く', rentaikei: '聞く', izenkei: '聞け', meireikei: '聞け' },
    maxHP: 25, attack: 8, element: 'water', emoji: '👂',
  },
  {
    id: 'v_omofu', name: '思ふ', verbType: 'yodan',
    conjugation: { mizenkei: '思は', renyoukei: '思ひ', shuushikei: '思ふ', rentaikei: '思ふ', izenkei: '思へ', meireikei: '思へ' },
    maxHP: 24, attack: 10, element: 'light', emoji: '💭',
  },
  {
    id: 'v_ifu', name: '言ふ', verbType: 'yodan',
    conjugation: { mizenkei: '言は', renyoukei: '言ひ', shuushikei: '言ふ', rentaikei: '言ふ', izenkei: '言へ', meireikei: '言へ' },
    maxHP: 26, attack: 9, element: 'fire', emoji: '🗣️',
  },
  {
    id: 'v_tatsu', name: '立つ', verbType: 'yodan',
    conjugation: { mizenkei: '立た', renyoukei: '立ち', shuushikei: '立つ', rentaikei: '立つ', izenkei: '立て', meireikei: '立て' },
    maxHP: 32, attack: 7, element: 'earth', emoji: '🧍',
  },
  {
    id: 'v_saku', name: '咲く', verbType: 'yodan',
    conjugation: { mizenkei: '咲か', renyoukei: '咲き', shuushikei: '咲く', rentaikei: '咲く', izenkei: '咲け', meireikei: '咲け' },
    maxHP: 22, attack: 11, element: 'fire', emoji: '🌸',
  },

  // === 上二段活用 (3個) ===
  {
    id: 'v_oku', name: '起く', verbType: 'kami_nidan',
    conjugation: { mizenkei: '起き', renyoukei: '起き', shuushikei: '起く', rentaikei: '起くる', izenkei: '起くれ', meireikei: '起きよ' },
    maxHP: 24, attack: 9, element: 'light', emoji: '🌅',
  },
  {
    id: 'v_otsu', name: '落つ', verbType: 'kami_nidan',
    conjugation: { mizenkei: '落ち', renyoukei: '落ち', shuushikei: '落つ', rentaikei: '落つる', izenkei: '落つれ', meireikei: '落ちよ' },
    maxHP: 26, attack: 10, element: 'dark', emoji: '🍂',
  },
  {
    id: 'v_sugu', name: '過ぐ', verbType: 'kami_nidan',
    conjugation: { mizenkei: '過ぎ', renyoukei: '過ぎ', shuushikei: '過ぐ', rentaikei: '過ぐる', izenkei: '過ぐれ', meireikei: '過ぎよ' },
    maxHP: 22, attack: 8, element: 'phantom', emoji: '⏳',
  },

  // === 下二段活用 (3個) ===
  {
    id: 'v_uku', name: '受く', verbType: 'shimo_nidan',
    conjugation: { mizenkei: '受け', renyoukei: '受け', shuushikei: '受く', rentaikei: '受くる', izenkei: '受くれ', meireikei: '受けよ' },
    maxHP: 30, attack: 6, element: 'water', emoji: '🛡️',
  },
  {
    id: 'v_sutsu', name: '捨つ', verbType: 'shimo_nidan',
    conjugation: { mizenkei: '捨て', renyoukei: '捨て', shuushikei: '捨つ', rentaikei: '捨つる', izenkei: '捨つれ', meireikei: '捨てよ' },
    maxHP: 20, attack: 12, element: 'dark', emoji: '🗑️',
  },
  {
    id: 'v_izu', name: '出づ', verbType: 'shimo_nidan',
    conjugation: { mizenkei: '出で', renyoukei: '出で', shuushikei: '出づ', rentaikei: '出づる', izenkei: '出づれ', meireikei: '出でよ' },
    maxHP: 26, attack: 9, element: 'wind', emoji: '🚪',
  },

  // === 上一段活用 (2個) ===
  {
    id: 'v_miru', name: '見る', verbType: 'kami_ichidan',
    conjugation: { mizenkei: '見', renyoukei: '見', shuushikei: '見る', rentaikei: '見る', izenkei: '見れ', meireikei: '見よ' },
    maxHP: 24, attack: 10, element: 'light', emoji: '👁️',
  },
  {
    id: 'v_kiru', name: '着る', verbType: 'kami_ichidan',
    conjugation: { mizenkei: '着', renyoukei: '着', shuushikei: '着る', rentaikei: '着る', izenkei: '着れ', meireikei: '着よ' },
    maxHP: 28, attack: 7, element: 'phantom', emoji: '👘',
  },

  // === カ行変格 (1個) ===
  {
    id: 'v_ku', name: '来', verbType: 'ka_hen',
    conjugation: { mizenkei: 'こ', renyoukei: 'き', shuushikei: 'く', rentaikei: 'くる', izenkei: 'くれ', meireikei: 'こよ' },
    maxHP: 28, attack: 9, element: 'wind', emoji: '💨',
  },

  // === サ行変格 (1個) ===
  {
    id: 'v_su', name: 'す', verbType: 'sa_hen',
    conjugation: { mizenkei: 'せ', renyoukei: 'し', shuushikei: 'す', rentaikei: 'する', izenkei: 'すれ', meireikei: 'せよ' },
    maxHP: 26, attack: 10, element: 'fire', emoji: '⚔️',
  },

  // === ナ行変格 (1個) ===
  {
    id: 'v_shinu', name: '死ぬ', verbType: 'na_hen',
    conjugation: { mizenkei: '死な', renyoukei: '死に', shuushikei: '死ぬ', rentaikei: '死ぬる', izenkei: '死ぬれ', meireikei: '死ね' },
    maxHP: 20, attack: 14, element: 'dark', emoji: '💀',
  },

  // === ラ行変格 (1個) ===
  {
    id: 'v_ari', name: 'あり', verbType: 'ra_hen',
    conjugation: { mizenkei: 'あら', renyoukei: 'あり', shuushikei: 'あり', rentaikei: 'ある', izenkei: 'あれ', meireikei: 'あれ' },
    maxHP: 34, attack: 6, element: 'earth', emoji: '🏛️',
  },
];

export function getVerbById(id: string): TCGVerbCardDef | undefined {
  return allVerbs.find(v => v.id === id);
}

export function getVerbsByType(type: string): TCGVerbCardDef[] {
  return allVerbs.filter(v => v.verbType === type);
}
