export type PlayerDirection =
  "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "None";
export type CardinalPlayerDirection = Exclude<PlayerDirection, "None">;
export type PlayerType = "student" | "monk" | "exorcist";

export type PlayerMovementState =
  | { kind: "normal" }
  | {
      kind: "dashing";
      direction: CardinalPlayerDirection;
      remainingTiles: number;
    };

export interface PlayerData {
  x: number;
  y: number;
  forward: CardinalPlayerDirection;
  targetX: number;
  targetY: number;
  preX: number;
  preY: number;
  start: number;
  activeMoveIntervalSeconds: number;
  movementState: PlayerMovementState;
  dashReadyAtSeconds: number;
  heldItems: number[];
  nouhin: number; // 納品したアイテムの数
  shurui: PlayerType;
}
