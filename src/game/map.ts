import { MapData } from "../data/mapData";

export const isInBounds = (map: MapData, x: number, y: number) =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  x >= 0 &&
  y >= 0 &&
  x < map.width &&
  y < map.height;

export const isWalkable = (map: MapData, x: number, y: number) =>
  isInBounds(map, x, y) && map.data[y * map.width + x] !== "#";

export const getMapValidationErrors = (map: MapData) => {
  const errors: string[] = [];

  if (map.data.length !== map.width * map.height) {
    errors.push(
      `map data has ${map.data.length} cells; expected ${map.width * map.height}`,
    );
  }
  if (map.exist.length !== map.items.length) {
    errors.push(
      `map has ${map.items.length} items but ${map.exist.length} existence flags`,
    );
  }
  if (map.items.length > 4) {
    errors.push("map has more than the four-item HUD capacity");
  }

  for (let x = 0; x < map.width; x += 1) {
    if (
      map.data[x] !== "#" ||
      map.data[(map.height - 1) * map.width + x] !== "#"
    ) {
      errors.push(`map boundary is open at column ${x}`);
    }
  }
  for (let y = 0; y < map.height; y += 1) {
    if (
      map.data[y * map.width] !== "#" ||
      map.data[y * map.width + map.width - 1] !== "#"
    ) {
      errors.push(`map boundary is open at row ${y}`);
    }
  }

  map.items.forEach(([x, y], index) => {
    if (!isWalkable(map, x, y))
      errors.push(`item ${index} is not on a walkable cell`);
  });
  if (!isWalkable(map, map.post[0], map.post[1])) {
    errors.push("post is not on a walkable cell");
  }
  if (!isWalkable(map, map.playerStart[0], map.playerStart[1])) {
    errors.push("player start is not on a walkable cell");
  }
  map.initialBlockPositions.forEach(([x, y], index) => {
    if (!isWalkable(map, x, y)) {
      errors.push(`block ${index} is not on a walkable cell`);
    }
    if (map.post[0] === x && map.post[1] === y) {
      errors.push(`block ${index} overlaps the post`);
    }
    if (map.playerStart[0] === x && map.playerStart[1] === y) {
      errors.push(`block ${index} overlaps the player start`);
    }
    if (map.items.some(([itemX, itemY]) => itemX === x && itemY === y)) {
      errors.push(`block ${index} overlaps an item`);
    }
    if (
      map.initialBlockPositions.some(
        ([otherX, otherY], otherIndex) =>
          otherIndex < index && otherX === x && otherY === y,
      )
    ) {
      errors.push(`block ${index} overlaps another block`);
    }
  });

  return errors;
};
