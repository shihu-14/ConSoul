import { CardinalPlayerDirection, PlayerDirection } from "./playerData";

export interface ForceIntent {
  readonly direction: CardinalPlayerDirection;
}

export interface PlayerInputState {
  direction: PlayerDirection;
  queuedForce: ForceIntent | null;
  retryRequested: boolean;
}
