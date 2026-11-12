# Game Module Refactor Design

## Intent

ConSoulの既存機能とプレイ感を維持したまま，`src/game/`の責務と依存方向を明確にし，複数人が同時に変更しても衝突や波及が起きにくい構成へ整理する．

## Goals

- `game/`を`player/`，`enemy/`，`stage/`，`shared/`中心の構成へ再編する．
- 各モジュールの`index.ts`を公開APIとし，モジュール外から内部ファイルを直接参照しない．
- Playerの生成，移動・ダッシュ，Pushを含むアクション，アイテム管理を責務ごとに分ける．
- 複数のゲームモジュールが共有する型・設定・盤面計算・イベントを`shared/`へ集約する．
- 敵だけが使う行動共通処理や経路探索などは`enemy/`内部に置く．
- 描画，音声，入力，ゲームロジックの既存の境界を保つ．
- 既存挙動を代表ケースで固定する最小限の回帰テストを追加し，型チェック，Lint，フォーマット，ビルドを通す．

## Non-goals

- ゲームルール，難易度，速度，演出，音声タイミング，操作方法を変更しない．
- 状態をクラスへ置き換えない．
- 描画や音声の内部構成を今回の中心的な対象にしない．
- 将来用途だけを理由に抽象化層やインターフェースを増やさない．

## Anti-goals

- 旧importパスを維持するためだけの互換ファイルや再exportファイルを残さない．
- 1つの短い処理を形式的に別ファイルへ分けるなど，責務よりファイル数を優先しない．
- `index.ts`同士の相互参照や，ルート公開APIをゲーム内部から逆向きに参照する循環を作らない．
- 処理内容を言い換えるだけのコメントを増やさない．

## Constraints

- 既存の関数中心・ミュータブルな状態更新方式を維持する．
- 新規コメントは判断理由，仕様上の制約，直感に反する挙動だけに付ける．
- コメントは日本語とし，文末の句点を「．」へ統一する．
- ユーザーの未コミット変更である`src/game/types.ts`はインデントだけの変更であるため，型定義の意味を移行先へ保持し，最終的な空白はPrettierで正規化する．
- 既存の公開対象はブラウザアプリ内の呼び出し元であり，リポジトリ外利用者向けの旧パス互換性は提供しない．

## Approaches

### Selected: direct cutover to module public APIs

全呼び出し元を新しい`index.ts`経由へ一括で移し，移行後に旧ファイルを削除する．依存関係を一度で明確にでき，互換層や二重構成を残さないため，今回の保守性重視の目的に最も合う．

### Rejected: staged migration with compatibility re-exports

旧パスに再exportを残して段階移行する方法．変更量は一時的に小さくなるが，どちらが正規の入口か分かりにくくなり，不要ファイルを積極的に削除する方針と反する．

### Rejected: full domain model redesign

状態型の所有権や更新方式まで作り直す方法．境界はさらに厳密にできるが，ゲーム挙動を変えないリファクタリングとしては変更範囲と回帰リスクが大きすぎる．

## Target structure

```text
src/game/
  index.ts                 # UI層へ公開するゲーム全体のAPI
  game.ts                  # モード遷移と更新ループの調停
  input.ts                 # ブラウザ入力をゲーム操作へ変換
  player/
    index.ts               # Player公開API
    state.ts               # Player生成
    movement.ts            # 歩行・ダッシュ移動，回復，歩行イベント
    actions.ts             # ダッシュ・Pushの開始判定と消費エネルギー
    inventory.ts           # アイテム取得・配達
  enemy/
    index.ts               # 敵更新の公開API
    common.ts              # 敵行動だけで共有する更新器と判断処理
    pathfinding.ts         # 追跡敵だけが利用する経路探索
    random.ts
    patrol.ts
    chase.ts
    rush.ts
  stage/
    index.ts               # Stage公開API
    stage.ts               # Stage生成と原本検証
    sources.ts             # Stage原本
    blocks.ts              # 墓石のPush判定と移動
  shared/
    index.ts               # ゲーム内部の共有API
    types.ts               # モジュール間で受け渡す状態・値の型
    config.ts              # バランス値と速度計算
    events.ts              # ゲームロジックから外部へ渡すSignal
    grid.ts                # 座標・セル占有・表示位置・矩形衝突
```

