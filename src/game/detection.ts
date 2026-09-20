export const getManhattanDistanceTiles = (
  firstX: number,
  firstY: number,
  secondX: number,
  secondY: number,
) => Math.abs(firstX - secondX) + Math.abs(firstY - secondY);

export const isWithinDetectionRange = (
  firstX: number,
  firstY: number,
  secondX: number,
  secondY: number,
  rangeTiles: number,
) => getManhattanDistanceTiles(firstX, firstY, secondX, secondY) <= rangeTiles;
