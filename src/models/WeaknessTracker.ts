// ============================================================
// 弱点追跡 — 図鑑データから弱点プロファイルを生成し出題を最適化
// ============================================================

import type { ZukanJodoushiEntry, QuestionType, QuestionTemplate, WeaknessProfile } from './types.ts';

export function buildWeaknessProfile(
  zukanEntries: ZukanJodoushiEntry[],
): WeaknessProfile {
  const jodoushiWeakness = new Map<string, number>();

  // 全タイプ集計用
  const typeAgg: Record<QuestionType, { correct: number; total: number }> = {
    connection: { correct: 0, total: 0 },
    meaning: { correct: 0, total: 0 },
    conjugation: { correct: 0, total: 0 },
    composite: { correct: 0, total: 0 },
  };

  for (const entry of zukanEntries) {
    let weight: number;

    if (entry.totalCount === 0) {
      // 未遭遇: 探索優先
      weight = 2.0;
    } else {
      const accuracy = entry.correctCount / entry.totalCount;
      weight = 1 + Math.pow(1 - accuracy, 2) * 3;

      // マスタリーLv4-5: 出題頻度を下げる（完全除外はしない）
      if (entry.masteryLevel >= 4) {
        weight *= 0.3;
      }
    }

    jodoushiWeakness.set(entry.id, weight);

    // typeStats集計
    if (entry.typeStats) {
      for (const [type, stats] of Object.entries(entry.typeStats)) {
        const key = type as QuestionType;
        if (typeAgg[key]) {
          typeAgg[key].correct += stats.correct;
          typeAgg[key].total += stats.total;
        }
      }
    }
  }

  const typeWeakness: Record<QuestionType, number> = {
    connection: calculateTypeWeight(typeAgg.connection),
    meaning: calculateTypeWeight(typeAgg.meaning),
    conjugation: calculateTypeWeight(typeAgg.conjugation),
    composite: calculateTypeWeight(typeAgg.composite),
  };

  return { jodoushiWeakness, typeWeakness };
}

function calculateTypeWeight(stats: { correct: number; total: number }): number {
  if (stats.total === 0) return 2.0;
  const accuracy = stats.correct / stats.total;
  return 1 + Math.pow(1 - accuracy, 2) * 3;
}

export function weightQuestions(
  questions: QuestionTemplate[],
  profile: WeaknessProfile,
): { question: QuestionTemplate; weight: number }[] {
  return questions.map(q => {
    const jWeight = profile.jodoushiWeakness.get(q.correctJodoushiId) ?? 2.0;
    const tWeight = profile.typeWeakness[q.type] ?? 1.0;
    // 助動詞重みとタイプ重みの積
    const weight = jWeight * tWeight;
    return { question: q, weight };
  });
}

export function weightedRandomPick<T>(
  items: { item: T; weight: number }[],
): T {
  if (items.length === 0) throw new Error('Empty items');
  if (items.length === 1) return items[0]!.item;

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * totalWeight;

  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) return entry.item;
  }

  return items[items.length - 1]!.item;
}
