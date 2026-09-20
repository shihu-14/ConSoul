export interface MapData {
  width: number;
  height: number;
  data: string;
  items: number[][];
  exist: boolean[];
  post: number[];
  playerStart: readonly [number, number];
}

export const mapData1: MapData = {
  data: `
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
  width: 20,
  height: 20,
  items: [
    [3, 3],
    [16, 16],
    [18, 1],
    [1, 18],
  ],
  exist: [true, true, true, true],
  post: [9, 9],
  playerStart: [10, 10],
};

export const mapData2: MapData = {
  data: `
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
  width: 20,
  height: 20,
  items: [
    [1, 1],
    [16, 3],
    [3, 17],
    [18, 18],
  ],
  exist: [true, true, true, true],
  post: [10, 9],
  playerStart: [10, 10],
};

export const mapData3: MapData = {
  data: `
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
  width: 20,
  height: 20,
  items: [
    [1, 1],
    [18, 1],
    [1, 18],
    [18, 18],
  ],
  exist: [true, true, true, true],
  post: [10, 9],
  playerStart: [10, 10],
};
