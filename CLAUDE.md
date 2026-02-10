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
    BattleEngine.ts      -- バトル進行 (ターン処理, 勝敗判定)
    DamageCalculator.ts  -- ダメージ計算 (属性, コンボ, 速度)
    QuestionGenerator.ts -- 問題生成
    ProgressManager.ts   -- 経験値/レベル/星評価/石報酬
    GachaSystem.ts       -- ガチャロジック
    ZukanManager.ts      -- 図鑑データ管理
    SaveDataUpdater.ts   -- バトル結果→セーブデータ反映
    CardUpgrade.ts       -- カード強化 (コスト計算, レベルアップ)
    DeckManager.ts       -- デッキ編集 (バリデーション, カード入替)
    BossRush.ts          -- ボスラッシュ連続戦闘管理
    types.ts             -- 全型定義 + 定数
  views/          -- 画面 (DOM操作, テスト対象外)
    components/   -- UIコンポーネント (HPBar, TimerBar等)
  utils/          -- ユーティリティ (render, audio, storage, shuffle)
  styles/         -- CSS (main, battle, animations, components)
  __tests__/      -- Vitestテスト
  main.ts         -- エントリポイント
```

### 設計方針
- **フレームワークなし**: `render.ts` の `el()` と `setScreen()` でDOM管理
- **テスト駆動**: models/ 内のロジックは全てVitestでテスト済み (123テスト)
- **views/ はテスト対象外**: DOM依存のため `npm run dev` で手動確認
- **純粋関数**: models/ はDOM非依存、入力→出力の純粋関数で構成

### ゲームフロー
```
TitleScreen → MenuScreen → WorldScreen → BattleScreen → ResultScreen
                 ↓              ↓
    GachaScreen / ZukanScreen  BossRushScreen (Chapter 5)
    CardUpgradeScreen
    DeckEditScreen
```

### バトルシステム
- 1バトル = 4~6ターン、制限時間10秒/問
- 問題タイプ: 接続 / 意味 / 活用 / 複合 (ボス戦)
- コンボゲージ: 連続正解で蓄積 → 100%で必殺技発動可能
- 速度ボーナス: 0-3秒 = 1.3x, 3-7秒 = 1.0x, 7-10秒 = 0.8x
- 属性相性: 炎→氷→風→炎, 光⇔闇, 地→幻→水→地

### ボスラッシュ (Chapter 5)
- ステージ s5_4（文法帝の間）がトリガー
- Chapter 1-4 のボス4体と連続戦闘
- `BossRushScreen.ts` がモジュールレベルで `rushState` を管理
- `BattleScreen` は `isBossRushActive()` で分岐し、ボスラッシュ中はリザルトを `handleBossRushResult()` に委譲
- 全撃破で制覇ボーナス 💎100個

### カード強化システム
- `CardUpgrade.ts`: レアリティ別コスト倍率 (N=1x, R=2x, SR=3x, SSR=5x)
- レベル上限: `MAX_CARD_LEVEL = 10`
- パワー上昇: レアリティ別 (N=+2, R=+3, SR=+4, SSR=+5)
- 強化コスト: `(3 + currentLevel * 2) * rarityMultiplier` 石

### デッキ編集
- デッキサイズ: `DECK_SIZE = 5` 固定
- `DeckManager.ts`: バリデーション (枚数/重複/所持チェック)、カード入替

### セーブデータ
- localStorage キー: `bunpou_musou_save`
- `SaveData` 型: プレイヤー情報, ステージクリア, 図鑑, チャプター進行度
- バトル後の図鑑更新: `applyBattleResultToSave()` で zukanJodoushi/zukanEnemies を一括更新
- チャプタークリア判定: `isChapterCleared()` で全ステージクリアを確認 → +50石ボーナス

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
- 新ロジック追加時は models/ に純粋関数として実装し、テストを先に書く (TDD)
- views/ の画面はモジュールレベル状態を最小限に保つ (ボスラッシュの `rushState` が例外)
- セーブデータ更新は `SaveDataUpdater.ts` を経由してイミュータブルに行う

## テスト

テストフレームワーク: Vitest (globals: true)
```
src/__tests__/
  jodoushi-data.test.ts      -- データ整合性 (11テスト)
  DamageCalculator.test.ts   -- ダメージ計算 (19テスト)
  QuestionGenerator.test.ts  -- 問題生成 (6テスト)
  BattleEngine.test.ts       -- バトルエンジン (11テスト)
  ProgressManager.test.ts    -- 経験値/レベルアップ (19テスト)
  GachaSystem.test.ts        -- ガチャ (6テスト)
  ZukanManager.test.ts       -- 図鑑管理 (12テスト)
  SaveDataUpdater.test.ts    -- 図鑑データ更新 (10テスト)
  CardUpgrade.test.ts        -- カード強化 (11テスト)
  DeckManager.test.ts        -- デッキ管理 (10テスト)
  BossRush.test.ts           -- ボスラッシュ (8テスト)
```

## 既知の制限・今後の課題

- 全機能実装済み（ロジック + UI）
- 今後の改善候補: カード合成システム、ランキング、マルチプレイ
