# Renderer Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** タイトル，HUD，墓石描画に残る補正処理と過剰な定数を削減する．

**Architecture:** タイトルは画像と入力を一致させ，HUDは基準レイアウトだけを共有定数にする．墓石はフレーム単位の占有`Set`で前後関係を判定する．

**Tech Stack:** TypeScript 5.9，Canvas 2D，Vitest 4.1，ESLint 8

**Spec:** `docs/superpowers/specs/2026-11-13-renderer-simplification-design.md`

## Global Constraints

- 既存のモジュール構成と公開APIを維持する．
- `BlockState`へ描画専用状態を追加しない．
- コメントは設計理由だけを日本語で記述し，句点を「．」にする．
- 新規テスト，E2E，Buildは追加せず，既存単体テスト，型チェック，Lintだけを実行する．

## Review Focus

- タイトル画像の3・2・1がstudent・exorcist・monkへ対応すること．
- 削除したタイトル用画像への参照が残らないこと．
- HUDの座標とサイズが変更前と同じであること．
- 横移動中の墓石が移動先の列で苔の前後関係を判定すること．
- 墓石描画がBlock数に対して二重探索にならないこと．

---

### Task 1: Align title input and simplify HUD

**Files:**

- Modify: `src/game/input.ts`
- Modify: `src/renderer/assets.ts`
- Modify: `src/renderer/screens.ts`
- Modify: `src/renderer/hud.ts`
- Modify: `src/renderer/layout.ts`
- Delete: `src/assets/images/title-selection-numbers.png`

**Interfaces:**

- No public API changes．

- [ ] Reverse character key mapping to match the original title artwork.
- [ ] Delete title-number overlay rendering and its dedicated asset/reference.
- [ ] Keep only HUD and panel basis constants in `layout.ts`; inline local element adjustments in `hud.ts`.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: simplify title and hud rendering`.

### Task 2: Use occupied positions for block layering

**Files:**

- Modify: `src/renderer/block.ts`

**Interfaces:**

- No public API or GameState changes．

- [ ] Compute each block's layer position once per render.
- [ ] Build a numeric occupied-position `Set` and replace repeated full-block searches with `Set.has`.
- [ ] Preserve horizontal destination handling and moss visibility.
- [ ] Remove the single-use horizontal helper and redundant moss modulo.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Commit `refactor: simplify block layering lookup`.

### Task 3: Final audit

- [ ] Confirm deleted title asset and overlay symbols are absent.
- [ ] Confirm Renderer/Audio public APIs and `main.ts` are unchanged.
- [ ] Run `npm test && npm run typecheck && npm run lint`.
- [ ] Review `git diff --check` and final tree.
