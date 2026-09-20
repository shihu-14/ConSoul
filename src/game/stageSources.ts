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
#..............B...#
#.BBBBBBB.BBBB..B..#
#.B..............B.#
#.B.BBBBBBBBB.BB..B#
#.B.B..........B...#
#...B.BB.BBBBB.B.B.#
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
#..B..BBBB.BBBBBBB.#
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
      { type: "chase", position: [18, 18], chaseProbability: 0.75 },
    ],
  },
  {
    grid: `
####################
#.......B..........#
#.BBBB...B..BBBBB..#
#.BBBB....B......B.#
#.BBBB.....B..BB.B.#
#......BBB..B..B.B.#
#B....BBBBB..B...B.#
#BBB..........B..B.#
#B..BBB....BBB.B...#
#.B....BBB......B..#
#..B......BBB....B.#
#...B..BB....BBB..B#
#.B..B...BB.....BBB#
#.B...B....BBBB...B#
#.BB...B...B.......#
#..BB...B..B.BBBBB.#
#...BB...B.......B.#
#B...BB...B..BBB.B.#
#BB........B.......#
####################
`.replace(/\n/g, ""),
    items: [
      [1, 1],
      [17, 2],
      [2, 17],
      [18, 18],
    ],
    post: [8, 4],
    playerStart: [8, 7],
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
      { type: "chase", position: [3, 18], chaseProbability: 0.9 },
      { type: "rush", position: [18, 1] },
    ],
  },
  {
    grid: `
####################
#.B........BB......#
#.B.BBB.BB.BB..BBBB#
#.B.B...BB.BB......#
#.B.B.B.BB.BB.BBBB.#
#...B...B........B.#
#BB.B.B...B.BB.B...#
#.....BBBBB.BB.BBB.#
#.BBB.....B.B......#
#B....BBB......BBB.#
#BBBBBBBBBBBBBBBBBB#
#........B.....B...#
#.BBBB.B.B.BBB...B.#
#...BB.B.B...B.B...#
#.B......B.B.B.B.BB#
#.BBBB.........B...#
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
    post: [9, 15],
    playerStart: [8, 14],
    enemies: [
      { type: "chase", position: [18, 18], chaseProbability: 0.99 },
      { type: "chase", position: [13, 5], chaseProbability: 0.99 },
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
