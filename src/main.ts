import "./style.css";
import {
  getCurrentBlocks,
  getCurrentGhosts,
  getCurrentMap,
} from "./controller/stageController";
import { PlayerData } from "./data/playerData";
import { createPlayerInputState } from "./game/playerAction";
import { gameInitializer } from "./initializer/gameInitializer";
import { playerInitializer } from "./initializer/playerInitializer";
import {
  result2KeydownEvent,
  resultKeydownEvent,
  titleKeydownEvent,
} from "./initializer/screenInitializer";
import { ghostMover } from "./mover/ghostMover";
import { playerMover } from "./mover/playerMover";
import { ghostRender } from "./renderer/ghostRender";
import { inventoryRender } from "./renderer/inventoryRender";
import { mapRender } from "./renderer/mapRender";
import { playerRender } from "./renderer/playerRender";
import { resizeField } from "./renderer/resizeField";
import { blockRender } from "./renderer/blockRender";
import {
  result2Rrendering,
  resultRendering,
  titleRendering,
} from "./renderer/screenRenderer";
import { settings } from "./settings";

const Hackathon = () => {
  const canvas = document.getElementById("cnv") as HTMLCanvasElement;
  if (!canvas) throw new Error("Canvas not found");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not found");
  ctx.imageSmoothingEnabled = false;

  const playerData: PlayerData = {
    x: 10,
    y: 10,
    forward: "ArrowRight",
    targetX: 10,
    targetY: 10,
    preX: 1,
    preY: 1,
    start: 0,
    activeMoveIntervalSeconds: 0,
    movementState: { kind: "normal" },
    dashReadyAtSeconds: 0,
    heldItems: [],
    nouhin: 0,
    shurui: "student",
  };
  const playerInput = createPlayerInputState();
  let preMode = "title";

  playerInitializer(playerData, playerInput);
  titleKeydownEvent(playerData);
  resultKeydownEvent();
  result2KeydownEvent();

  const tick = () => {
    requestAnimationFrame(tick);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (settings.mode) {
      case "title": {
        titleRendering(ctx);
        break;
      }
      case "game": {
        if (preMode === "title") gameInitializer(playerData, playerInput);

        const currentMap = getCurrentMap();
        const currentGhosts = getCurrentGhosts();
        const currentBlocks = getCurrentBlocks();
        currentGhosts.forEach((ghost) => {
          ghostMover(ghost, currentMap, playerData, undefined, currentBlocks);
        });
        playerMover(
          playerData,
          currentMap,
          currentGhosts,
          playerInput,
          undefined,
          currentBlocks,
        );

        const renderMap = getCurrentMap();
        const renderGhosts = getCurrentGhosts();
        const renderBlocks = getCurrentBlocks();
        resizeField(ctx, () => {
          mapRender(renderMap, ctx);
          blockRender(renderBlocks, renderMap, ctx);
          playerRender(playerData, renderMap, ctx);
          renderGhosts.forEach((ghost) => {
            ghostRender(ghost, renderMap, ctx);
          });
        });
        inventoryRender(playerData, ctx);
        break;
      }
      case "result":
        resultRendering(ctx);
        break;
      case "result2":
        result2Rrendering(ctx);
        break;
      default:
        throw new Error("Unknown mode");
    }
    preMode = settings.mode;
  };

  tick();
};

Hackathon();
