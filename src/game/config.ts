/**
 * ゲーム中に変化しない速度，時間，Energyの調整値を定義する．
 */

const GLOBAL_SPEED_MULTIPLIER = 1.2;

/**
 * ゲーム全体で共有する不変のバランス値を定義する．
 * Player，Enemy，Action，Energy，Audioの設定値をここへ集約し，実行中に変更しない．
 */
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
    blockPushDurationSeconds: 0.25,
    stageTransitionSeconds: 1.5,
  },
  energy: {
    maximum: 100,
    dashCost: 25,
    pushCost: 20,
    recoveryPerSecond: 26,
  },
  audio: {
    playerWalkDistanceTiles: 0.5,
    playerCreakProbability: 0.05,
  },
  enemy: {
    moveIntervalSeconds: 0.45 / 1.75 / GLOBAL_SPEED_MULTIPLIER,
    chaseAlertSeconds: 0.18,
    rushAlertSeconds: 0.56,
    rushRecoverySeconds: 0.56,
    rushBlockStunSeconds: 0.6,
    rushIntervalMultiplier: 0.4,
  },
} as const;

/**
 * キャラクター種別と所持Item数から通常歩行の速度をタイル毎秒で算出する．
 * 基本移動間隔に所持Item数に応じた減速率を掛け，その逆数を速度として返す．
 */
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

/**
 * キャラクター種別からDash速度をタイル毎秒で算出する．
 * 所持Itemによる減速を適用しない基本Player速度にDash倍率を掛ける．
 */
export const getPlayerDashSpeedTilesPerSecond = (
  characterType: keyof typeof gameConfig.player,
) =>
  getPlayerSpeedTilesPerSecond(characterType, 0) *
  gameConfig.action.dashSpeedMultiplier;

/**
 * 通常Enemyの速度をタイル毎秒で返す．
 */
export const getEnemySpeedTilesPerSecond = () =>
  1 / gameConfig.enemy.moveIntervalSeconds;

/**
 * Chase中のEnemy速度をタイル毎秒で返す．
 * 所持ItemがないExorcistの通常歩行速度をChase速度として共有する．
 */
export const getChaseSpeedTilesPerSecond = () =>
  getPlayerSpeedTilesPerSecond("exorcist", 0);

/**
 * Rush中のEnemy速度をタイル毎秒で返す．
 * 通常Enemy速度をRush間隔倍率で割り，通常より高速な移動速度を作る．
 */
export const getRushSpeedTilesPerSecond = () =>
  getEnemySpeedTilesPerSecond() / gameConfig.enemy.rushIntervalMultiplier;
