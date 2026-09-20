import { MovementEffectKind } from "../data/movementEffect";

interface MovementEffectConfig {
  readonly particleCount: number;
  readonly lifetimeSeconds: number;
  readonly color: string;
  readonly sizeTiles: number;
  readonly driftTilesPerSecond: number;
}

export const MAX_MOVEMENT_PARTICLES = 64;

export const movementEffectBalance = {
  dash: {
    particleCount: 4,
    lifetimeSeconds: 0.18,
    color: "#d8d8d8",
    sizeTiles: 0.14,
    driftTilesPerSecond: 0.7,
  },
  chase: {
    particleCount: 2,
    lifetimeSeconds: 0.22,
    color: "#f4dfa1",
    sizeTiles: 0.12,
    driftTilesPerSecond: 0.55,
  },
  charge: {
    particleCount: 5,
    lifetimeSeconds: 0.28,
    color: "#d66b58",
    sizeTiles: 0.18,
    driftTilesPerSecond: 0.9,
  },
} as const satisfies Record<MovementEffectKind, MovementEffectConfig>;
