// ============================================================
// 必殺技データ
// ============================================================

import type { SpecialSkill } from '../models/types.ts';

export const allSkills: SpecialSkill[] = [
  { id: 'sk_ru', jodoushiId: 'ru', name: '鏡写しの反撃', ruby: 'ミラー・リフレクション', element: 'water', power: 50, description: '受身の力で敵の攻撃を跳ね返す' },
  { id: 'sk_raru', jodoushiId: 'raru', name: '映し身の盾', ruby: 'リフレクト・シールド', element: 'water', power: 50, description: '尊敬の光で身を守り反撃する' },
  { id: 'sk_su', jodoushiId: 'su', name: '万軍召喚', ruby: 'レギオン・サモン', element: 'fire', power: 55, description: '使役の力で無数の兵を召喚する' },
  { id: 'sk_sasu', jodoushiId: 'sasu', name: '従属の炎鎖', ruby: 'サーヴァント・チェイン', element: 'fire', power: 55, description: '炎の鎖で敵を縛り上げる' },
  { id: 'sk_shimu', jodoushiId: 'shimu', name: '漢文帝の命令', ruby: 'インペリアル・オーダー', element: 'fire', power: 65, description: '古の帝の命令で天地を揺るがす' },
  { id: 'sk_zu', jodoushiId: 'zu', name: '虚無への回帰', ruby: 'ヴォイド・キャンセル', element: 'dark', power: 45, description: '全てを否定し虚無に還す' },
  { id: 'sk_ki', jodoushiId: 'ki', name: '追憶の刻', ruby: 'メモリアル・スラッシュ', element: 'earth', power: 45, description: '体験した記憶の刃で斬る' },
  { id: 'sk_keri', jodoushiId: 'keri', name: '悠久の詠嘆', ruby: 'エターナル・ラメント', element: 'earth', power: 45, description: '詠嘆の力で時空を歪める' },
  { id: 'sk_tsu', jodoushiId: 'tsu', name: '意志の断撃', ruby: 'ウィル・ストライク', element: 'earth', power: 55, description: '完了の意志で一撃必殺を放つ' },
  { id: 'sk_nu', jodoushiId: 'nu', name: '自然崩壊の刃', ruby: 'ナチュラル・コラプス', element: 'earth', power: 55, description: '万物を自然に崩壊させる' },
  { id: 'sk_tari_k', jodoushiId: 'tari_kanryou', name: '存続の結界', ruby: 'パーシスト・バリア', element: 'earth', power: 55, description: '存続の力で絶対防御を展開する' },
  { id: 'sk_ri', jodoushiId: 'ri', name: '刹那の永続', ruby: 'フリーズ・モーメント', element: 'earth', power: 60, description: '一瞬を永遠に固定する禁術' },
  { id: 'sk_mu', jodoushiId: 'mu', name: '六面の風', ruby: 'シックス・プロフェシー', element: 'wind', power: 50, description: '六つの意味を持つ風の刃を放つ' },
  { id: 'sk_muzu', jodoushiId: 'muzu', name: '絶対意志の嵐', ruby: 'アブソリュート・ウィル', element: 'wind', power: 80, description: '揺るがぬ意志が嵐を起こす' },
  { id: 'sk_ramu', jodoushiId: 'ramu', name: '現在透視の瞳', ruby: 'プレゼント・ヴィジョン', element: 'wind', power: 65, description: '現在の真実を見通す眼で攻撃' },
  { id: 'sk_kemu', jodoushiId: 'kemu', name: '過去透視の瞳', ruby: 'パスト・ヴィジョン', element: 'wind', power: 65, description: '過去の真実を見通す眼で攻撃' },
  { id: 'sk_beshi', jodoushiId: 'beshi', name: '当然必定の烈風', ruby: 'ディヴァイン・ジャッジメント', element: 'wind', power: 60, description: '必定の裁きの風が全てを薙ぎ払う' },
  { id: 'sk_mashi', jodoushiId: 'mashi', name: '仮想世界の逆風', ruby: 'ファンタズム・ワールド', element: 'wind', power: 70, description: '仮想の世界を現実に重ねる禁術' },
  { id: 'sk_ji', jodoushiId: 'ji', name: '否定の暗黒剣', ruby: 'ネガティブ・ブレイド', element: 'dark', power: 65, description: '否定の意志を込めた暗黒の剣' },
  { id: 'sk_maji', jodoushiId: 'maji', name: '絶対否定の闇', ruby: 'アブソリュート・ネゲーション', element: 'dark', power: 80, description: '全てを否定する究極の闇' },
  { id: 'sk_mahoshi', jodoushiId: 'mahoshi', name: '渇望の黒炎', ruby: 'デザイア・フレイム', element: 'dark', power: 75, description: '渇望が黒い炎となって燃え上がる' },
  { id: 'sk_tashi', jodoushiId: 'tashi', name: '切望の一撃', ruby: 'ロンギング・ストライク', element: 'dark', power: 60, description: '切なる望みを込めた渾身の一撃' },
  { id: 'sk_nari_d', jodoushiId: 'nari_dantei', name: '断定の光柱', ruby: 'トゥルーネーム・リリース', element: 'light', power: 50, description: '真の名を断定し光の柱を降ろす' },
  { id: 'sk_tari_d', jodoushiId: 'tari_dantei', name: '真名解放の光', ruby: 'トゥルース・リベレーション', element: 'light', power: 80, description: '真理を解放する究極の光' },
  { id: 'sk_nari_db', jodoushiId: 'nari_denbun', name: '伝聞の共鳴', ruby: 'エコー・レゾナンス', element: 'light', power: 75, description: '伝え聞いた力を共鳴させる' },
  { id: 'sk_gotoshi', jodoushiId: 'gotoshi', name: '万象比擬の眼', ruby: 'ユニバーサル・メタファー', element: 'light', power: 75, description: '万物を比擬し力に変える' },
];

export function getSkillByJodoushi(jodoushiId: string): SpecialSkill | undefined {
  return allSkills.find(s => s.jodoushiId === jodoushiId);
}
