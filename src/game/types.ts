export type Direction = "up" | "down" | "left" | "right";

export type CharacterType = "student" | "exorcist" | "monk";

export type Mode = "title" | "game" | "stageTransition" | "result" | "gameOver";

export type Position = {
  x: number;
  y: number;
};

export type Item = {
  kind: number;
  position: Position;
};

export type PlayerState = {
  position: Position;
  direction: Direction;
  characterType: CharacterType;
  movement:
    | null
    | {
        type: "walk";
        elapsedDistance: number;
      }
    | {
        type: "dash";
        elapsedDistance: number;
        remainingCells: number;
      };
  energy: number;
  heldItems: Item[];
};

export type EnemyState =
  | {
      type: "random";
      position: Position;
      direction: Direction | null;
      movement: { elapsedDistance: number } | null;
    }
  | {
      type: "patrol";
      position: Position;
      direction: Direction | null;
      movement: { elapsedDistance: number } | null;
      route: Position[];
      routeIndex: number;
    }
  | {
      type: "chase";
      position: Position;
      direction: Direction | null;
      movement: { elapsedDistance: number } | null;
      chaseProbability: number;
      mode: "normal" | "alert" | "chase";
      elapsedTime: number;
    }
  | {
      type: "rush";
      position: Position;
      direction: Direction | null;
      movement: { elapsedDistance: number } | null;
      mode: "normal" | "alert" | "rush" | "stun" | "recover";
      elapsedTime: number;
    };

export type BlockState = {
  position: Position;
  movement: {
    direction: Direction;
    elapsedDistance: number;
    durationSeconds: number;
  } | null;
};

export type StageState = {
  width: number;
  height: number;
  remainingItems: Item[];
  deliveredItems: Item[];
  post: Position;
  playerStart: Position;
  enemies: EnemyState[];
  blocks: BlockState[];
};

export type GameState = {
  mode: Mode;
  modeStartedAtSeconds: number;
  stageIndex: number;
  stage: StageState;
  player: PlayerState;
  elapsedSeconds: number;
};
