# Game Module Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ConSoulのゲーム挙動を変えずに，`src/game/`を公開API境界の明確な`player/`，`enemy/`，`stage/`，`shared/`中心の構成へ再編する．

**Architecture:** ゲーム外の層は`src/game/index.ts`だけを参照し，ゲーム内部は各モジュールの`index.ts`を介して一方向に依存する．共有状態型と汎用盤面処理は`shared/`，Player固有処理は`player/`，敵固有処理は`enemy/`，Stage生成と墓石処理は`stage/`に置き，ルート`game.ts`は調停だけを担う．

**Tech Stack:** TypeScript 5.9，Vite 8，Vitest 5.1，ESLint 8，Prettier 3

**Spec:** `docs/superpowers/specs/2026-11-12-game-module-refactor-design.md`

## Global Constraints

- ゲームルール，速度，エネルギー，Signal発生条件，描画，音声，入力の挙動を変更しない．
- 既存の関数中心・ミュータブルな状態更新方式を維持し，クラスを導入しない．
- モジュール外から内部実装ファイルを直接importしない．
- 旧パス互換用の再exportファイルは最終成果物に残さない．
- 新規・変更コメントは日本語とし，判断理由や非直感的な制約だけを記述し，句点を「．」へ統一する．
- `src/game/types.ts`の未コミット差分はインデントだけなので，型定義の意味を保持し，空白はPrettierで正規化する．
- 挙動変更を伴う最適化や，新しいゲーム機能は実施しない．
- 回帰テストは代表ケースに絞り，E2Eテストは追加しない．
- `npm run build`は全変更後の最終確認で1回だけ実行する．

## Review Focus

- タブ復帰相当の長いフレームで経過時間は加算される一方，位置シミュレーションは0.25秒までに制限されることをTask 1のGameテストで固定する．
- アイテム取得・配達とPush優先がPlayer分割後も変わらないことをTask 1のPlayerテストで固定する．
- Stageの不正原本拒否とChase敵のAlert遷移をTask 1のStage・Enemyテストで1ケースずつ固定する．

---

### Task 1: Add behavior-preserving regression coverage

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/game/game.test.ts`
- Create: `src/game/player/player.test.ts`
- Create: `src/game/stage/stage.test.ts`
- Create: `src/game/enemy/enemy.test.ts`

**Interfaces:**

- Consumes: 現在の`createGame`，`startGame`，`retryStage`，`returnToTitle`，`updateGame`，`createPlayer`，`updatePlayer`，`performPlayerAction`，`createStage`，`getStageCount`，`validateStages`，`findTouchingBlock`，`tryStartPush`，`updateBlocks`，`updateEnemies`．
- Produces: `npm test`で実行できる回帰テスト群．以降の全Taskはこのテストを変更後も通す．

- [ ] **Step 1: Install the test runner and add the test script**

Run: `npm install --save-dev vitest@5.1.0`

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write lifecycle and simulation characterization tests**

In `src/game/game.test.ts`, add these assertions against the current implementation:

```ts
expect(startGame(game, "student", 1)).toBe(true);
expect(game).toMatchObject({ mode: "game", stageIndex: 0, elapsedSeconds: 0 });
expect(retryStage(game, 2)).toBe(true);
expect(game.player.position).toEqual(game.stage.playerStart);

game.stage.remainingItems = [];
game.stage.deliveredItems = [{ kind: 0, position: { x: 1, y: 1 } }];
updateGame(game, null, 0, 3, () => 1);
expect(game.mode).toBe("stageTransition");
updateGame(game, null, gameConfig.action.stageTransitionSeconds, 4.5, () => 1);
expect(game).toMatchObject({ mode: "game", stageIndex: 1 });
```

Add `caps catch-up simulation while preserving elapsed time` using a custom empty Stage: after `updateGame(..., "right", 1, 1, () => 1)`, assert `elapsedSeconds === 1` and movement equals 0.25 seconds of student speed, not 1 second. Do not add screen-level or browser E2E coverage.

- [ ] **Step 3: Write Player movement, inventory, action, and frame-boundary tests**

In `src/game/player/player.test.ts`, cover:

```ts
expect(
  updatePlayer(player, stage, "right", oneCellSeconds, () => 1),
).toContainEqual({
  type: "itemPickup",
});
expect(player.position).toEqual({ x: 2, y: 1 });
expect(player.heldItems).toHaveLength(1);

