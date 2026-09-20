import { PlayerInputState } from "../data/playerInput";
import { PlayerData } from "../data/playerData";
import { queueForceIntent } from "../game/playerAction";
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
        break;
      case "ArrowDown":
        input.direction = "ArrowDown";
        break;
      case "ArrowLeft":
        input.direction = "ArrowLeft";
        break;
      case "ArrowRight":
        input.direction = "ArrowRight";
        break;
      case " ":
        queueForceIntent(input, playerData.forward, e.repeat);
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (!isArrowKey(e.key)) return;
    if (e.key === input.direction) input.direction = "None";
  });
};
