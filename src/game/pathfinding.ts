/**
 * 整数マス座標を使い，Blockを避ける最短経路を探索する．
 */

import { getBlockedCellKeys } from "./grid";
import { Direction, Position, StageState } from "./types";

const steps: ReadonlyArray<{
  direction: Direction;
  x: number;
  y: number;
}> = [
  { direction: "up", x: 0, y: -1 },
  { direction: "down", x: 0, y: 1 },
  { direction: "left", x: -1, y: 0 },
  { direction: "right", x: 1, y: 0 },
];

/**
 * 目的地から逆向きにBFSを行い，開始地点から最短となる初動方向をすべて返す．
 * 盤面外，Blockの起点，移動中Blockの導出先を探索対象から除外し，同距離の方向は順序を保って返す．
 */
export const findShortestDirections = (
  stage: StageState,
  startPosition: Position,
  destinationPosition: Position,
): Direction[] => {
  const start = startPosition;
  const target = destinationPosition;
  if (start.x === target.x && start.y === target.y) return [];

  const blocked = getBlockedCellKeys(stage);
  const targetKey = `${target.x},${target.y}`;
  const distances = new Map([[targetKey, 0]]);
  const queue = [{ x: target.x, y: target.y }];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    const currentDistance = distances.get(`${current.x},${current.y}`);
    if (currentDistance === undefined) throw new Error("BFS距離が存在しない。");
    steps.forEach((step) => {
      const x = current.x + step.x;
      const y = current.y + step.y;
      const key = `${x},${y}`;
      if (
        x < 0 ||
        y < 0 ||
        x >= stage.width ||
        y >= stage.height ||
        blocked.has(key) ||
        distances.has(key)
      ) {
        return;
      }
      distances.set(key, currentDistance + 1);
      queue.push({ x, y });
    });
  }

  const candidates = steps
    .map((step) => ({
      direction: step.direction,
      distance: distances.get(`${start.x + step.x},${start.y + step.y}`),
    }))
    .filter(
      (candidate): candidate is { direction: Direction; distance: number } =>
        candidate.distance !== undefined,
    );
  const shortestDistance = Math.min(
    ...candidates.map((candidate) => candidate.distance),
  );
  return candidates
    .filter((candidate) => candidate.distance === shortestDistance)
    .map((candidate) => candidate.direction);
};