既存の`src/game/player.ts`，`block.ts`，`stage.ts`，`stageSources.ts`，`grid.ts`，`config.ts`，`events.ts`，`types.ts`，`pathfinding.ts`は，新構成への移行完了後に削除する．`game.ts`と`input.ts`はルート調停役として残すが，外部からは`src/game/index.ts`のみを参照する．

## Dependency direction

```text
renderer / audio / tutorial / main
                 ↓
          game/index.ts
          ↙     ↓     ↘
      player   enemy   stage
          ↘     ↓     ↙
             shared
```

- `shared/`は他のゲームモジュールを参照しない．
- `stage/`は`shared/`だけを参照する．
- `enemy/`は`shared/`だけを参照し，敵固有の共通処理を外へ公開しない．
- `player/`は`shared/`とStageの公開APIを参照する．StageはPlayerを参照しないため循環しない．
- `game.ts`は各モジュールの`index.ts`を通じて更新を調停する．
- ゲーム外の層は`game/index.ts`から必要な関数と型だけを取得し，サブモジュールを直接参照しない．

## Public APIs

- `game/index.ts`: ゲーム生成・開始・更新・リトライ・アクション・タイトル復帰，入力登録・取得・リセット，描画と音声が必要とする型・設定・座標計算，ステージ数を公開する．
- `player/index.ts`: `createPlayer`，`updatePlayer`，`performPlayerAction`を公開する．
- `enemy/index.ts`: `updateEnemies`だけを公開する．行動実装と共通更新器は非公開にする．
- `stage/index.ts`: `createStage`，`getStageCount`，`validateStages`，`updateBlocks`，PlayerのPush判定に必要な`findTouchingBlock`と`tryStartPush`を公開する．`validateStages`はStage原本を編集するときの検証入口として維持する．
- `shared/index.ts`: ゲーム内部で共有する型，設定，Signal，盤面関数を公開する．ゲーム外の層はこの入口を直接使わない．

## Behavior preservation

現在テスト基盤がないため，Vitestを開発依存として追加し，移動前の実装に対して壊れやすい代表挙動だけを固定してからファイルを移す．E2Eテストは追加しない．

- ゲーム開始・リトライと長いフレームの追いつき時間上限．
- アイテム取得・配達と，静止時に墓石Pushをダッシュより優先するPlayer操作．
- Stage生成・不正原本の検証と，Chase敵の代表的な状態遷移．

テストは公開APIから状態を操作し，内部関数名やファイル配置に依存させない．モジュール境界はLint・型チェックと最終的なimport検索で確認する．

## Comment policy

既存コメントも変更箇所では句点を「．」へ揃える．コメントは，フレーム分割，移動中セルの占有，Push優先，移動方向確定タイミングなど，実装から理由が読み取りにくい制約に限定する．単純な生成・代入・分岐の説明は追加しない．

## Validation

- 回帰テストを旧構成で通し，新構成でも同じテストを通す．
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`は全変更後に1回だけ実行する．
- deep importと不要importが残っていないことを検索と構成テストで確認する．
- 最後に変更差分を確認し，未コミットだった`types.ts`の型定義が移行先に保持されていることを確認する．

## Builder calls

- Vitestのバージョンは既存のVite 8・TypeScript 5.9と互換性のある最新版を採用する．
- テストファイルは`src/game/**/*.test.ts`へ置き，現在の`tsconfig.json`とLint対象に含める．
- Stage原本の大きなデータは構造だけ移し，内容は変更しない．
- ファイル移動と責務分割は小さな検証単位で進め，挙動変更を伴う最適化は行わない．
