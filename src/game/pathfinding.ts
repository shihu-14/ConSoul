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

/** Blockを避けて開始マスから目的地までの最短経路を1本返す。 */
export const findShortestPath = (
  stage: StageState,
  start: Readonly<Position>,
  target: Readonly<Position>,
): Position[] => {
  const keyOf = ({ x, y }: Readonly<Position>) => `${x},${y}`;
  const blocked = getBlockedCellKeys(stage);
  const startKey = keyOf(start);
  const targetKey = keyOf(target);
  if (blocked.has(startKey) || blocked.has(targetKey)) return [];

  const previous = new Map<string, Position | null>([[startKey, null]]);
  const queue: Position[] = [{ ...start }];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (keyOf(current) === targetKey) break;
    steps.forEach((step) => {
      const next = { x: current.x + step.x, y: current.y + step.y };
      const key = keyOf(next);
      if (
        next.x < 0 ||
        next.y < 0 ||
        next.x >= stage.width ||
        next.y >= stage.height ||
        blocked.has(key) ||
        previous.has(key)
      )
        return;
      previous.set(key, current);
      queue.push(next);
    });
  }
  if (!previous.has(targetKey)) return [];

  const path: Position[] = [{ ...target }];
  let current = path[0];
  while (keyOf(current) !== startKey) {
    const parent = previous.get(keyOf(current));
    if (!parent) throw new Error("経路の親マスが存在しない。");
    path.push(parent);
    current = parent;
  }
  return path.reverse();
};

/**
 * 目的地から逆向きにBFSを行い，開始地点から最短となる初動方向をすべて返す．
 * 盤面外，Blockの起点，移動中Blockの導出先を探索対象から除外し，同距離の方向は順序を保って返す．
 */
export const findShortestDirections = (
  stage: StageState,
  startPosition: Readonly<Position>,
  destinationPosition: Readonly<Position>,
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
    // queueの先頭から距離順にセルを取り出し，未訪問の隣接セルへ距離を記録する．
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
