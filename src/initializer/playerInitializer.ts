import { PlayerInputState } from "../data/playerInput";
import { CardinalPlayerDirection, PlayerData } from "../data/playerData";
import { queueForceIntent, queueStageRetry } from "../game/playerAction";
import { settings } from "../settings";

export const getPlayerDirectionForKey = (
  key: string,
): CardinalPlayerDirection | undefined => {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "ArrowUp";
    case "arrowdown":
    case "s":
      return "ArrowDown";
    case "arrowleft":
    case "a":
      return "ArrowLeft";
    case "arrowright":
    case "d":
      return "ArrowRight";
    default:
      return undefined;
  }
};

export const playerInitializer = (
  playerData: PlayerData,
  input: PlayerInputState,
) => {
  window.addEventListener("keydown", (e) => {
    if (settings.mode !== "game") return;
    const direction = getPlayerDirectionForKey(e.key);
    if (direction) {
      input.direction = direction;
      return;
    }
    if (e.key === " ") {
      queueForceIntent(
        input,
        playerData.forward,
        e.repeat,
        playerData.movementState.kind === "normal",
      );
    } else if (e.key.toLowerCase() === "r") {
      queueStageRetry(input, e.repeat);
    }
  });

  window.addEventListener("keyup", (e) => {
    const direction = getPlayerDirectionForKey(e.key);
    if (direction === input.direction) input.direction = "None";
  });
};
