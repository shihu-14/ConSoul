import { PlayerType } from "../data/playerData";

interface PlayerBalanceConfig {
  readonly moveIntervalSeconds: number;
  readonly detectionRangeTiles: number;
}

export const playerBalance = {
  student: {
    moveIntervalSeconds: 0.35 / 1.75,
    detectionRangeTiles: 20,
  },
  exorcist: {
    moveIntervalSeconds: 0.4 / 1.75,
    detectionRangeTiles: 6,
  },
  monk: {
    moveIntervalSeconds: 0.45 / 1.75,
    detectionRangeTiles: 4,
  },
} as const satisfies Record<PlayerType, PlayerBalanceConfig>;

export const playerMovementBalance = {
  carrySlowdownPerItem: 0.15,
} as const;

export const playerActionBalance = {
  dashDistanceTiles: 2,
  dashMoveIntervalMultiplier: 0.5,
  dashCooldownSeconds: 0.8,
} as const;

export const getPlayerMoveIntervalSeconds = (
  playerType: PlayerType,
  heldItemCount: number,
) =>
  playerBalance[playerType].moveIntervalSeconds *
  (1 + heldItemCount * playerMovementBalance.carrySlowdownPerItem);

export type GridPosition = readonly [number, number];
export type EnemyType = "patrol" | "random" | "chase" | "charge";

export const enemyBehaviorBalance = {
  chaseAlertDurationSeconds: 0.18,
  chargeAlertDurationSeconds: 0.28,
  chargeBlockStunDurationSeconds: 0.6,
  chaseSpeedMultiplier: 1.1,
  chargeSpeedMultiplier: 0.4,
} as const;

interface BaseEnemyBalanceConfig {
  readonly type: EnemyType;
  readonly initialPosition: GridPosition;
}

export interface PatrolEnemyBalanceConfig extends BaseEnemyBalanceConfig {
  readonly type: "patrol";
  readonly patrolRoute: readonly GridPosition[];
}

export interface RandomEnemyBalanceConfig extends BaseEnemyBalanceConfig {
  readonly type: "random";
}

export interface ChaseEnemyBalanceConfig extends BaseEnemyBalanceConfig {
  readonly type: "chase";
  readonly chaseProbability: number;
}

export interface ChargeEnemyBalanceConfig extends BaseEnemyBalanceConfig {
  readonly type: "charge";
}

export type EnemyBalanceConfig =
  | PatrolEnemyBalanceConfig
  | RandomEnemyBalanceConfig
  | ChaseEnemyBalanceConfig
  | ChargeEnemyBalanceConfig;

export type GhostBalanceConfig = EnemyBalanceConfig & {
  readonly moveIntervalSeconds: number;
};

export interface StageBalanceConfig {
  readonly enemyMoveIntervalSeconds: number;
  readonly enemies: readonly EnemyBalanceConfig[];
}

export const stageBalance = [
  {
    enemyMoveIntervalSeconds: 0.4 / 1.75,
    enemies: [
      {
        type: "patrol",
        initialPosition: [5, 5],
        patrolRoute: [
          [5, 5],
          [6, 5],
          [7, 5],
          [8, 5],
          [8, 6],
          [8, 7],
          [7, 7],
          [7, 8],
          [7, 9],
          [7, 10],
          [7, 11],
          [6, 11],
          [5, 11],
          [5, 10],
          [5, 9],
          [5, 8],
          [5, 7],
          [5, 6],
        ],
      },
      { type: "random", initialPosition: [14, 5] },
      {
        type: "chase",
        initialPosition: [10, 18],
        chaseProbability: 0.55,
      },
    ],
  },
  {
    enemyMoveIntervalSeconds: 0.36 / 1.75,
    enemies: [
      {
        type: "patrol",
        initialPosition: [2, 2],
        patrolRoute: [
          [2, 2],
          [3, 2],
          [4, 2],
          [5, 2],
          [5, 3],
          [5, 4],
          [5, 5],
          [4, 5],
          [3, 5],
          [2, 5],
          [2, 4],
          [2, 3],
        ],
      },
      { type: "random", initialPosition: [23, 23] },
      {
        type: "chase",
        initialPosition: [13, 23],
        chaseProbability: 0.82,
      },
      { type: "charge", initialPosition: [20, 13] },
    ],
  },
  {
    enemyMoveIntervalSeconds: 0.32 / 1.75,
    enemies: [
      {
        type: "patrol",
        initialPosition: [7, 1],
        patrolRoute: [
          [7, 1],
          [8, 1],
          [9, 1],
          [10, 1],
          [10, 2],
          [10, 3],
          [10, 4],
          [10, 5],
          [9, 5],
          [9, 6],
          [8, 6],
          [7, 6],
          [7, 5],
          [7, 4],
          [7, 3],
          [7, 2],
        ],
      },
      { type: "random", initialPosition: [1, 18] },
      {
        type: "chase",
        initialPosition: [16, 18],
        chaseProbability: 0.82,
      },
      {
        type: "chase",
        initialPosition: [13, 5],
        chaseProbability: 0.96,
      },
      { type: "charge", initialPosition: [16, 1] },
    ],
  },
] as const satisfies readonly StageBalanceConfig[];
