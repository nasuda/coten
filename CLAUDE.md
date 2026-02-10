# CLAUDE.md - 文法無双 プロジェクトガイド

## プロジェクト概要

**文法無双 ～俺の詠嘆が世界を救う～** — 古文助動詞バトルRPG
- ターゲット: 中学2年生男子
- 助動詞の知識で敵を倒す中二病テイストのコマンドバトルRPG
- 技術スタック: Vite + TypeScript (フレームワークなし、バニラTS)

## コマンド

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド (`tsc && vite build`) |
| `npm run test` | テスト実行 (watch mode) |
| `npm run test:run` | テスト実行 (一回のみ) |

## アーキテクチャ

### ディレクトリ構成
```
src/
  data/           -- 静的データ (助動詞26個, 敵32体, ステージ32, 問題75+, スキル, ガチャ)
  models/         -- ゲームロジック (純粋関数中心, テスト対象)
  views/          -- 画面 (DOM操作, テスト対象外)
    components/   -- UIコンポーネント (HPBar, TimerBar等)
  utils/          -- ユーティリティ (render, audio, storage, shuffle)
  styles/         -- CSS (main, battle, animations, components)
  __tests__/      -- Vitestテスト
  main.ts         -- エントリポイント
```

### 設計方針
- **フレームワークなし**: `render.ts` の `el()` と `setScreen()` でDOM管理
- **テスト駆動**: models/ 内のロジックは全てVitestでテスト済み (81テスト)
- **views/ はテスト対象外**: DOM依存のため `npm run dev` で手動確認
- **純粋関数**: models/ はDOM非依存、入力→出力の純粋関数で構成

### ゲームフロー
```
TitleScreen → MenuScreen → WorldScreen → BattleScreen → ResultScreen
                 ↓
           GachaScreen / ZukanScreen
```

### バトルシステム
- 1バトル = 4~6ターン、制限時間10秒/問
- 問題タイプ: 接続 / 意味 / 活用 / 複合 (ボス戦)
- コンボゲージ: 連続正解で蓄積 → 100%で必殺技発動可能
- 速度ボーナス: 0-3秒 = 1.3x, 3-7秒 = 1.0x, 7-10秒 = 0.8x
- 属性相性: 炎→氷→風→炎, 光⇔闇, 地→幻→水→地

### セーブデータ
- localStorage キー: `bunpou_musou_save`
- `SaveData` 型: プレイヤー情報, ステージクリア, 図鑑, チャプター進行度

## 重要な型 (src/models/types.ts)

- `JodoushiData` — 助動詞データ (26個, RPGフィールド付き)
- `BattleState` — バトル中の全状態
- `BattleResult` — バトル結果
- `SaveData` — セーブデータ
- `SkillCard` — スキルカード
- `Enemy` — 敵キャラ
- `QuestionTemplate` — 問題テンプレート

## 助動詞データ構成

| Chapter | 助動詞数 | テーマ |
|---------|---------|--------|
| 1 | 6個 | 受身・使役・打消 (る/らる/す/さす/しむ/ず) |
| 2 | 6個 | 過去・完了 (き/けり/つ/ぬ/たり(完了)/り) |
| 3 | 6個 | 推量・意志 (む/むず/らむ/けむ/べし/まし) |
| 4 | 8個 | 断定・伝聞・打消推量・希望・比況 |

## コーディング規約

- `innerHTML` は使用禁止 → `clearElement()` ヘルパーで子要素を削除
- DOM生成は `el()` ヘルパーを使用
- 画面遷移は `setScreen(type, renderFn)` を使用
- 効果音は `audio.ts` の関数を使用 (Web Audio API合成、外部ファイル不要)
- セーブは `storage.ts` の `saveSaveData()` / `getOrCreateSave()` を使用

## テスト

テストフレームワーク: Vitest (globals: true)
```
src/__tests__/
  jodoushi-data.test.ts      -- データ整合性 (11テスト)
  DamageCalculator.test.ts   -- ダメージ計算 (19テスト)
  QuestionGenerator.test.ts  -- 問題生成 (6テスト)
  BattleEngine.test.ts       -- バトルエンジン (11テスト)
  ProgressManager.test.ts    -- 経験値/レベルアップ (16テスト)
  GachaSystem.test.ts        -- ガチャ (6テスト)
  ZukanManager.test.ts       -- 図鑑管理 (12テスト)
```

## 既知の制限・今後の課題

- ステージクリア後に図鑑の遭遇/撃破データを更新するロジックが未接続
- ボスラッシュ (Chapter 5) の連続戦闘は未実装
- チャプタークリアボーナス石 (50個) の付与が未実装
- カードレベルアップUI・強化システムが未実装
- デッキ編集UIが未実装
