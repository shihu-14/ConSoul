import { CardinalPlayerDirection, PlayerDirection } from "./playerData";

export type ForceIntent =
  | {
      readonly kind: "dash";
      readonly direction: CardinalPlayerDirection;
    }
  | {
      readonly kind: "grip";
      readonly blockDirection: CardinalPlayerDirection;
    }
  | {
      readonly kind: "pull";
      readonly blockDirection: CardinalPlayerDirection;
      readonly retreatDirection: CardinalPlayerDirection;
    };

export interface PlayerInputState {
  direction: PlayerDirection;
  spaceHeld: boolean;
  queuedForce: ForceIntent | null;
}
