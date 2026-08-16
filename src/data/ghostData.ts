import { GhostBalanceConfig } from "../config/gameBalance";
import { GhostState } from "../game/ghostState";

export type GhostDirection = "gUp" | "gDown" | "gLeft" | "gRight" | "gNone";

export interface GhostData {
  readonly balance: GhostBalanceConfig;
  gx: number;
  gy: number;
  gtargetX: number;
  gtargetY: number;
  gpreX: number;
  gpreY: number;
  gstart: number;
  gdirect: GhostDirection;
  patrolRouteIndex: number;
  state: GhostState;
  activeMoveIntervalSeconds: number;
}
