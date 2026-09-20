import {
  MAX_MOVEMENT_PARTICLES,
  movementEffectBalance,
} from "../config/visualEffects";
import {
  MovementEffectKind,
  MovementEffectState,
} from "../data/movementEffect";
import { GhostState } from "./ghostState";

const LATERAL_OFFSETS = [-0.18, -0.06, 0.06, 0.18, 0] as const;

export const createMovementEffectState = (): MovementEffectState => ({
  particles: [],
});

export const getGhostMovementEffectKind = (
  state: GhostState,
): MovementEffectKind | null => {
  if (state.kind === "chasing") return "chase";
  if (state.kind === "charging") return "charge";
  return null;
};

export const emitMovementEffect = (
  state: MovementEffectState,
  kind: MovementEffectKind,
  x: number,
  y: number,
  directionX: number,
  directionY: number,
  nowSeconds: number,
) => {
  const config = movementEffectBalance[kind];
  const originX = x + 0.5 - directionX * 0.25;
  const originY = y + 0.5 - directionY * 0.25;

  for (let index = 0; index < config.particleCount; index += 1) {
    const lateralOffset = LATERAL_OFFSETS[index];
    state.particles.push({
      kind,
      x: originX - directionY * lateralOffset,
      y: originY + directionX * lateralOffset,
      velocityX:
        -directionX * config.driftTilesPerSecond - directionY * lateralOffset,
      velocityY:
        -directionY * config.driftTilesPerSecond + directionX * lateralOffset,
      startedAtSeconds: nowSeconds,
      lifetimeSeconds: config.lifetimeSeconds,
      sizeTiles: config.sizeTiles,
    });
  }

  if (state.particles.length > MAX_MOVEMENT_PARTICLES) {
    state.particles.splice(0, state.particles.length - MAX_MOVEMENT_PARTICLES);
  }
};

export const pruneMovementEffects = (
  state: MovementEffectState,
  nowSeconds: number,
) => {
  state.particles = state.particles.filter(
    (particle) =>
      nowSeconds - particle.startedAtSeconds < particle.lifetimeSeconds,
  );
};