expect(
  updatePlayer(player, stage, "right", carriedOneCellSeconds, () => 1),
).toContainEqual({
  type: "itemDeliver",
});
expect(player.heldItems).toEqual([]);
expect(stage.deliveredItems).toHaveLength(1);
```

Add one action test asserting that a touching movable block returns `push` before dash and deducts only the Push energy cost. This test plus the inventory test is the minimum Player coverage for the refactor.

- [ ] **Step 4: Write Stage and block characterization tests**

In `src/game/stage/stage.test.ts`, assert:

```ts
expect(createStage(0)).not.toBe(createStage(0));
expect(createStage(0).blocks.every((block) => block.movement === null)).toBe(
  true,
);
expect(validateStages()).toEqual([]);
expect(() => createStage(getStageCount())).toThrow("は存在しません");
```

Add one malformed `StageSource` fixture with the wrong grid length and assert the corresponding validation message. Do not duplicate Player's Push behavior here.

- [ ] **Step 5: Write deterministic Enemy characterization tests**

In `src/game/enemy/enemy.test.ts`, construct minimal stages and assert:

```ts
expect(updateEnemies(chaseStage, player, 0, () => 0)).toEqual([
  { type: "chaseAlert" },
]);
expect(chaseEnemy.mode).toBe("alert");

