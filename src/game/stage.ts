/**
 * ステージ原本を保持し，毎回独立した実行状態を生成する．
 */

import { BlockState, EnemyState, Position, StageState } from "./types";

const WIDTH = 20;
const HEIGHT = 20;

const stageSources = [
  {
    grid: `
####################
#..................#
#.BBBBBBB..BBBBBBB.#
#.B..............B.#
#.B.BBBBBBBBB.BB.B.#
#.B.B..........B.B.#
#...B.BB.BBBBB.B...#
#.B.B.B......B.B.B.#
#.B...B.BB.B...B.B.#
#.B.B.B.B..B.B.B.B.#
#.B.B.B.B..B.B.B.B.#
#.B.B...B.BB.B...B.#
#.B.B.B......B.B.B.#
#...B.BBBBB.BB.B...#
#.B.B..........B.B.#
#.B.BB.BBBBBBBBB.B.#
#.B..............B.#
#.BBBBBBB..BBBBBBB.#
#..................#
####################
`.replace(/\n/g, ""),
    items: [
      [3, 3],
      [16, 16],
      [18, 1],
      [1, 18],
    ],
    post: [9, 9],
    playerStart: [10, 10],
    enemies: [
      {
        type: "patrol",
        position: [5, 5],
        route: [
          [5, 5],
          [6, 5],
          [7, 5],
          [8, 5],
          [8, 6],
          [8, 7],
          [7, 7],
          [7, 8],
          [7, 9],
          [7, 10],
          [7, 11],
          [6, 11],
          [5, 11],
          [5, 10],
          [5, 9],
          [5, 8],
          [5, 7],
          [5, 6],
        ],
      },
      { type: "random", position: [14, 5] },
      { type: "chase", position: [10, 18], chaseProbability: 0.55 },
    ],
  },
  {
    grid: `
####################
#..................#
#.B.BB.B.B.BB.B.BB.#
#.B.B..B.B..B.B..B.#
#........BB.B.BB...#
#.BBB.BB.B.......B.#
#.B...BB...BB.BB.B.#
#.B.B....B.B.......#
#.B.B.B.BB.B.BBB.B.#
#.B...B..B...B...B.#
#...B..B...B...BBB.#
#.BBBB...BBBBB.B...#
#...B..B.......B.B.#
#.B...BB.B.BBB.B.B.#
#.B.B....B.B.......#
#...B.B.BB.B.BBBBB.#
#.BBB.B..........B.#
#.B...BBB.B.BBBB.B.#
#..................#
####################
`.replace(/\n/g, ""),
    items: [
      [1, 1],
      [16, 3],
      [3, 17],
      [18, 18],
    ],
    post: [10, 9],
    playerStart: [10, 10],
    enemies: [
      {
        type: "patrol",
        position: [1, 1],
        route: [
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
          [6, 1],
          [6, 2],
          [6, 3],
          [5, 3],
          [5, 4],
          [4, 4],
          [3, 4],
          [2, 4],
          [1, 4],
          [1, 3],
          [1, 2],
        ],
      },
      { type: "random", position: [17, 18] },
      { type: "chase", position: [10, 18], chaseProbability: 0.82 },
      { type: "rush", position: [18, 1] },
    ],
  },
  {
    grid: `
####################
#.B........BB.B....#
#.B.BBB.BB....B.BBB#
#.B.B...BB.BB......#
#.B.B.B.BB.BB.BBBB.#
#...B...B........B.#
#BB.BBB...B.BB.B...#
#.....BBBBB.BB.BBBB#
#.BBB.....B.B......#
#.....BBB...BBB.BB.#
#BBBB..B...BBBB.BB.#
#......B.B......BB.#
#.BBBB.B.BBBBB.....#
#...BB.B.B...B.B.BB#
#.B......B.B.B.B...#
#.BBBB.B.......B.B.#
#......BBBBBBB.B.B.#
#BBB.B.B....BB.B.B.#
#....B...BB......B.#
####################
`.replace(/\n/g, ""),
    items: [
      [1, 1],
      [18, 1],
      [1, 18],
      [18, 18],
    ],
    post: [10, 9],
    playerStart: [10, 10],
    enemies: [
      {
        type: "patrol",
        position: [7, 1],
        route: [
          [7, 1],
          [8, 1],
          [9, 1],
          [10, 1],
          [10, 2],
          [10, 3],
          [10, 4],
          [10, 5],
          [9, 5],
          [9, 6],
          [8, 6],
          [7, 6],
          [7, 5],
          [7, 4],
          [7, 3],
          [7, 2],
        ],
      },
      { type: "random", position: [1, 18] },
      { type: "chase", position: [16, 18], chaseProbability: 0.82 },
      { type: "chase", position: [13, 5], chaseProbability: 0.96 },
      { type: "rush", position: [16, 1] },
    ],
  },
] as const;

const toPosition = (value: readonly [number, number]): Position => ({
  x: value[0],
  y: value[1],
});

const createEnemy = (
  source: (typeof stageSources)[number]["enemies"][number],
): EnemyState => {
  const position = toPosition(source.position);
  switch (source.type) {
    case "random":
      return { type: "random", position, direction: null, movement: null };
    case "patrol":
      return {
        type: "patrol",
        position,
        direction: null,
        movement: null,
        route: source.route.map(toPosition),
        routeIndex: 0,
      };
    case "chase":
      return {
        type: "chase",
        position,
        direction: null,
        movement: null,
        chaseProbability: source.chaseProbability,
        mode: "normal",
        elapsedTime: 0,
      };
    case "rush":
      return {
        type: "rush",
        position,
        direction: null,
        movement: null,
        mode: "normal",
        elapsedTime: 0,
      };
    default:
      throw new Error("未知の敵種別です。");
  }
};

export const getStageCount = () => stageSources.length;

/**
 * 指定したStage番号から独立した実行時StageStateを作成する．
 * 原本の文字列と配列を直接再利用せず，Block，Item，Enemy，経路，座標をすべて複製して初期化する．
 */
export const createStage = (stageIndex: number): StageState => {
  const source = stageSources[stageIndex];
  if (!source) throw new Error(`ステージ${stageIndex + 1}は存在しません。`);

  // 変更不能な原本から全オブジェクトを作り直し，前回の移動座標やAI状態の参照を残さない．
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

export const validateStages = () => {
  const errors: string[] = [];
  stageSources.forEach((stage, stageIndex) => {
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
};
