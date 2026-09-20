/**
 * 実行時StageStateの元となる不変のStage定義．
 */

export type StageEnemySource =
  | {
      readonly type: "random";
      readonly position: readonly [number, number];
    }
  | {
      readonly type: "patrol";
      readonly position: readonly [number, number];
      readonly route: readonly (readonly [number, number])[];
    }
  | {
      readonly type: "chase";
      readonly position: readonly [number, number];
      readonly chaseProbability: number;
    }
  | {
      readonly type: "rush";
      readonly position: readonly [number, number];
    };

export type StageSource = {
  readonly grid: string;
  readonly items: readonly (readonly [number, number])[];
  readonly post: readonly [number, number];
  readonly playerStart: readonly [number, number];
  readonly enemies: readonly StageEnemySource[];
};

export const stageSources = [
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
#.B.B.BBBBB.BB.B...#
#...B..........B.B.#
#B..BB.BBBBBBBBB.B.#
#.B..............B.#
#..B..BBB..BBBBBBB.#
#...B..............#
####################
`.replace(/\n/g, ""),
    items: [
      [5, 5],
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
          [9, 5],
          [10, 5],
          [11, 5],
          [12, 5],
          [13, 5],
          [14, 5],
          [14, 6],
          [14, 7],
          [14, 8],
          [14, 9],
          [14, 10],
          [14, 11],
          [14, 12],
          [14, 13],
          [14, 14],
          [13, 14],
          [12, 14],
          [11, 14],
          [10, 14],
          [9, 14],
          [8, 14],
          [7, 14],
          [6, 14],
          [5, 14],
          [5, 13],
          [5, 12],
          [5, 11],
          [5, 10],
          [5, 9],
          [5, 8],
          [5, 7],
          [5, 6],
        ],
      },
      { type: "random", position: [1, 1] },
      { type: "chase", position: [18, 18], chaseProbability: 0.55 },
    ],
  },
  {
    grid: `
####################
#.......B..........#
#.BBBB...B..BBBB...#
#.BBBB....B....BB..#
#.BBBB.....B....B..#
#......BBB..B...B..#
#.....BBBBB..B..B..#
#BBB..........B....#
#B..BBB.....B..B...#
#.B....BBB......B..#
#..B......BBB....B.#
#...B..B.....BBB..B#
#.B..B...BB.....BBB#
#.B...B....B.BBB...#
#.BB...B...B.......#
#..BB...B..B.BBBBB.#
#...BB...B.......B.#
#....BB...B..BB..B.#
#..........B.......#
####################
`.replace(/\n/g, ""),
    items: [
      [1, 1],
      [17, 3],
      [3, 17],
      [18, 18],
    ],
    post: [8, 7],
    playerStart: [6, 7],
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
          [6, 4],
          [6, 5],
          [5, 5],
          [4, 5],
          [3, 5],
          [2, 5],
          [1, 5],
          [1, 4],
          [1, 3],
          [1, 2],
        ],
      },
      { type: "random", position: [17, 18] },
      { type: "chase", position: [1, 18], chaseProbability: 0.82 },
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

// ####################
// #..................#
// #.B.BB.B.B.BB.B.BB.#
// #.B.B..B.B..B.B..B.#
// #........BB.B.BB...#
// #.BBB.BB.B.......B.#
// #.B...BB...BB.BB.B.#
// #.B.B....B.B.......#
// #.B.B.B.BB.B.BBB.B.#
// #.B...B..B...B...B.#
// #...B..B...B...BBB.#
// #.BBBB...BBBBB.B...#
// #...B..B.......B.B.#
// #.B...BB.B.BBB.B.B.#
// #.B.B....B.B.......#
// #...B.B.BB.B.BBBBB.#
// #.BBB.B..........B.#
// #.B...BBB.B.BBBB.B.#
// #..................#
// ####################
