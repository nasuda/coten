// ============================================================
// 問題生成エンジン
// ============================================================

import type { BattleQuestion, QuestionType, SkillCard } from './types.ts';
import { allQuestions } from '../data/questions.ts';
import { allJodoushi } from '../data/jodoushi.ts';
import { shuffle } from '../utils/shuffle.ts';

export function generateQuestion(
  chapter: number,
  hand: SkillCard[],
  preferredType?: QuestionType,
  numChoices: number = 5,
): BattleQuestion | null {
  // chapter以下の問題から候補を絞る
  const availableQuestions = allQuestions.filter(q => q.chapter <= chapter);
  if (availableQuestions.length === 0) return null;

  // タイプフィルタ
  let candidates = preferredType
    ? availableQuestions.filter(q => q.type === preferredType)
    : availableQuestions;

  if (candidates.length === 0) candidates = availableQuestions;

  // 手札にある助動詞で正解できる問題を優先
  const handJodoushiIds = new Set(hand.map(c => c.jodoushiId));
  const handMatchable = candidates.filter(q => handJodoushiIds.has(q.correctJodoushiId));

  const pool = handMatchable.length > 0 ? handMatchable : candidates;
  const template = pool[Math.floor(Math.random() * pool.length)]!;

  // 正解カードを特定
  const correctJodoushi = allJodoushi.find(j => j.id === template.correctJodoushiId);
  if (!correctJodoushi) return null;

  const correctCard: SkillCard = {
    id: `answer_${correctJodoushi.id}`,
    jodoushiId: correctJodoushi.id,
    name: correctJodoushi.name,
    rarity: correctJodoushi.rarity,
    element: correctJodoushi.element,
    level: 1,
    power: correctJodoushi.basePower,
  };

  // ダミー選択肢を生成
  const dummyPool = allJodoushi
    .filter(j => j.id !== template.correctJodoushiId)
    .map(j => ({
      id: `dummy_${j.id}`,
      jodoushiId: j.id,
      name: j.name,
      rarity: j.rarity,
      element: j.element,
      level: 1,
      power: j.basePower,
    } as SkillCard));

  const result = generateChoices(correctCard, dummyPool, numChoices);

  // 表示テキスト生成
  let displayText = template.sentence;
  let typeLabel = '';
  switch (template.type) {
    case 'connection':
      typeLabel = '接続問題';
      break;
    case 'meaning':
      typeLabel = '意味問題';
      displayText = template.sentence;
      break;
    case 'conjugation':
      typeLabel = '活用問題';
      displayText = template.sentence;
      break;
    case 'composite':
      typeLabel = '複合問題';
      displayText = template.sentence;
      break;
  }

  return {
    template,
    type: template.type,
    displayText,
    typeLabel,
    correctCardIndex: result.correctIndex,
    choices: result.choices,
  };
}

export function generateChoices(
  correctCard: SkillCard,
  dummyPool: SkillCard[],
  totalCount: number,
): { choices: SkillCard[]; correctIndex: number } {
  const shuffledDummies = shuffle([...dummyPool]);
  const dummies = shuffledDummies.slice(0, totalCount - 1);

  const choices: SkillCard[] = [...dummies, correctCard];
  const shuffled = shuffle(choices);

  const correctIndex = shuffled.findIndex(c => c.jodoushiId === correctCard.jodoushiId);

  return { choices: shuffled, correctIndex };
}

export function selectQuestionType(chapter: number, isBoss: boolean): QuestionType {
  if (isBoss) return 'composite';

  const rand = Math.random();
  if (chapter <= 2) {
    // 序盤: 接続60%, 意味30%, 活用10%
    if (rand < 0.6) return 'connection';
    if (rand < 0.9) return 'meaning';
    return 'conjugation';
  }
  if (chapter <= 4) {
    // 中盤: 接続40%, 意味30%, 活用20%, 複合10%
    if (rand < 0.4) return 'connection';
    if (rand < 0.7) return 'meaning';
    if (rand < 0.9) return 'conjugation';
    return 'composite';
  }
  // 終盤: 均等
  if (rand < 0.25) return 'connection';
  if (rand < 0.5) return 'meaning';
  if (rand < 0.75) return 'conjugation';
  return 'composite';
}
