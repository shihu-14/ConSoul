/**
 * ゲーム全体で共有する実行状態の型を定義する．
 * types.ts
 */

/**
 * 盤面上の移動方向を表す．
 * input.ts，player.ts，enemy.ts
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * 選択可能なプレイヤー種別を表す．
 * game.ts，player.ts，renderGame.ts
 */
export type CharacterType = "student" | "exorcist" | "monk";

/**
 * ゲーム画面の現在モードを表す．
 * game.ts，main.ts，renderScreens.ts
 */
export type Mode = "title" | "game" | "stageTransition" | "result" | "gameOver";

/**
 * 移動完了済みの整数マス座標を表す．
 * stage.ts，player.ts，enemy.ts，renderGame.ts
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * 種類と盤面位置を持つアイテムを表す．
 * stage.ts，player.ts，renderGame.ts
 */
export type Item = {
  kind: number;
  position: Position;
};

/**
 * プレイヤーの実行中の状態を表す．
 * player.ts，game.ts，renderGame.ts
 */
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

/**
 * 種類ごとに必要な敵の実行状態を表す．
 * enemy.ts，pathfinding.ts，renderGame.ts
 */
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
      mode: "normal" | "alert" | "rush" | "stun";
      elapsedTime: number;
    };

/**
 * 外周壁と可動壁に共通する実行状態を表す．
 * stage.ts，player.ts，enemy.ts，renderGame.ts
 */
export type BlockState = {
  position: Position;
  movement: {
    direction: Direction;
    elapsedDistance: number;
  } | null;
};

/**
 * 現在ステージの変更可能な実行状態を表す．
 * stage.ts，game.ts，player.ts，enemy.ts
 */
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

/**
 * ゲーム進行全体の実行状態を表す．
 * game.ts，main.ts，renderGame.ts，renderScreens.ts
 */
export type GameState = {
  mode: Mode;
  modeStartedAtSeconds: number;
  stageIndex: number;
  stage: StageState;
  player: PlayerState;
  elapsedSeconds: number;
};
