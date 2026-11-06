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
  displayPosition: Position;
  startedAtSeconds: number;
};

type ActorEffectState = {
  lastDisplayPosition: Position | null;
  distanceSinceEmission: number;
  puffs: SmokePuff[];
};

export type SpeedEffectInput = {
  actor: object;
  active: boolean;
  displayPosition: Readonly<Position>;
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
  lastDisplayPosition: null,
  distanceSinceEmission: 0,
  puffs: [],
});

const getEmitterPosition = (
  displayPosition: Readonly<Position>,
  direction: Direction,
): Position => {
  const vector = directionVector[direction];
  return {
    x: displayPosition.x + 0.5 - vector.x * EMITTER_TRAIL_OFFSET_TILES,
    y: displayPosition.y + 0.5 - vector.y * EMITTER_TRAIL_OFFSET_TILES,
  };
};

// 煙の状態は見た目だけのものなので、ゲーム状態には入れない。
export const createSpeedEffectRenderer = () => {
  const actorStates = new WeakMap<object, ActorEffectState>();

  const drawActor = (
    context: CanvasRenderingContext2D,
    input: SpeedEffectInput,
  ): void => {
    const state = actorStates.get(input.actor) ?? createActorEffectState();
    actorStates.set(input.actor, state);
    if (!input.active) {
      state.puffs = [];
      state.lastDisplayPosition = null;
      state.distanceSinceEmission = 0;
      return;
    }
    state.puffs = state.puffs.filter(
      (puff) =>
        input.nowSeconds - puff.startedAtSeconds < PUFF_LIFETIME_SECONDS,
    );

    const emitPuff = (displayPosition: Readonly<Position>) => {
      state.puffs.push({
        displayPosition: { ...displayPosition },
        startedAtSeconds: input.nowSeconds,
      });
    };

    if (state.lastDisplayPosition === null) {
      emitPuff(getEmitterPosition(input.displayPosition, input.direction));
    } else {
      const deltaX = input.displayPosition.x - state.lastDisplayPosition.x;
      const deltaY = input.displayPosition.y - state.lastDisplayPosition.y;
      const distance = Math.hypot(deltaX, deltaY);
      let distanceToNextEmission =
        EMISSION_DISTANCE_TILES - state.distanceSinceEmission;

      // フレームレートに関係なく、同じ移動距離ごとに煙を出す。
      while (distance >= distanceToNextEmission) {
        const progress = distanceToNextEmission / distance;
        emitPuff(
          getEmitterPosition(
            {
              x: state.lastDisplayPosition.x + deltaX * progress,
              y: state.lastDisplayPosition.y + deltaY * progress,
            },
            input.direction,
          ),
        );
        distanceToNextEmission += EMISSION_DISTANCE_TILES;
      }
      state.distanceSinceEmission =
        (state.distanceSinceEmission + distance) % EMISSION_DISTANCE_TILES;
    }
    state.lastDisplayPosition = { ...input.displayPosition };

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
        puff.displayPosition.x * input.cellSize - puffSize / 2,
        puff.displayPosition.y * input.cellSize - puffSize / 2,
        puffSize,
        puffSize,
      );
      context.restore();
    });
  };

  return { drawActor };
};
