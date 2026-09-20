import { GhostData } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";

export const collectItemAtPlayerPosition = (
  player: PlayerData,
  map: MapData,
) => {
  const itemIndex = map.items.findIndex(
    ([x, y], index) =>
      player.preX === x && player.preY === y && map.exist[index],
  );
  if (itemIndex === -1) return false;

  map.exist[itemIndex] = false;
  player.heldItems.push(itemIndex);
  return true;
};

export const deliverItemAtPost = (player: PlayerData, map: MapData) => {
  const isAtPost = player.preX === map.post[0] && player.preY === map.post[1];
  if (!isAtPost || player.heldItems.length === 0) return false;

  player.nouhin += player.heldItems.length;
  player.heldItems = [];
  return true;
};

export const playerMeetsGhost = (player: PlayerData, ghost: GhostData) =>
  player.x < ghost.gx + 1 &&
  ghost.gx < player.x + 1 &&
  player.y < ghost.gy + 1 &&
  ghost.gy < player.y + 1;
