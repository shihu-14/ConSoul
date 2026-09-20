import { MapData } from "../data/mapData";
import { createInitialBlocks } from "./mapTemplate";

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
  const initialBlocks = createInitialBlocks(map);
  const initialBlockKeys = new Set(
    initialBlocks.map(({ x, y }) => `${x},${y}`),
  );

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

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = map.data[y * map.width + x];
      if (cell !== "#" && cell !== "B" && cell !== ".") {
        errors.push(`map has unknown cell '${cell}' at ${x},${y}`);
      }
      if (
        cell === "#" &&
        x > 0 &&
        y > 0 &&
        x < map.width - 1 &&
        y < map.height - 1
      ) {
        errors.push(`fixed wall is inside the boundary at ${x},${y}`);
      }
    }
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
    if (initialBlockKeys.has(`${x},${y}`)) {
      errors.push(`item ${index} overlaps a block`);
    }
  });
  if (!isWalkable(map, map.post[0], map.post[1])) {
    errors.push("post is not on a walkable cell");
  }
  if (initialBlockKeys.has(`${map.post[0]},${map.post[1]}`)) {
    errors.push("post overlaps a block");
  }
  if (!isWalkable(map, map.playerStart[0], map.playerStart[1])) {
    errors.push("player start is not on a walkable cell");
  }
  if (initialBlockKeys.has(`${map.playerStart[0]},${map.playerStart[1]}`)) {
    errors.push("player start overlaps a block");
  }

  return errors;
};
