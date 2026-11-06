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

// 目的地から距離を広げ、開始マスの隣だけを最後に比べる。
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
  const queue = [{ x: target.x, y: target.y, distance: 0 }];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head];
    head += 1;
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
      const distance = current.distance + 1;
      distances.set(key, distance);
      queue.push({ x, y, distance });
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
