import { GhostDirection } from "../data/ghostData";

export type CardinalGhostDirection = Exclude<GhostDirection, "gNone">;

export type GhostState =
  | { kind: "normal" }
  | { kind: "alertingChase" }
  | { kind: "chasing" }
  | { kind: "alertingCharge"; direction: CardinalGhostDirection }
  | { kind: "charging"; direction: CardinalGhostDirection }
  | { kind: "stunned" };
