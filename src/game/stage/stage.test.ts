import { describe, expect, it } from "vitest";
import { StageSource, createStage, getStageCount, validateStages } from ".";

describe("stage", () => {
  it("creates independent state from a valid source", () => {
    const first = createStage(0);
    const second = createStage(0);
    const firstBlockIds = first.blocks.map((block) => block.id);
    const secondBlockIds = second.blocks.map((block) => block.id);

    expect(first).not.toBe(second);
    expect(first.blocks.every((block) => block.movement === null)).toBe(true);
    expect(firstBlockIds).toEqual(secondBlockIds);
    expect(new Set(firstBlockIds).size).toBe(first.blocks.length);
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

    expect(validateStages([malformed])).toContain(
      "Stage 1のセル数が不正です。",
    );
  });
});
