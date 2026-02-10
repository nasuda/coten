// ============================================================
// 問題テンプレート（75問+）
// ============================================================

import type { QuestionTemplate } from '../models/types.ts';

export const allQuestions: QuestionTemplate[] = [
  // === Chapter 1: 接続問題 ===
  { id: 'q1_01', type: 'connection', sentence: '花の散るを惜しま___', correctJodoushiId: 'ru', chapter: 1, hint: '四段動詞の未然形に付く' },
  { id: 'q1_02', type: 'connection', sentence: '帝に召さ___', correctJodoushiId: 'raru', chapter: 1, hint: '下二段動詞の未然形に付く' },
  { id: 'q1_03', type: 'connection', sentence: '人を走ら___', correctJodoushiId: 'su', chapter: 1, hint: '四段動詞の未然形に付く使役' },
  { id: 'q1_04', type: 'connection', sentence: '大臣に奏せ___', correctJodoushiId: 'sasu', chapter: 1, hint: '下二段動詞の未然形に付く使役' },
  { id: 'q1_05', type: 'connection', sentence: '民を苦しま___', correctJodoushiId: 'shimu', chapter: 1, hint: '漢文由来の使役' },
  { id: 'q1_06', type: 'connection', sentence: '花咲か___', correctJodoushiId: 'zu', chapter: 1, hint: '未然形に付く打消' },
  { id: 'q1_07', type: 'meaning', sentence: '受身の意味を持つ助動詞を選べ', correctJodoushiId: 'ru', chapter: 1, targetMeaning: '受身' },
  { id: 'q1_08', type: 'meaning', sentence: '使役の意味を持つ助動詞を選べ', correctJodoushiId: 'su', chapter: 1, targetMeaning: '使役' },
  { id: 'q1_09', type: 'meaning', sentence: '打消の意味を持つ助動詞を選べ', correctJodoushiId: 'zu', chapter: 1, targetMeaning: '打消' },
  { id: 'q1_10', type: 'meaning', sentence: '尊敬の意味を持つ助動詞を選べ', correctJodoushiId: 'raru', chapter: 1, targetMeaning: '尊敬' },
  { id: 'q1_11', type: 'conjugation', sentence: '「る」の已然形を選べ', correctJodoushiId: 'ru', chapter: 1, targetForm: 'izenkei', targetAnswer: 'るれ' },
  { id: 'q1_12', type: 'conjugation', sentence: '「ず」の連体形を選べ', correctJodoushiId: 'zu', chapter: 1, targetForm: 'rentaikei', targetAnswer: 'ぬ/ざる' },

  // === Chapter 2: 過去・完了 ===
  { id: 'q2_01', type: 'connection', sentence: '昔、男あり___', correctJodoushiId: 'ki', chapter: 2, hint: '連用形に付く体験過去' },
  { id: 'q2_02', type: 'connection', sentence: '竹取の翁といふものあり___', correctJodoushiId: 'keri', chapter: 2, hint: '連用形に付く伝聞過去' },
  { id: 'q2_03', type: 'connection', sentence: '風立ち___、いざ生きめやも', correctJodoushiId: 'nu', chapter: 2, hint: '連用形に付く自然完了' },
  { id: 'q2_04', type: 'connection', sentence: '門開き___', correctJodoushiId: 'tari_kanryou', chapter: 2, hint: '連用形に付く完了・存続' },
  { id: 'q2_05', type: 'connection', sentence: '花咲け___', correctJodoushiId: 'ri', chapter: 2, hint: '四段已然形に付く完了' },
  { id: 'q2_06', type: 'meaning', sentence: '体験過去の意味を持つ助動詞を選べ', correctJodoushiId: 'ki', chapter: 2, targetMeaning: '過去（体験）' },
  { id: 'q2_07', type: 'meaning', sentence: '詠嘆の意味を持つ助動詞を選べ', correctJodoushiId: 'keri', chapter: 2, targetMeaning: '詠嘆' },
  { id: 'q2_08', type: 'meaning', sentence: '完了の意味を持つ助動詞を選べ', correctJodoushiId: 'tsu', chapter: 2, targetMeaning: '完了' },
  { id: 'q2_09', type: 'meaning', sentence: '存続の意味を持つ助動詞を選べ', correctJodoushiId: 'tari_kanryou', chapter: 2, targetMeaning: '存続' },
  { id: 'q2_10', type: 'conjugation', sentence: '「き」の連体形を選べ', correctJodoushiId: 'ki', chapter: 2, targetForm: 'rentaikei', targetAnswer: 'し' },
  { id: 'q2_11', type: 'conjugation', sentence: '「けり」の已然形を選べ', correctJodoushiId: 'keri', chapter: 2, targetForm: 'izenkei', targetAnswer: 'けれ' },
  { id: 'q2_12', type: 'conjugation', sentence: '「ぬ」の未然形を選べ', correctJodoushiId: 'nu', chapter: 2, targetForm: 'mizenkei', targetAnswer: 'な' },
  { id: 'q2_13', type: 'connection', sentence: '書き___', correctJodoushiId: 'tsu', chapter: 2, hint: '連用形に付く意志的完了' },

  // === Chapter 3: 推量・意志 ===
  { id: 'q3_01', type: 'connection', sentence: '明日は雨降ら___', correctJodoushiId: 'mu', chapter: 3, hint: '未然形に付く推量' },
  { id: 'q3_02', type: 'connection', sentence: '行く___', correctJodoushiId: 'beshi', chapter: 3, hint: '終止形に付く当然' },
  { id: 'q3_03', type: 'connection', sentence: '秋の月こそ照らす___', correctJodoushiId: 'ramu', chapter: 3, hint: '終止形に付く現在推量' },
  { id: 'q3_04', type: 'connection', sentence: '誰か住み___', correctJodoushiId: 'kemu', chapter: 3, hint: '連用形に付く過去推量' },
  { id: 'q3_05', type: 'connection', sentence: '春の心はのどけから___', correctJodoushiId: 'mashi', chapter: 3, hint: '未然形に付く反実仮想' },
  { id: 'q3_06', type: 'meaning', sentence: '推量の意味を持つ助動詞を選べ', correctJodoushiId: 'mu', chapter: 3, targetMeaning: '推量' },
  { id: 'q3_07', type: 'meaning', sentence: '反実仮想の意味を持つ助動詞を選べ', correctJodoushiId: 'mashi', chapter: 3, targetMeaning: '反実仮想' },
  { id: 'q3_08', type: 'meaning', sentence: '当然の意味を持つ助動詞を選べ', correctJodoushiId: 'beshi', chapter: 3, targetMeaning: '当然' },
  { id: 'q3_09', type: 'meaning', sentence: '現在推量の意味を持つ助動詞を選べ', correctJodoushiId: 'ramu', chapter: 3, targetMeaning: '現在推量' },
  { id: 'q3_10', type: 'conjugation', sentence: '「む」の已然形を選べ', correctJodoushiId: 'mu', chapter: 3, targetForm: 'izenkei', targetAnswer: 'め' },
  { id: 'q3_11', type: 'conjugation', sentence: '「べし」の連体形を選べ', correctJodoushiId: 'beshi', chapter: 3, targetForm: 'rentaikei', targetAnswer: 'べき/べかる' },
  { id: 'q3_12', type: 'conjugation', sentence: '「まし」の未然形を選べ', correctJodoushiId: 'mashi', chapter: 3, targetForm: 'mizenkei', targetAnswer: 'ましか' },
  { id: 'q3_13', type: 'connection', sentence: '必ず成し遂げ___', correctJodoushiId: 'muzu', chapter: 3, hint: '未然形に付く強い意志' },

  // === Chapter 4: 断定・伝聞・打消推量・希望・比況 ===
  { id: 'q4_01', type: 'connection', sentence: '男もす___日記', correctJodoushiId: 'nari_denbun', chapter: 4, hint: '終止形に付く伝聞' },
  { id: 'q4_02', type: 'connection', sentence: '笛吹く___', correctJodoushiId: 'nari_denbun', chapter: 4, hint: '終止形に付く推定' },
  { id: 'q4_03', type: 'connection', sentence: '堂々___', correctJodoushiId: 'tari_dantei', chapter: 4, hint: '体言に付く断定' },
  { id: 'q4_04', type: 'connection', sentence: '二度と来___', correctJodoushiId: 'ji', chapter: 4, hint: '未然形に付く打消推量' },
  { id: 'q4_05', type: 'connection', sentence: '許す___', correctJodoushiId: 'maji', chapter: 4, hint: '終止形に付く打消推量' },
  { id: 'q4_06', type: 'connection', sentence: '見___', correctJodoushiId: 'mahoshi', chapter: 4, hint: '未然形に付く希望' },
  { id: 'q4_07', type: 'connection', sentence: '逢ひ___', correctJodoushiId: 'tashi', chapter: 4, hint: '連用形に付く希望' },
  { id: 'q4_08', type: 'connection', sentence: '光の矢の___', correctJodoushiId: 'gotoshi', chapter: 4, hint: '体言+の に付く比況' },
  { id: 'q4_09', type: 'meaning', sentence: '断定の意味を持つ助動詞を選べ', correctJodoushiId: 'nari_dantei', chapter: 4, targetMeaning: '断定' },
  { id: 'q4_10', type: 'meaning', sentence: '伝聞の意味を持つ助動詞を選べ', correctJodoushiId: 'nari_denbun', chapter: 4, targetMeaning: '伝聞' },
  { id: 'q4_11', type: 'meaning', sentence: '打消推量の意味を持つ助動詞を選べ', correctJodoushiId: 'ji', chapter: 4, targetMeaning: '打消推量' },
  { id: 'q4_12', type: 'meaning', sentence: '希望の意味を持つ助動詞を選べ', correctJodoushiId: 'mahoshi', chapter: 4, targetMeaning: '希望（自己）' },
  { id: 'q4_13', type: 'meaning', sentence: '比況の意味を持つ助動詞を選べ', correctJodoushiId: 'gotoshi', chapter: 4, targetMeaning: '比況' },
  { id: 'q4_14', type: 'conjugation', sentence: '「なり（断定）」の未然形を選べ', correctJodoushiId: 'nari_dantei', chapter: 4, targetForm: 'mizenkei', targetAnswer: 'なら' },
  { id: 'q4_15', type: 'conjugation', sentence: '「まじ」の連体形を選べ', correctJodoushiId: 'maji', chapter: 4, targetForm: 'rentaikei', targetAnswer: 'まじき/まじかる' },
  { id: 'q4_16', type: 'conjugation', sentence: '「ごとし」の連体形を選べ', correctJodoushiId: 'gotoshi', chapter: 4, targetForm: 'rentaikei', targetAnswer: 'ごとき' },

  // === Chapter 5: 複合問題 ===
  { id: 'q5_01', type: 'composite', sentence: '未然形に接続し、打消の意味を持つ助動詞を選べ', correctJodoushiId: 'zu', chapter: 5, targetMeaning: '打消', hint: '接続+意味の同時判定' },
  { id: 'q5_02', type: 'composite', sentence: '連用形に接続し、完了の意味を持つ助動詞を選べ', correctJodoushiId: 'tsu', chapter: 5, targetMeaning: '完了', hint: '接続+意味の同時判定' },
  { id: 'q5_03', type: 'composite', sentence: '終止形に接続し、推量の意味を持つ助動詞を選べ', correctJodoushiId: 'ramu', chapter: 5, targetMeaning: '現在推量', hint: '接続+意味の同時判定' },
  { id: 'q5_04', type: 'composite', sentence: '未然形に接続し、使役の意味を持つ助動詞を選べ', correctJodoushiId: 'sasu', chapter: 5, targetMeaning: '使役', hint: '接続+意味の同時判定' },
  { id: 'q5_05', type: 'composite', sentence: '体言に接続し、断定の意味を持つ助動詞を選べ', correctJodoushiId: 'nari_dantei', chapter: 5, targetMeaning: '断定', hint: '接続+意味の同時判定' },
  { id: 'q5_06', type: 'composite', sentence: '終止形に接続し、伝聞の意味を持つ助動詞を選べ', correctJodoushiId: 'nari_denbun', chapter: 5, targetMeaning: '伝聞', hint: '接続+意味の同時判定' },
  { id: 'q5_07', type: 'composite', sentence: '未然形に接続し、打消推量の意味を持つ助動詞を選べ', correctJodoushiId: 'ji', chapter: 5, targetMeaning: '打消推量', hint: '接続+意味の同時判定' },
  { id: 'q5_08', type: 'composite', sentence: '連用形に接続し、希望の意味を持つ助動詞を選べ', correctJodoushiId: 'tashi', chapter: 5, targetMeaning: '希望（自己）', hint: '接続+意味の同時判定' },
  { id: 'q5_09', type: 'composite', sentence: '未然形に接続し、反実仮想の意味を持つ助動詞を選べ', correctJodoushiId: 'mashi', chapter: 5, targetMeaning: '反実仮想', hint: '接続+意味の同時判定' },
  { id: 'q5_10', type: 'composite', sentence: '連用形に接続し、過去の意味を持つ助動詞を選べ', correctJodoushiId: 'ki', chapter: 5, targetMeaning: '過去（体験）', hint: '接続+意味の同時判定' },

  // === 追加問題: 各章から ===
  { id: 'q1_13', type: 'connection', sentence: '思は___', correctJodoushiId: 'ru', chapter: 1, hint: '四段動詞未然形に付く受身' },
  { id: 'q1_14', type: 'connection', sentence: '泣かせ給ふ。されど聞き入れ___', correctJodoushiId: 'zu', chapter: 1, hint: '未然形に付く打消' },
  { id: 'q2_14', type: 'connection', sentence: '雪降り___', correctJodoushiId: 'ki', chapter: 2, hint: '連用形に付く体験過去' },
  { id: 'q2_15', type: 'meaning', sentence: '強意の意味を持つ助動詞を選べ', correctJodoushiId: 'nu', chapter: 2, targetMeaning: '強意' },
  { id: 'q3_14', type: 'meaning', sentence: '意志の意味を持つ助動詞を選べ', correctJodoushiId: 'mu', chapter: 3, targetMeaning: '意志' },
  { id: 'q3_15', type: 'meaning', sentence: '婉曲の意味を持つ助動詞を選べ', correctJodoushiId: 'mu', chapter: 3, targetMeaning: '婉曲' },
  { id: 'q4_17', type: 'meaning', sentence: '打消意志の意味を持つ助動詞を選べ', correctJodoushiId: 'ji', chapter: 4, targetMeaning: '打消意志' },
  { id: 'q4_18', type: 'meaning', sentence: '推定の意味を持つ助動詞を選べ', correctJodoushiId: 'nari_denbun', chapter: 4, targetMeaning: '推定' },
  { id: 'q4_19', type: 'conjugation', sentence: '「たし」の連体形を選べ', correctJodoushiId: 'tashi', chapter: 4, targetForm: 'rentaikei', targetAnswer: 'たき/たかる' },
  { id: 'q4_20', type: 'conjugation', sentence: '「じ」の終止形を選べ', correctJodoushiId: 'ji', chapter: 4, targetForm: 'shuushikei', targetAnswer: 'じ' },
];

export function getQuestionsByChapter(chapter: number): QuestionTemplate[] {
  return allQuestions.filter(q => q.chapter === chapter);
}

export function getQuestionsByType(type: QuestionTemplate['type']): QuestionTemplate[] {
  return allQuestions.filter(q => q.type === type);
}
