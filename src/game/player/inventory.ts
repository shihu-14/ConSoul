import { GameSignal, PlayerState, StageState, positionsEqual } from "../shared";

const collectItems = (player: PlayerState, stage: StageState) => {
  const collected = stage.remainingItems.filter((item) =>
    positionsEqual(player.position, item.position),
  );
  if (collected.length === 0) return false;
  const collectedSet = new Set(collected);
  stage.remainingItems = stage.remainingItems.filter(
    (item) => !collectedSet.has(item),
  );
  player.heldItems.push(...collected);
  return true;
};

const deliverItems = (player: PlayerState, stage: StageState) => {
  if (
    player.heldItems.length === 0 ||
    !positionsEqual(player.position, stage.post)
  ) {
    return false;
  }
  stage.deliveredItems.push(...player.heldItems);
  player.heldItems = [];
  return true;
};

export const resolvePlayerItems = (
  player: PlayerState,
  stage: StageState,
  signals: GameSignal[],
): void => {
  if (collectItems(player, stage)) signals.push({ type: "itemPickup" });
  if (deliverItems(player, stage)) signals.push({ type: "itemDeliver" });
};
