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
    QuestionGenerator.ts -- 問題生成 (弱点重み付き選択対応)
    WeaknessTracker.ts   -- 弱点プロファイル生成・重み計算
    ProgressManager.ts   -- 経験値/レベル/星評価/石報酬
    GachaSystem.ts       -- ガチャロジック
    ZukanManager.ts      -- 図鑑データ管理
    SaveDataUpdater.ts   -- バトル結果→セーブデータ反映 (typeStats含む)
    CardUpgrade.ts       -- カード強化 (コスト計算, レベルアップ)
    DeckManager.ts       -- デッキ編集 (バリデーション, カード入替)
    BossRush.ts          -- ボスラッシュ連続戦闘管理
    types.ts             -- 全型定義 + 定数
  views/          -- 画面 (DOM操作, テスト対象外)
    ProfileSelectScreen.ts -- プロフィール選択/作成/削除
    components/   -- UIコンポーネント (HPBar, TimerBar等)
  utils/          -- ユーティリティ (render, audio, storage, shuffle)
  styles/         -- CSS (main, battle, animations, components)
  __tests__/      -- Vitestテスト
  main.ts         -- エントリポイント
```

### 設計方針
- **フレームワークなし**: `render.ts` の `el()` と `setScreen()` でDOM管理
- **テスト駆動**: models/ 内のロジックは全てVitestでテスト済み (227テスト)
- **views/ はテスト対象外**: DOM依存のため `npm run dev` で手動確認
- **純粋関数**: models/ はDOM非依存、入力→出力の純粋関数で構成

### ゲームフロー
```
TitleScreen → ProfileSelectScreen → MenuScreen → WorldScreen → BattleScreen → ResultScreen
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
- **弱点追跡**: 図鑑の正答率からWeaknessProfileを生成し、苦手助動詞を重み付き出題
- **誤答分析**: TurnResult に `askedJodoushiId`（正解）と `selectedJodoushiId`（選択）を分離記録
- **ダミー選択肢**: 同章以下の助動詞に限定（不足時のみ全体フォールバック）
- **タイムアウト**: cardIndex=-1 で未選択を明示、selectedJodoushiId='' として記録

### 弱点追跡システム
- `WeaknessTracker.ts`: 図鑑データからWeaknessProfileを生成
- 重み計算: `1 + (1 - accuracy)^2 * 3` (正答率0%→4.0, 50%→1.75, 100%→1.0)
- 未遭遇: weight=2.0（探索優先）
- マスタリーLv4-5: weight × 0.3（完全除外はしない）
- `typeStats`: ZukanJodoushiEntry に問題タイプ別正答率を記録

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

### セーブデータ・複数ユーザー
- プロフィール管理: 最大3スロット (`MAX_PROFILES = 3`)
- localStorage キー: `bunpou_musou_profiles` (プロフィール一覧), `bunpou_musou_active` (アクティブID)
- セーブキー: `bunpou_musou_save_{profileId}` (プロフィール別)
- `migrateLegacySave()`: 旧 `bunpou_musou_save` キーを自動移行
- `SaveData` 型: プレイヤー情報, ステージクリア, 図鑑, チャプター進行度
- バトル後の図鑑更新: `applyBattleResultToSave()` で zukanJodoushi/zukanEnemies + typeStats を一括更新
- チャプタークリア判定: `isChapterCleared()` で全ステージクリアを確認 → +50石ボーナス

### TCG学習レポート
- TCGリザルト画面に誤接続レビューセクションを表示
- `connectionHistory` (プレイヤーのみ) をBattleScreenからResultScreenに引き渡し
- 各誤接続: 助動詞名→動詞名、選択形と正解形を対比表示

## 重要な型 (src/models/types.ts)

- `JodoushiData` — 助動詞データ (26個, RPGフィールド付き)
- `BattleState` — バトル中の全状態
- `BattleResult` — バトル結果
- `TurnResult` — ターン結果 (`askedJodoushiId` + `selectedJodoushiId`)
- `SaveData` — セーブデータ
- `SkillCard` — スキルカード
- `Enemy` — 敵キャラ
- `QuestionTemplate` — 問題テンプレート
- `WeaknessProfile` — 弱点プロファイル (`jodoushiWeakness` Map + `typeWeakness`)
- `UserProfile` — ユーザープロフィール (`id`, `name`, `createdAt`)
- `ZukanJodoushiEntry` — 図鑑エントリ (`typeStats` 付き)

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
- セーブは `storage.ts` の `saveSaveData()` / `getOrCreateSave()` を使用（プロフィール自動ルーティング）
- 新ロジック追加時は models/ に純粋関数として実装し、テストを先に書く (TDD)
- views/ の画面はモジュールレベル状態を最小限に保つ (ボスラッシュの `rushState` が例外)
- セーブデータ更新は `SaveDataUpdater.ts` を経由してイミュータブルに行う
- タイムアウト (未選択) は `cardIndex = -1` で BattleEngine に渡す

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
  CardUpgrade.test.ts        -- カード強化 (17テスト)
  DeckManager.test.ts        -- デッキ管理 (10テスト)
  BossRush.test.ts           -- ボスラッシュ (12テスト)
  WeaknessTracker.test.ts    -- 弱点追跡 (12テスト)
```

## 既知の制限・今後の課題

- 全機能実装済み（ロジック + UI + 複数ユーザー対応）
- 今後の改善候補: カード合成システム、ランキング、マルチプレイ
