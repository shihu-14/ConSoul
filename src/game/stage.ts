import { BlockState, EnemyState, Position, StageState } from "./types";
import {
  stageSources,
  type StageEnemySource,
  type StageSource,
} from "./stageSources";

const WIDTH = 20;
const HEIGHT = 20;

const toPosition = (value: readonly [number, number]): Position => ({
  x: value[0],
  y: value[1],
});

const createEnemy = (source: StageEnemySource): EnemyState => {
  const position = toPosition(source.position);
  if (source.type === "random") {
    return { type: "random", position, direction: null, movement: null };
  }
  if (source.type === "patrol") {
    return {
      type: "patrol",
      position,
      direction: null,
      movement: null,
      route: source.route.map(toPosition),
      routeIndex: 0,
    };
  }
  if (source.type === "chase") {
    return {
      type: "chase",
      position,
      direction: null,
      movement: null,
      chaseProbability: source.chaseProbability,
      mode: "normal",
      elapsedTime: 0,
    };
  }
  return {
    type: "rush",
    position,
    direction: null,
    movement: null,
    mode: "normal",
    elapsedTime: 0,
  };
};

export const getStageCount = () => stageSources.length;

export const createStage = (stageIndex: number): StageState => {
  const source = stageSources[stageIndex];
  if (!source) throw new Error(`ステージ${stageIndex + 1}は存在しません。`);

  // リトライ前の移動状態が残らないよう、原本から毎回作り直す。
  const blocks: BlockState[] = [];
  for (let index = 0; index < source.grid.length; index += 1) {
    if (source.grid[index] === "#" || source.grid[index] === "B") {
      blocks.push({
        position: { x: index % WIDTH, y: Math.floor(index / WIDTH) },
        movement: null,
      });
    }
  }

  return {
    width: WIDTH,
    height: HEIGHT,
    remainingItems: source.items.map((position, kind) => ({
      kind,
      position: toPosition(position),
    })),
    deliveredItems: [],
    post: toPosition(source.post),
    playerStart: toPosition(source.playerStart),
    enemies: source.enemies.map(createEnemy),
    blocks,
  };
};

const isInside = (position: readonly [number, number]) =>
  Number.isInteger(position[0]) &&
  Number.isInteger(position[1]) &&
  position[0] >= 0 &&
  position[1] >= 0 &&
  position[0] < WIDTH &&
  position[1] < HEIGHT;

export function validateStages(
  sources: readonly StageSource[] = stageSources,
): string[] {
  const errors: string[] = [];
  sources.forEach((stage, stageIndex) => {
    const validateWalkablePosition = (
      position: readonly [number, number],
      label: string,
    ) => {
      if (!isInside(position)) {
        errors.push(`Stage ${stageIndex + 1}の${label}が範囲外です。`);
        return;
      }
      if (stage.grid[position[1] * WIDTH + position[0]] !== ".") {
        errors.push(`Stage ${stageIndex + 1}の${label}が床にありません。`);
      }
    };
    if (stage.grid.length !== WIDTH * HEIGHT) {
      errors.push(`Stage ${stageIndex + 1}のセル数が不正です。`);
    }
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const cell = stage.grid[y * WIDTH + x];
        const boundary =
          x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
        if (cell !== "." && cell !== "#" && cell !== "B") {
          errors.push(
            `Stage ${stageIndex + 1}の${x},${y}に未知のセルがあります。`,
          );
        }
        if (boundary && cell !== "#") {
          errors.push(
            `Stage ${stageIndex + 1}の外周${x},${y}が壁ではありません。`,
          );
        }
        if (!boundary && cell === "#") {
          errors.push(
            `Stage ${stageIndex + 1}の内側${x},${y}に固定壁があります。`,
          );
        }
      }
    }
    stage.items.forEach((position, itemIndex) =>
      validateWalkablePosition(position, `Item ${itemIndex}`),
    );
    validateWalkablePosition(stage.post, "Post");
    validateWalkablePosition(stage.playerStart, "Player Start");
    stage.enemies.forEach((enemy) => {
      validateWalkablePosition(enemy.position, `${enemy.type} Enemy`);
      if (enemy.type === "patrol") {
        if (enemy.route.length === 0) {
          errors.push(`Stage ${stageIndex + 1}のPatrol Routeが空です。`);
          return;
        }
        const firstDestination = enemy.route[1 % enemy.route.length];
        if (
          Math.abs(enemy.position[0] - firstDestination[0]) +
            Math.abs(enemy.position[1] - firstDestination[1]) !==
          1
        ) {
          errors.push(
            `Stage ${stageIndex + 1}のPatrol Enemyから初回移動先が隣接していません。`,
          );
        }
        enemy.route.forEach((position, routeIndex) => {
          validateWalkablePosition(position, `Patrol Route ${routeIndex}`);
          const next = enemy.route[(routeIndex + 1) % enemy.route.length];
          if (
            Math.abs(position[0] - next[0]) +
              Math.abs(position[1] - next[1]) !==
            1
          ) {
            errors.push(
              `Stage ${stageIndex + 1}の巡回経路${routeIndex}が隣接していません。`,
            );
          }
        });
      }
    });
  });
  return errors;
}

const assertValidStageSources = () => {
  const errors = validateStages();
  if (errors.length > 0) {
    throw new Error(`Stage原本が不正です。\n${errors.join("\n")}`);
  }
};

assertValidStageSources();
