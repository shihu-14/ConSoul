/**
 * ゲーム中に変化しない速度，時間，Energyの調整値を定義する．
 */

const GLOBAL_SPEED_MULTIPLIER = 1.2;

export const gameConfig = {
  globalSpeedMultiplier: GLOBAL_SPEED_MULTIPLIER,
  simulation: {
    maximumStepSeconds: 1 / 120,
    maximumCatchUpSeconds: 0.25,
  },
  player: {
    student: {
      moveIntervalSeconds: 0.35 / 1.75 / GLOBAL_SPEED_MULTIPLIER,
      carrySlowdownPerItem: 0.18,
      detectionRangeTiles: 15,
    },
    exorcist: {
      moveIntervalSeconds: 0.4 / 1.75 / GLOBAL_SPEED_MULTIPLIER,
      carrySlowdownPerItem: 0.12,
      detectionRangeTiles: 10,
    },
    monk: {
      moveIntervalSeconds: 0.45 / 1.75 / GLOBAL_SPEED_MULTIPLIER,
      carrySlowdownPerItem: 0.06,
      detectionRangeTiles: 7,
    },
  },
  action: {
    dashDistanceTiles: 3,
    dashSpeedMultiplier: 2,
    blockPushDurationSeconds: 0.12,
    stageTransitionSeconds: 1,
  },
  energy: {
    maximum: 100,
    dashCost: 25,
    pushCost: 20,
    recoveryPerSecond: 26,
  },
  enemy: {
    moveIntervalSeconds: 0.45 / 1.75 / GLOBAL_SPEED_MULTIPLIER,
    chaseAlertSeconds: 0.18,
    rushAlertSeconds: 0.28,
    rushBlockStunSeconds: 0.6,
    rushIntervalMultiplier: 0.4,
  },
} as const;

export const getPlayerSpeedTilesPerSecond = (
  characterType: keyof typeof gameConfig.player,
  heldItemCount: number,
) => {
  const balance = gameConfig.player[characterType];
  const interval =
    balance.moveIntervalSeconds *
    (1 + heldItemCount * balance.carrySlowdownPerItem);
  return 1 / interval;
};

export const getPlayerDashSpeedTilesPerSecond = (
  characterType: keyof typeof gameConfig.player,
) =>
  getPlayerSpeedTilesPerSecond(characterType, 0) *
  gameConfig.action.dashSpeedMultiplier;

export const getEnemySpeedTilesPerSecond = () =>
  1 / gameConfig.enemy.moveIntervalSeconds;

export const getChaseSpeedTilesPerSecond = () =>
  getPlayerSpeedTilesPerSecond("exorcist", 0);

export const getRushSpeedTilesPerSecond = () =>
  getEnemySpeedTilesPerSecond() / gameConfig.enemy.rushIntervalMultiplier;
