import { stageBalance } from "../config/gameBalance";
import { GhostData } from "../data/ghostData";

export const createGhostsForStage = (
  stageIndex: number,
  nowSeconds: number,
): GhostData[] => {
  const stage = stageBalance[stageIndex];
  if (!stage) throw new Error(`Unknown stage index: ${stageIndex}`);

  return stage.enemies.map((enemy) => {
    const [x, y] = enemy.initialPosition;
    return {
      balance: {
        ...enemy,
        moveIntervalSeconds: stage.enemyMoveIntervalSeconds,
      },
      gx: x,
      gy: y,
      gtargetX: x,
      gtargetY: y,
      gpreX: x,
      gpreY: y,
      gstart: nowSeconds,
      gdirect: "gNone",
      patrolRouteIndex: 0,
      state: { kind: "normal" },
      activeMoveIntervalSeconds: stage.enemyMoveIntervalSeconds,
    };
  });
};
