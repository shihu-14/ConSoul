import { describe, expect, it } from "vitest";
import { createStage, getStageCount, validateStages } from "../stage";
import { StageSource } from "../stageSources";

describe("stage", () => {
  it("creates independent state from a valid source", () => {
    const first = createStage(0);
    const second = createStage(0);

    expect(first).not.toBe(second);
    expect(first.blocks.every((block) => block.movement === null)).toBe(true);
    expect(validateStages()).toEqual([]);
    expect(() => createStage(getStageCount())).toThrow("は存在しません");
  });

  it("rejects a source with the wrong grid length", () => {
    const malformed: StageSource = {
      grid: "",
      items: [],
      post: [1, 1],
      playerStart: [1, 1],
      enemies: [],
    };

    expect(validateStages([malformed])).toContain("Stage 1のセル数が不正です。");
  });
});
