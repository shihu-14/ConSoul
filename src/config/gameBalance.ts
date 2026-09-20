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
        initialPosition: [2, 4],
        patrolRoute: [
          [2, 4],
          [3, 4],
          [4, 4],
          [5, 4],
          [5, 5],
          [5, 6],
          [4, 6],
          [3, 6],
          [2, 6],
          [2, 5],
        ],
      },
      { type: "random", initialPosition: [22, 22] },
      {
        type: "chase",
        initialPosition: [12, 23],
        chaseProbability: 0.55,
      },
    ],
  },
  {
    enemyMoveIntervalSeconds: 0.36 / 1.75,
    enemies: [
      {
        type: "patrol",
        initialPosition: [2, 4],
        patrolRoute: [
          [2, 4],
          [3, 4],
          [4, 4],
          [5, 4],
          [6, 4],
          [6, 5],
          [6, 6],
          [5, 6],
          [4, 6],
          [3, 6],
          [2, 6],
          [2, 5],
        ],
      },
      { type: "random", initialPosition: [24, 24] },
      {
        type: "chase",
        initialPosition: [14, 24],
        chaseProbability: 0.82,
      },
      { type: "charge", initialPosition: [24, 12] },
    ],
  },
  {
    enemyMoveIntervalSeconds: 0.32 / 1.75,
    enemies: [
      {
        type: "patrol",
        initialPosition: [2, 4],
        patrolRoute: [
          [2, 4],
          [3, 4],
          [4, 4],
          [5, 4],
          [6, 4],
          [7, 4],
          [7, 5],
          [7, 6],
          [7, 7],
          [6, 7],
          [5, 7],
          [4, 7],
          [3, 7],
          [2, 7],
          [2, 6],
          [2, 5],
        ],
      },
      { type: "random", initialPosition: [26, 26] },
      {
        type: "chase",
        initialPosition: [14, 27],
        chaseProbability: 0.82,
      },
      {
        type: "chase",
        initialPosition: [25, 15],
        chaseProbability: 0.96,
      },
      { type: "charge", initialPosition: [27, 13] },
    ],
  },
] as const satisfies readonly StageBalanceConfig[];
