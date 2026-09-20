import { Direction, Position } from "../game/types";
import { getImage } from "./assets";

const SOURCE_FRAME_SIZE = 20;
const SOURCE_FRAME_COUNT = 9;
const EMISSION_DISTANCE_TILES = 0.5;
const PUFF_LIFETIME_SECONDS = 0.36;
const PUFF_SIZE_TILES = 0.55;
const EMITTER_TRAIL_OFFSET_TILES = 0.25;
const PUFF_ALPHA = 0.75;

type SmokePuff = {
  position: Position;
  startedAtSeconds: number;
};

type ActorEffectState = {
  lastActorPosition: Position | null;
  distanceSinceEmission: number;
  puffs: SmokePuff[];
};

export type SpeedEffectInput = {
  actor: object;
  active: boolean;
  position: Position;
  direction: Direction;
  nowSeconds: number;
  cellSize: number;
};

const directionVector: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const createActorEffectState = (): ActorEffectState => ({
  lastActorPosition: null,
  distanceSinceEmission: 0,
  puffs: [],
});

const getEmitterPosition = (
  position: Position,
  direction: Direction,
): Position => {
  const vector = directionVector[direction];
  return {
    x: position.x + 0.5 - vector.x * EMITTER_TRAIL_OFFSET_TILES,
    y: position.y + 0.5 - vector.y * EMITTER_TRAIL_OFFSET_TILES,
  };
};

export const createSpeedEffectRenderer = () => {
  const actorStates = new WeakMap<object, ActorEffectState>();

  const drawActor = (
    context: CanvasRenderingContext2D,
    input: SpeedEffectInput,
  ): void => {
    const state = actorStates.get(input.actor) ?? createActorEffectState();
    actorStates.set(input.actor, state);
    state.puffs = state.puffs.filter(
      (puff) =>
        input.nowSeconds - puff.startedAtSeconds < PUFF_LIFETIME_SECONDS,
    );

    if (input.active) {
      const emitPuff = (position: Position) => {
        state.puffs.push({ position, startedAtSeconds: input.nowSeconds });
      };

      if (state.lastActorPosition === null) {
        emitPuff(getEmitterPosition(input.position, input.direction));
      } else {
        const deltaX = input.position.x - state.lastActorPosition.x;
        const deltaY = input.position.y - state.lastActorPosition.y;
        const distance = Math.hypot(deltaX, deltaY);
        let distanceToNextEmission =
          EMISSION_DISTANCE_TILES - state.distanceSinceEmission;

        // Carry incomplete spacing across frames, so each segment emits at fixed intervals.
        while (distance >= distanceToNextEmission) {
          const progress = distanceToNextEmission / distance;
          emitPuff(
            getEmitterPosition(
              {
                x: state.lastActorPosition.x + deltaX * progress,
                y: state.lastActorPosition.y + deltaY * progress,
              },
              input.direction,
            ),
          );
          distanceToNextEmission += EMISSION_DISTANCE_TILES;
        }
        state.distanceSinceEmission =
          (state.distanceSinceEmission + distance) % EMISSION_DISTANCE_TILES;
      }
      state.lastActorPosition = { ...input.position };
    } else {
      state.lastActorPosition = null;
      state.distanceSinceEmission = 0;
    }

    const puffSize = PUFF_SIZE_TILES * input.cellSize;
    state.puffs.forEach((puff) => {
      const progress = Math.max(
        0,
        Math.min(
          1,
          (input.nowSeconds - puff.startedAtSeconds) / PUFF_LIFETIME_SECONDS,
        ),
      );
      const frame = Math.min(
        SOURCE_FRAME_COUNT - 1,
        Math.floor(progress * SOURCE_FRAME_COUNT),
      );
      context.save();
      context.globalAlpha = PUFF_ALPHA * (1 - progress);
      context.drawImage(
        getImage("smokePuff"),
        frame * SOURCE_FRAME_SIZE,
        0,
        SOURCE_FRAME_SIZE,
        SOURCE_FRAME_SIZE,
        puff.position.x * input.cellSize - puffSize / 2,
        puff.position.y * input.cellSize - puffSize / 2,
        puffSize,
        puffSize,
      );
      context.restore();
    });
  };

  return { drawActor };
};
