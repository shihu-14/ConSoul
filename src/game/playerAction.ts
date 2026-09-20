import { PlayerInputState } from "../data/playerInput";
import { CardinalPlayerDirection, PlayerDirection } from "../data/playerData";

export const createPlayerInputState = (): PlayerInputState => ({
  direction: "None",
  spaceHeld: false,
  queuedForce: null,
});

export const resetPlayerInputState = (input: PlayerInputState) => {
  input.direction = "None";
  input.spaceHeld = false;
  input.queuedForce = null;
};

export const isCardinalPlayerDirection = (
  direction: PlayerDirection,
): direction is CardinalPlayerDirection => direction !== "None";

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

export const queueForceIntent = (
  input: PlayerInputState,
  forward: CardinalPlayerDirection,
  isRepeat: boolean,
) => {
  if (isRepeat || input.queuedForce) return false;
  input.spaceHeld = true;
  input.queuedForce = {
    kind: "grip",
    blockDirection: isCardinalPlayerDirection(input.direction)
      ? input.direction
      : forward,
  };
  return true;
};

const isOppositeDirection = (
  first: CardinalPlayerDirection,
  second: CardinalPlayerDirection,
) => {
  const [firstX, firstY] = getPlayerDirectionDelta(first);
  const [secondX, secondY] = getPlayerDirectionDelta(second);
  return firstX + secondX === 0 && firstY + secondY === 0;
};

export const queuePullIntent = (
  input: PlayerInputState,
  retreatDirection: CardinalPlayerDirection,
) => {
  if (
    !input.spaceHeld ||
    input.queuedForce?.kind !== "grip" ||
    !isOppositeDirection(input.queuedForce.blockDirection, retreatDirection)
  ) {
    return false;
  }
  input.queuedForce = {
    kind: "pull",
    blockDirection: input.queuedForce.blockDirection,
    retreatDirection,
  };
  return true;
};

export const releaseForce = (input: PlayerInputState) => {
  input.spaceHeld = false;
};
