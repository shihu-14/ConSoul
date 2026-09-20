export type MovementEffectKind = "dash" | "chase" | "charge";

export interface MovementParticle {
  readonly kind: MovementEffectKind;
  readonly x: number;
  readonly y: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly startedAtSeconds: number;
  readonly lifetimeSeconds: number;
  readonly sizeTiles: number;
}

export interface MovementEffectState {
  particles: MovementParticle[];
}
