// ============================================================
// 接続チェック（学習コア）
// ============================================================

import type { TCGJodoushiCard, TCGVerbCardDef, VerbType } from './tcg-types.ts';
import type { ConnectionCategory } from '../../models/types.ts';

// る/す は四段・ナ変・ラ変のみ
const YODAN_GROUP: VerbType[] = ['yodan', 'na_hen', 'ra_hen'];

// る/す 制限助動詞
const YODAN_ONLY_IDS = ['ru', 'su'];

// らる/さす は四段・ナ変・ラ変「以外」
const NON_YODAN_ONLY_IDS = ['raru', 'sasu'];

export interface ConnectionResult {
  canConnect: boolean;
  requiredForm: string | null;
  requiredFormName: string | null;
  reason: string | null;
}

export function getRequiredFormKey(
  jodoushi: TCGJodoushiCard,
  verb: TCGVerbCardDef,
): { formKey: keyof TCGVerbCardDef['conjugation']; formName: string } | null {
  const jId = jodoushi.jodoushiId;

  // り の特殊接続
  if (jId === 'ri') {
    if (verb.verbType === 'sa_hen') return { formKey: 'mizenkei', formName: '未然形' };
    if (verb.verbType === 'yodan') return { formKey: 'izenkei', formName: '已然形' };
    return null;
  }

  // る/す: 四段・ナ変・ラ変のみ
  if (YODAN_ONLY_IDS.includes(jId)) {
    if (!YODAN_GROUP.includes(verb.verbType)) return null;
  }

  // らる/さす: 四段・ナ変・ラ変以外のみ
  if (NON_YODAN_ONLY_IDS.includes(jId)) {
    if (YODAN_GROUP.includes(verb.verbType)) return null;
  }

  return categoryToFormKey(jodoushi.connectionCategory);
}

function categoryToFormKey(
  category: ConnectionCategory,
): { formKey: keyof TCGVerbCardDef['conjugation']; formName: string } | null {
  switch (category) {
    case 'mizenkei':  return { formKey: 'mizenkei', formName: '未然形' };
    case 'renyoukei': return { formKey: 'renyoukei', formName: '連用形' };
    case 'shuushikei': return { formKey: 'shuushikei', formName: '終止形' };
    case 'rentaikei': return { formKey: 'rentaikei', formName: '連体形' };
    case 'taigen':    return { formKey: 'rentaikei', formName: '連体形' };
    case 'special':   return null;
    default:          return null;
  }
}

export function checkConnection(
  jodoushi: TCGJodoushiCard,
  verb: TCGVerbCardDef,
): ConnectionResult {
  const formInfo = getRequiredFormKey(jodoushi, verb);

  if (formInfo === null) {
    let reason = `「${jodoushi.name}」は「${verb.name}」に接続できません`;
    if (YODAN_ONLY_IDS.includes(jodoushi.jodoushiId)) {
      reason = `「${jodoushi.name}」は四段・ナ変・ラ変にのみ接続します`;
    } else if (NON_YODAN_ONLY_IDS.includes(jodoushi.jodoushiId)) {
      reason = `「${jodoushi.name}」は四段・ナ変・ラ変以外に接続します`;
    } else if (jodoushi.jodoushiId === 'ri') {
      reason = `「り」はサ変未然形・四段已然形にのみ接続します`;
    }
    return { canConnect: false, requiredForm: null, requiredFormName: null, reason };
  }

  const requiredForm = verb.conjugation[formInfo.formKey];
  return {
    canConnect: true,
    requiredForm,
    requiredFormName: formInfo.formName,
    reason: null,
  };
}

export function validateAnswer(
  jodoushi: TCGJodoushiCard,
  verb: TCGVerbCardDef,
  selectedForm: string,
): { correct: boolean; correctForm: string | null } {
  const result = checkConnection(jodoushi, verb);
  if (!result.canConnect || result.requiredForm === null) {
    return { correct: false, correctForm: null };
  }
  return {
    correct: selectedForm === result.requiredForm,
    correctForm: result.requiredForm,
  };
}

export function getConjugationChoices(verb: TCGVerbCardDef): { key: string; label: string; form: string }[] {
  return [
    { key: 'mizenkei', label: '未然形', form: verb.conjugation.mizenkei },
    { key: 'renyoukei', label: '連用形', form: verb.conjugation.renyoukei },
    { key: 'shuushikei', label: '終止形', form: verb.conjugation.shuushikei },
    { key: 'rentaikei', label: '連体形', form: verb.conjugation.rentaikei },
    { key: 'izenkei', label: '已然形', form: verb.conjugation.izenkei },
    { key: 'meireikei', label: '命令形', form: verb.conjugation.meireikei },
  ];
}
