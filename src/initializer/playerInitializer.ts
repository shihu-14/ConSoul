import { PlayerInputState } from "../data/playerInput";
import { PlayerData } from "../data/playerData";
import {
  queueForceIntent,
  queuePullIntent,
  releaseForce,
} from "../game/playerAction";
import { settings } from "../settings";

const isArrowKey = (key: string) =>
  key === "ArrowUp" ||
  key === "ArrowDown" ||
  key === "ArrowLeft" ||
  key === "ArrowRight";

export const playerInitializer = (
  playerData: PlayerData,
  input: PlayerInputState,
) => {
  window.addEventListener("keydown", (e) => {
    if (settings.mode !== "game") return;
    switch (e.key) {
      case "ArrowUp":
        input.direction = "ArrowUp";
        queuePullIntent(input, "ArrowUp");
        break;
      case "ArrowDown":
        input.direction = "ArrowDown";
        queuePullIntent(input, "ArrowDown");
        break;
      case "ArrowLeft":
        input.direction = "ArrowLeft";
        queuePullIntent(input, "ArrowLeft");
        break;
      case "ArrowRight":
        input.direction = "ArrowRight";
        queuePullIntent(input, "ArrowRight");
        break;
      case " ":
        queueForceIntent(input, playerData.forward, e.repeat);
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === " ") {
      releaseForce(input);
      return;
    }
    if (!isArrowKey(e.key)) return;
    if (e.key === input.direction) input.direction = "None";
  });
};
