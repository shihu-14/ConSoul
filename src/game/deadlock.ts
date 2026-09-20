import { getBlockedCellKeys, getNextPosition } from "./grid";
import { Direction, PlayerState, Position, StageState } from "./types";

const directions: readonly Direction[] = ["up", "down", "left", "right"];

/** 現在のBlock配置で、Playerが残りItemのどれかへ歩いて行けないか判定する。 */
export const isProgressImpossible = (
  stage: StageState,
  player: PlayerState,
): boolean => {
  if (stage.remainingItems.length === 0) return false;

  const cellKey = ({ x, y }: Readonly<Position>) => `${x},${y}`;
  const blocked = getBlockedCellKeys(stage);
  const reachable = new Set<string>([cellKey(player.position)]);
  const queue: Position[] = [player.position];
  for (let index = 0; index < queue.length; index += 1) {
    directions.forEach((direction) => {
      const next = getNextPosition(queue[index], direction);
      if (
        next.x < 0 ||
        next.y < 0 ||
        next.x >= stage.width ||
        next.y >= stage.height
      )
        return;
      const key = cellKey(next);
      if (blocked.has(key) || reachable.has(key)) return;
      reachable.add(key);
      queue.push(next);
    });
  }

  return stage.remainingItems.some(
    (item) => !reachable.has(cellKey(item.position)),
  );
};
