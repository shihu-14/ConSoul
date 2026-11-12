# Renderer and Audio Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 描画・音声・`main.ts`の責務を整理し，不要な状態引き継ぎと毎フレームの音声同期を削除する．

**Architecture:** RendererとAudioは各`index.ts`だけを外部公開する．墓石の表示番号とAction由来Signalはゲーム状態・ゲームイベントとして生成し，RendererとAudioは読み取り・再生だけを担う．

**Tech Stack:** TypeScript 5.9，Canvas 2D，HTMLAudioElement，Vitest 4.1，ESLint 8

**Spec:** `docs/superpowers/specs/2026-11-13-renderer-audio-refactor-design.md`

## Global Constraints

- 既存のゲーム仕様・見た目・操作感を原則維持する．
- 新しいクラス，E2Eテスト，描画スナップショット，大規模な単体テストを追加しない．
- 新規・変更コメントは設計理由だけを日本語で記述し，句点を「．」にする．
- 検証は既存単体テスト，型チェック，Lintだけとする．

## Review Focus

- リトライ後も墓石のスプライト番号が変わらず，移動中もBlock自身に追従すること．
- ダッシュ・Pushで従来と同じ効果音Signalと再生時間が1回だけ通知されること．
- BGMがゲーム開始・終了・画面遷移時だけ操作され，フレーム更新ごとに再操作されないこと．
- RendererがGameStateを変更せず，描画順と座標計算を維持すること．

---

### Task 1: Move visual identity and action sounds into game events

**Files:**
- Modify: `src/game/shared/types.ts`
- Modify: `src/game/stage/stage.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/player/player.test.ts`

**Interfaces:**
- Produces: `BlockState.sprite: { wallIndex: number; mossIndex: number }`．
- Produces: `performGameAction(game, direction): GameSignal[]`．

- [ ] Add precomputed per-Stage block sprite values at module load and copy them into every created BlockState.
- [ ] Convert `dash` and `push` Player results into existing `GameSignal` variants in `performGameAction`; return `[]` otherwise.
- [ ] Update existing test fixtures for the required BlockState field.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: move visual and audio events into game state`.

### Task 2: Reorganize Renderer behind a public API

**Files:**
- Create: `src/renderer/index.ts`
- Create: `src/renderer/game.ts`
- Create: `src/renderer/player.ts`
- Create: `src/renderer/enemy.ts`
- Create: `src/renderer/block.ts`
- Create: `src/renderer/stage.ts`
- Create: `src/renderer/hud.ts`
- Create: `src/renderer/effects.ts`
- Create: `src/renderer/tutorial.ts`
- Create: `src/renderer/screens.ts`
- Create: `src/renderer/layout.ts`
- Modify: `src/renderer/assets.ts`
- Delete: `src/renderer/renderActors.ts`
- Delete: `src/renderer/renderField.ts`
- Delete: `src/renderer/renderGame.ts`
- Delete: `src/renderer/renderHud.ts`
- Delete: `src/renderer/renderItems.ts`
- Delete: `src/renderer/renderScreens.ts`
- Delete: `src/renderer/renderTutorial.ts`
- Delete: `src/renderer/speedEffect.ts`
- Delete: `src/renderer/gameLayout.ts`

**Interfaces:**
- Produces from `renderer/index.ts`: `renderGame`，`renderTutorial`，`renderTitle`，`renderResult`，`renderGameOver`．

- [ ] Split actor, block, Stage, HUD, effect, tutorial, and screen drawing without changing draw order or source rectangles.
- [ ] Read block sprite indexes directly from BlockState and remove `WeakMap` and retry-copy logic.
- [ ] Move repeated atlas helpers into internal assets/layout helpers and name required adjustment constants.
- [ ] Delete old Renderer files after all internal imports use the new names.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: reorganize renderer modules`.

### Task 3: Narrow Audio API and simplify main orchestration

**Files:**
- Create: `src/audio/index.ts`
- Create: `src/audio/assets.ts`
- Create: `src/audio/manager.ts`
- Delete: `src/audio/audioAssets.ts`
- Delete: `src/audio/audioManager.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `playGameSignals(signals)`，`stopSoundEffects()`，`handleGameModeChange(mode)`．

- [ ] Keep the existing voice pool and playback metadata while removing unused retained node metadata.
- [ ] Export only the three Audio operations from `audio/index.ts`.
- [ ] Import Renderer only through `renderer/index.ts`; remove sprite-preservation and locally constructed dash/Push Signals.
- [ ] Compare modes before notifying Audio; call the mode handler immediately for input-triggered transitions and after update-triggered transitions.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: simplify audio and main orchestration`.

### Task 4: Final audit

**Files:**
- Modify/Delete: only leftovers found by the audit.

- [ ] Confirm no external deep imports enter `renderer/` or `audio/`.
- [ ] Confirm old files, compatibility shims, `preserveBlockSpritesOnRetry`, and `syncBgmMode` are absent.
- [ ] Run `npm test && npm run typecheck && npm run lint` once more.
- [ ] Review `git diff --check` and the final file tree.
