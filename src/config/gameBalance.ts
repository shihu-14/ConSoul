import { PlayerType } from "../data/playerData";

interface PlayerBalanceConfig {
  readonly moveIntervalSeconds: number;
  readonly carrySlowdownPerItem: number;
  readonly detectionRangeTiles: number;
}

export const globalMovementSpeedMultiplier = 1.2;

export const playerBalance = {
  student: {
    moveIntervalSeconds: 0.35 / 1.75 / globalMovementSpeedMultiplier,
    carrySlowdownPerItem: 0.18,
    detectionRangeTiles: 15,
  },
  exorcist: {
    moveIntervalSeconds: 0.4 / 1.75 / globalMovementSpeedMultiplier,
    carrySlowdownPerItem: 0.12,
    detectionRangeTiles: 10,
  },
  monk: {
    moveIntervalSeconds: 0.45 / 1.75 / globalMovementSpeedMultiplier,
    carrySlowdownPerItem: 0.06,
    detectionRangeTiles: 7,
  },
} as const satisfies Record<PlayerType, PlayerBalanceConfig>;

export const playerActionBalance = {
  dashDistanceTiles: 3,
  dashSpeedMultiplier: 2,
  blockPushMoveIntervalSeconds: 0.12,
  stageTransitionDurationSeconds: 1,
} as const;

export const playerEnergyBalance = {
  maximumEnergy: 100,
  dashEnergyCost: 25,
  pushEnergyCost: 20,
  energyRecoveryPerSecond: 26,
} as const;

export const getPlayerMoveIntervalSeconds = (
  playerType: PlayerType,
  heldItemCount: number,
) =>
  playerBalance[playerType].moveIntervalSeconds *
  (1 + heldItemCount * playerBalance[playerType].carrySlowdownPerItem);

export const getPlayerDashMoveIntervalSeconds = (
  playerType: PlayerType,
  heldItemCount: number,
) =>
  getPlayerMoveIntervalSeconds(playerType, heldItemCount) /
  playerActionBalance.dashSpeedMultiplier;

export const getChaseMoveIntervalSeconds = () =>
  getPlayerMoveIntervalSeconds("exorcist", 0);

export type GridPosition = readonly [number, number];
export type EnemyType = "patrol" | "random" | "chase" | "charge";

export const enemyBehaviorBalance = {
  chaseAlertDurationSeconds: 0.18,
  chargeAlertDurationSeconds: 0.28,
  chargeBlockStunDurationSeconds: 0.6,
  chargeSpeedMultiplier: 0.4,
} as const;

export const enemyBaseMoveIntervalSeconds =
  0.45 / 1.75 / globalMovementSpeedMultiplier;

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
    enemyMoveIntervalSeconds: enemyBaseMoveIntervalSeconds,
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
    enemyMoveIntervalSeconds: enemyBaseMoveIntervalSeconds,
    enemies: [
      {
        type: "patrol",
        initialPosition: [1, 1],
        patrolRoute: [
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
          [6, 1],
          [6, 2],
          [6, 3],
          [5, 3],
          [5, 4],
          [4, 4],
          [3, 4],
          [2, 4],
          [1, 4],
          [1, 3],
          [1, 2],
        ],
      },
      { type: "random", initialPosition: [17, 18] },
      {
        type: "chase",
        initialPosition: [10, 18],
        chaseProbability: 0.82,
      },
      { type: "charge", initialPosition: [18, 1] },
    ],
  },
  {
    enemyMoveIntervalSeconds: enemyBaseMoveIntervalSeconds,
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
