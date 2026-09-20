import { PlayerInputState } from "../data/playerInput";
import { CardinalPlayerDirection, PlayerDirection } from "../data/playerData";

export const createPlayerInputState = (): PlayerInputState => ({
  direction: "None",
  queuedForce: null,
});

export const isCardinalPlayerDirection = (
  direction: PlayerDirection,
): direction is CardinalPlayerDirection => direction !== "None";

export const queueForceIntent = (
  input: PlayerInputState,
  forward: CardinalPlayerDirection,
  isRepeat: boolean,
) => {
  if (isRepeat || input.queuedForce) return false;
  input.queuedForce = {
    direction: isCardinalPlayerDirection(input.direction)
      ? input.direction
      : forward,
  };
  return true;
};

export const getPlayerDirectionDelta = (
  direction: CardinalPlayerDirection,
): readonly [number, number] => {
  switch (direction) {
    case "ArrowUp":
      return [0, -1];
    case "ArrowDown":
      return [0, 1];
    case "ArrowLeft":
      return [-1, 0];
    case "ArrowRight":
      return [1, 0];
    default:
      throw new Error("Unknown player direction");
  }
};
