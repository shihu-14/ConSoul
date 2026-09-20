/**
 * ステージ原本を保持し，毎回独立した実行状態を生成する．
 */

import { BlockState, EnemyState, Position, StageState } from "./types";
import {
  stageSources,
  type StageEnemySource,
  type StageSource,
} from "./stageSources";

const WIDTH = 20;
const HEIGHT = 20;

/**
 * 原本のタプル座標を実行時のPositionオブジェクトへ変換する．
 */
const toPosition = (value: readonly [number, number]): Position => ({
  x: value[0],
  y: value[1],
});

/**
 * Stage原本のEnemy定義を実行時のEnemyStateへ変換する．
 * 種別ごとの初期モード，方向，移動状態，巡回経路を新しいオブジェクトとして作成する．
 */
const createEnemy = (source: StageEnemySource): EnemyState => {
  const position = toPosition(source.position);
  switch (source.type) {
    case "random":
      return { type: "random", position, direction: null, movement: null };
    case "patrol":
      return {
        type: "patrol",
        position,
        direction: null,
        movement: null,
        route: source.route.map(toPosition),
        routeIndex: 0,
      };
    case "chase":
      return {
        type: "chase",
        position,
        direction: null,
        movement: null,
        chaseProbability: source.chaseProbability,
        mode: "normal",
        elapsedTime: 0,
      };
    case "rush":
      return {
        type: "rush",
        position,
        direction: null,
        movement: null,
        mode: "normal",
        elapsedTime: 0,
      };
    default:
      throw new Error("未知の敵種別です。");
  }
};

let stageSourcesValidated = false;
let stageSourcesValidationError: Error | null = null;

/**
 * 本番のStage原本を初回だけ検証し，成功または失敗の結果を保持する．
 * 失敗時は保持したErrorを再throwし，不正な原本からStageStateを生成しない不変条件を守る．
 */
const ensureValidStageSources = () => {
  if (stageSourcesValidated) {
    if (stageSourcesValidationError) throw stageSourcesValidationError;
    return;
  }
  // 公開APIをまとめるため，検証関数は実行時ファクトリの下に定義する．
  // eslint-disable-next-line no-use-before-define
  const errors = validateStages();
  stageSourcesValidated = true;
  if (errors.length > 0) {
    stageSourcesValidationError = new Error(
      `Stage原本が不正です。\n${errors.join("\n")}`,
    );
    throw stageSourcesValidationError;
  }
};

/**
 * 定義済みStageの総数を返す．
 */
export const getStageCount = () => stageSources.length;

/**
 * 指定したStage番号から独立した実行時StageStateを作成する．
 * 原本の文字列と配列を直接再利用せず，Block，Item，Enemy，経路，座標をすべて複製して初期化する．
 */
export const createStage = (stageIndex: number): StageState => {
  ensureValidStageSources();
  const source = stageSources[stageIndex];
  if (!source) throw new Error(`ステージ${stageIndex + 1}は存在しません。`);

  // 変更不能な原本から全オブジェクトを作り直し，前回の移動座標やAI状態の参照を残さない．
  const blocks: BlockState[] = [];
  for (let index = 0; index < source.grid.length; index += 1) {
    if (source.grid[index] === "#" || source.grid[index] === "B") {
      blocks.push({
        position: { x: index % WIDTH, y: Math.floor(index / WIDTH) },
        movement: null,
      });
    }
  }

  return {
    width: WIDTH,
    height: HEIGHT,
    remainingItems: source.items.map((position, kind) => ({
      kind,
      position: toPosition(position),
    })),
    deliveredItems: [],
    post: toPosition(source.post),
    playerStart: toPosition(source.playerStart),
    enemies: source.enemies.map(createEnemy),
    blocks,
  };
};

/**
 * 原本の座標が20×20のStage範囲内にある整数座標か判定する．
 */
const isInside = (position: readonly [number, number]) =>
  Number.isInteger(position[0]) &&
  Number.isInteger(position[1]) &&
  position[0] >= 0 &&
  position[1] >= 0 &&
  position[0] < WIDTH &&
  position[1] < HEIGHT;

/**
 * 全Stageの原本データがゲームの前提条件を満たすか検証する．
 * 盤面サイズ，セル種別，外周壁，配置座標，巡回経路の隣接性を確認し，エラー一覧を返す．
 */
export function validateStages(
  sources: readonly StageSource[] = stageSources,
): string[] {
  const errors: string[] = [];
  sources.forEach((stage, stageIndex) => {
    /**
     * Stage原本内の配置座標が範囲内かつ床セルかを検証する．
     */
    const validateWalkablePosition = (
      position: readonly [number, number],
      label: string,
    ) => {
      if (!isInside(position)) {
        errors.push(`Stage ${stageIndex + 1}の${label}が範囲外です。`);
        return;
      }
      if (stage.grid[position[1] * WIDTH + position[0]] !== ".") {
        errors.push(`Stage ${stageIndex + 1}の${label}が床にありません。`);
      }
    };
    if (stage.grid.length !== WIDTH * HEIGHT) {
      errors.push(`Stage ${stageIndex + 1}のセル数が不正です。`);
    }
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const cell = stage.grid[y * WIDTH + x];
        const boundary =
          x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
        if (cell !== "." && cell !== "#" && cell !== "B") {
          errors.push(
            `Stage ${stageIndex + 1}の${x},${y}に未知のセルがあります。`,
          );
        }
        if (boundary && cell !== "#") {
          errors.push(
            `Stage ${stageIndex + 1}の外周${x},${y}が壁ではありません。`,
          );
        }
        if (!boundary && cell === "#") {
          errors.push(
            `Stage ${stageIndex + 1}の内側${x},${y}に固定壁があります。`,
          );
        }
      }
    }
    stage.items.forEach((position, itemIndex) =>
      validateWalkablePosition(position, `Item ${itemIndex}`),
    );
    validateWalkablePosition(stage.post, "Post");
    validateWalkablePosition(stage.playerStart, "Player Start");
    stage.enemies.forEach((enemy) => {
      validateWalkablePosition(enemy.position, `${enemy.type} Enemy`);
      if (enemy.type === "patrol") {
        if (enemy.route.length === 0) {
          errors.push(`Stage ${stageIndex + 1}のPatrol Routeが空です。`);
          return;
        }
        const firstDestination = enemy.route[1 % enemy.route.length];
        if (
          Math.abs(enemy.position[0] - firstDestination[0]) +
            Math.abs(enemy.position[1] - firstDestination[1]) !==
          1
        ) {
          errors.push(
            `Stage ${stageIndex + 1}のPatrol Enemyから初回移動先が隣接していません。`,
          );
        }
        enemy.route.forEach((position, routeIndex) => {
          validateWalkablePosition(position, `Patrol Route ${routeIndex}`);
          const next = enemy.route[(routeIndex + 1) % enemy.route.length];
          if (
            Math.abs(position[0] - next[0]) +
              Math.abs(position[1] - next[1]) !==
            1
          ) {
            errors.push(
              `Stage ${stageIndex + 1}の巡回経路${routeIndex}が隣接していません。`,
            );
          }
        });
      }
    });
  });
  return errors;
}
