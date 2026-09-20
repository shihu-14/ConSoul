export type GameSignal =
  | { type: "playerStep"; durationSeconds: number }
  | { type: "playerCreak" }
  | { type: "blockPush"; durationSeconds: number }
  | { type: "itemDeliver" }
  | { type: "chaseAlert" }
  | { type: "dash" }
  | { type: "itemPickup" };