updateEnemies(chaseStage, player, gameConfig.enemy.chaseAlertSeconds, () => 0);
expect(chaseEnemy.mode).toBe("chase");
```

Keep this single Chase alert case as the representative Enemy regression test; do not add per-behavior exhaustive coverage.

- [ ] **Step 6: Run the baseline regression suite**

Run: `npm test`

Expected: all new tests PASS against the pre-refactor implementation.

- [ ] **Step 7: Run baseline static checks**

Run: `npm run typecheck && npm run lint`

Expected: PASS. `npm run format:check` is expected to continue reporting only the pre-existing `src/game/types.ts` indentation until Task 2 moves and normalizes it.

### Task 2: Establish shared contracts and the root public API

**Files:**

- Create: `src/game/shared/index.ts`
- Create: `src/game/shared/types.ts`
- Create: `src/game/shared/config.ts`
- Create: `src/game/shared/events.ts`
- Create: `src/game/shared/grid.ts`
- Create: `src/game/index.ts`
- Delete: `src/game/types.ts`
- Delete: `src/game/config.ts`
- Delete: `src/game/events.ts`
- Delete: `src/game/grid.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/input.ts`
- Modify: `src/game/player.ts`
- Modify: `src/game/block.ts`
- Modify: `src/game/stage.ts`
- Modify: `src/game/enemy/*.ts`
- Modify: `src/audio/audioManager.ts`
- Modify: `src/renderer/*.ts`
- Modify: `src/tutorial.ts`
- Modify: `src/main.ts`
- Modify: `src/game/game.test.ts`

**Interfaces:**

- Consumes: 既存の共有型，設定値，Signal，座標・衝突関数を挙動変更なしで移す．
- Produces: `shared/index.ts`から`Direction`，`CharacterType`，`Mode`，`Position`，`Item`，全State型，`GameSignal`，`gameConfig`，全速度関数，盤面関数をexportする．`game/index.ts`はゲーム外に必要な機能だけを再exportする．

- [ ] **Step 1: Point the Game test at the missing root facade**

Change `src/game/game.test.ts` imports from `./game` and other deep paths to `./index`.

Run: `npm test -- src/game/game.test.ts`

Expected: FAIL because `src/game/index.ts` does not exist.

- [ ] **Step 2: Move shared code behind `shared/index.ts`**

Move code without logic changes and export these exact groups:

```ts
export * from "./types";
export * from "./config";
export * from "./events";
export * from "./grid";
```

Update cross-module imports to reference `./shared` or `../shared`, never `shared/*` implementation files. Normalize moved comments to Japanese `．` punctuation.

- [ ] **Step 3: Add the root `game/index.ts` facade and cut over external consumers**

Export lifecycle functions from `./game`, input functions from `./input`, `getStageCount` from `./stage`, and only the types/config/grid functions required by `main.ts`, `tutorial.ts`, `audio/`, and `renderer/` from `./shared`.

Change all files outside `src/game/` to import from `./game` or `../game`. Do not import from `game/shared`.

- [ ] **Step 4: Delete the old shared files and verify the cutover**

Delete `types.ts`, `config.ts`, `events.ts`, and `grid.ts` after every reference has moved.

Run: `npm test && npm run typecheck && npm run lint`

Expected: PASS with no import of the deleted paths.

### Task 3: Move Stage and block behavior behind the Stage API

**Files:**

- Create: `src/game/stage/index.ts`
- Create: `src/game/stage/stage.ts`
- Create: `src/game/stage/sources.ts`
- Create: `src/game/stage/blocks.ts`
- Delete: `src/game/stage.ts`
- Delete: `src/game/stageSources.ts`
- Delete: `src/game/block.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/player.ts`
- Modify: `src/game/stage/stage.test.ts`

**Interfaces:**

- Consumes: `StageState`，`BlockState`，`Position`，`Direction`，盤面関数，`gameConfig`を`shared/index.ts`から取得する．`StageSource`と`StageEnemySource`は`stage/sources.ts`が所有する．
- Produces: `createStage(stageIndex: number): StageState`，`getStageCount(): number`，`validateStages(sources?: readonly StageSource[]): string[]`，`findTouchingBlock(position: Readonly<Position>, blocks: readonly BlockState[], direction: Direction, excluded?: ReadonlySet<BlockState>): BlockState | undefined`，`tryStartPush(stage: StageState, direction: Direction, firstBlock: BlockState): boolean`，`updateBlocks(stage: StageState, deltaSeconds: number): void`．

- [ ] **Step 1: Point Stage tests at the missing Stage API**

Change production imports in `src/game/stage/stage.test.ts` to `.` and shared contracts to `../shared`.

Run: `npm test -- src/game/stage/stage.test.ts`

Expected: FAIL because `src/game/stage/index.ts` does not exist.

- [ ] **Step 2: Move Stage source, creation, validation, and block logic**

Move `stageSources.ts` to `stage/sources.ts`, `stage.ts` to `stage/stage.ts`, and `block.ts` to `stage/blocks.ts`. Preserve the Stage source strings byte-for-byte apart from formatting around them. Keep creation and validation together because they share Stage dimensions and source contracts.

- [ ] **Step 3: Publish only the Stage module API and update consumers**

In `stage/index.ts`, export the interfaces listed above plus `StageSource` and `StageEnemySource` types needed by Stage-maintenance tests. Update `game.ts` and the current `player.ts` to import from `./stage`.

- [ ] **Step 4: Delete old Stage files and verify**

Run: `npm test && npm run typecheck && npm run lint`

Expected: PASS; root `stage.ts`, `stageSources.ts`, and `block.ts` no longer exist.

### Task 4: Contain Enemy-specific helpers inside the Enemy module

**Files:**

- Create: `src/game/enemy/pathfinding.ts`
- Delete: `src/game/pathfinding.ts`
- Modify: `src/game/enemy/index.ts`
- Modify: `src/game/enemy/common.ts`
- Modify: `src/game/enemy/random.ts`
- Modify: `src/game/enemy/patrol.ts`
- Modify: `src/game/enemy/chase.ts`
- Modify: `src/game/enemy/rush.ts`
- Modify: `src/game/enemy/enemy.test.ts`

**Interfaces:**

- Consumes: State型，設定，Signal，盤面関数を`../shared`から取得する．
- Produces: `enemy/index.ts`の公開APIは`updateEnemies(stage: StageState, player: PlayerState, deltaSeconds: number, random?: () => number): GameSignal[]`だけ．`EnemyBehavior`，行動実装，乱数選択，視線判定，経路探索はモジュール内部に留める．

- [ ] **Step 1: Move pathfinding into Enemy and update internal imports**

Move `pathfinding.ts` to `enemy/pathfinding.ts`. Update `chase.ts` to import it locally and update all Enemy files to use `../shared` rather than deleted root utilities.

- [ ] **Step 2: Confirm the Enemy public surface remains narrow**

Keep `enemy/index.ts` exporting only `updateEnemies`; tests import from `.` and observe state/Signals rather than importing behaviors.

- [ ] **Step 3: Delete the old pathfinding file and verify**

Run: `npm test -- src/game/enemy/enemy.test.ts && npm run typecheck && npm run lint`

Expected: PASS and `src/game/pathfinding.ts` is absent.

### Task 5: Split Player by responsibility

**Files:**

- Create: `src/game/player/index.ts`
- Create: `src/game/player/state.ts`
- Create: `src/game/player/inventory.ts`
- Create: `src/game/player/movement.ts`
- Create: `src/game/player/actions.ts`
- Delete: `src/game/player.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/player/player.test.ts`

**Interfaces:**

- Consumes: State型，設定，Signal，盤面関数を`../shared`から取得し，Push開始処理を`../stage`の公開APIから取得する．
- Produces: `createPlayer(characterType: CharacterType, logicalPosition: Readonly<Position>): PlayerState`，`updatePlayer(player: PlayerState, stage: StageState, moveDirection: Direction | null, deltaSeconds: number, random?: () => number): GameSignal[]`，`performPlayerAction(player: PlayerState, stage: StageState, direction: Direction): "ignored" | "insufficientEnergy" | "blocked" | "push" | "dash"`．

- [ ] **Step 1: Point Player tests at the missing Player API**

Change `src/game/player/player.test.ts` to import production functions from `.` and contracts from `../shared`.

Run: `npm test -- src/game/player/player.test.ts`

Expected: FAIL because `src/game/player/index.ts` does not exist.

- [ ] **Step 2: Extract Player creation and inventory**

Move `createPlayer` to `state.ts`. Move item collection, delivery, and Signal resolution to `inventory.ts`; export only the inventory resolver needed by `movement.ts` from that internal file.

- [ ] **Step 3: Extract movement and actions**

Move energy recovery, walk Signal generation, movement advancement, and `updatePlayer` to `movement.ts`. Move Push-priority and dash-start logic to `actions.ts`. Preserve `EPS`, elapsed-distance carryover, energy deduction order, and result literals exactly.

- [ ] **Step 4: Add the Player facade and delete the monolith**

Export only `createPlayer`, `updatePlayer`, and `performPlayerAction` from `player/index.ts`. Update `game.ts` to import `./player`, then delete root `player.ts`.

- [ ] **Step 5: Verify Player and full-game behavior**

Run: `npm test && npm run typecheck && npm run lint`

Expected: PASS; no production file imports a Player internal implementation directly from outside `player/`.

### Task 6: Audit module boundaries and remove leftovers

**Files:**

- Modify: any `src/**/*.ts` files still violating the public API boundary
- Delete: any obsolete source files revealed by the audit

**Interfaces:**

- Consumes: the final module tree and all TypeScript import declarations.
- Produces: a clean module tree with no external deep imports, cross-module internal imports, compatibility shims, or obsolete files.

- [ ] **Step 1: Audit imports and obsolete paths**

Use `rg -n 'from ["'"'].*game/' src` and `rg -n 'from ["'"']\.\./(player|enemy|stage|shared)/' src/game` to list boundary violations. Use `rg --files src/game` to compare the tree with the design.

