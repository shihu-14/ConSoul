# Renderer State Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 墓石の描画情報をGame Logicから除き，Rendererの状態管理と重なり判定を単純化する．

**Architecture:** Blockはゲーム上の安定IDだけを持ち，Rendererが起動時シードとIDからスプライト番号を導出する．既存の横移動時の前後関係は，補正分岐ではなく描画用位置の単純な比較で維持する．

**Tech Stack:** TypeScript 5.9，Canvas 2D，Vitest 4.1，ESLint 8

**Spec:** `docs/superpowers/specs/2026-11-13-renderer-state-boundary-design.md`

## Global Constraints

- 既存のゲーム仕様・見た目・操作感を原則維持する．
- RendererはGameStateを変更しない．
- 既存の公開APIとファイル構成を維持する．
- 新しいクラス，E2Eテスト，大規模なテストを追加しない．
- コメントは設計理由だけを日本語で記述し，句点を「．」にする．

## Review Focus

- 同じStageを再生成してもBlock IDと墓石の見た目が変わらないこと．
- 墓石が移動してもIDと見た目が追従すること．
- 横押し中の前後関係が従来の判定と等価であること．
- RendererがBlockStateやStageStateを変更しないこと．
- タイトル画面の番号と入力割り当てが一致したままであること．

---

### Task 1: Move block appearance behind stable identity

**Files:**

- Modify: `src/game/shared/types.ts`
- Modify: `src/game/stage/stage.ts`
- Modify: `src/game/stage/stage.test.ts`
- Modify: `src/game/player/player.test.ts`
- Modify: `src/renderer/block.ts`

**Interfaces:**

- Produces: `BlockState.id: number`．
- Consumes: `GameState.stageIndex` and `BlockState.id` for Renderer-only appearance selection．

- [ ] Extend the existing Stage test to require stable, unique Block IDs across Stage recreation; run it and confirm RED.
- [ ] Replace `BlockState.sprite` with `BlockState.id` and assign the source grid index in `createStage`.
- [ ] Derive wall and moss variants in Renderer from a module-start seed, Stage index, and Block ID.
- [ ] Replace the horizontal overlap branches with one comparison using horizontal destination positions.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: keep block appearance in renderer`.

### Task 2: Clarify remaining visual adjustment values

**Files:**

- Modify: `src/renderer/hud.ts`
- Modify: `src/renderer/tutorial.ts`
- Modify: `src/renderer/enemy.ts`
- Review only: `src/renderer/screens.ts`
- Review only: `src/audio/manager.ts`

**Interfaces:**

- No public interface changes．

- [ ] Name the remaining tuned HUD, tutorial arrow, and enemy alert values without changing their values.
- [ ] Keep the title-number correction because removing it would make the artwork disagree with input mapping; do not add another abstraction.
- [ ] Keep audio playback values in the existing typed metadata because their role is already explicit.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: clarify renderer adjustment constants`.

### Task 3: Final audit

**Files:**

- Modify/Delete: only leftovers found by the audit.

- [ ] Confirm no drawing-only fields remain in GameState and no obsolete sprite maps exist.
- [ ] Confirm Renderer and Audio public APIs and main orchestration are unchanged.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Review `git diff --check` and push `refactor`.