- [ ] **Step 2: Remove all reported boundary violations and unused code**

Replace remaining deep imports with module APIs. Remove unused exports, imports, helpers, compatibility shims, and empty files. Use `rg` to confirm no deleted path names remain in imports.

- [ ] **Step 3: Normalize meaningful comments and formatting**

Change only touched comments that end with `。` to `．`, retaining comments that explain design constraints. Run `npx prettier --write package.json src/game src/audio/audioManager.ts src/renderer src/tutorial.ts src/main.ts docs/superpowers/specs/2026-11-12-game-module-refactor-design.md docs/superpowers/plans/2026-11-12-game-module-refactor.md` so unrelated repository files are not rewritten.

- [ ] **Step 4: Run the regression and static checks**

Run: `npm test && npm run typecheck && npm run lint && npm run format:check`

Expected: all commands PASS.

### Task 7: Final validation and single build

**Files:**

- Modify: only files required by failures found during final verification

**Interfaces:**

- Consumes: completed refactor and regression suite.
- Produces: buildable application with documented verification evidence and no obsolete code.

- [ ] **Step 1: Run tests and static checks from a clean command invocation**

Run: `npm test && npm run typecheck && npm run lint && npm run format:check`

Expected: every command exits 0 with no warnings attributable to source formatting or unresolved imports.

- [ ] **Step 2: Build the production bundle once**

Run: `npm run build`

Expected: `tsc --noEmit` and Vite production build both PASS. Do not run another build unless this command fails and a fix must be verified.

- [ ] **Step 3: Audit the final diff and tree**

Run: `git status --short`, `git diff --check`, and `rg --files src/game | sort`.

Confirm the final tree matches the design, old files are deleted, Stage source data and all numeric config values are unchanged, no compatibility shim remains, and the original `types.ts` definitions are present in `shared/types.ts`.

- [ ] **Step 4: Report the result**

Summarize the new structure, dependency direction, Player split, deleted files, added regression coverage, and the exact validation commands/results. Do not claim completion until all Step 2 commands have fresh passing output.
