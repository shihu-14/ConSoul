import { playerBalance } from "../config/gameBalance";
import { GhostData, GhostDirection } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";
import { CardinalGhostDirection } from "../game/ghostState";
import {
  BlockOccupancy,
  createBlockPositionSet,
  hasBlockAt,
  isOpenCell,
} from "../game/occupancy";
import { isWithinDetectionRange } from "../game/detection";

interface DirectionStep {
  readonly direction: Exclude<GhostDirection, "gNone">;
  readonly dx: number;
  readonly dy: number;
}

const directionSteps: readonly DirectionStep[] = [
  { direction: "gUp", dx: 0, dy: -1 },
  { direction: "gDown", dx: 0, dy: 1 },
  { direction: "gLeft", dx: -1, dy: 0 },
  { direction: "gRight", dx: 1, dy: 0 },
];

const oppositeDirection: Partial<Record<GhostDirection, GhostDirection>> = {
  gUp: "gDown",
  gDown: "gUp",
  gLeft: "gRight",
  gRight: "gLeft",
};

const chooseRandom = <T>(values: readonly T[], random: () => number): T => {
  const index = Math.min(
    Math.floor(random() * values.length),
    values.length - 1,
  );
  return values[Math.max(index, 0)];
};

const legalDirections = (
  ghost: GhostData,
  map: MapData,
  blocks: BlockOccupancy,
) =>
  directionSteps.filter(({ dx, dy }) =>
    isOpenCell(map, blocks, ghost.gtargetX + dx, ghost.gtargetY + dy),
  );

const chooseRandomDirection = (
  ghost: GhostData,
  map: MapData,
  random: () => number,
  blocks: BlockOccupancy,
) => {
  const legal = legalDirections(ghost, map, blocks);
  if (legal.length === 0) return "gNone";

  const reverse = oppositeDirection[ghost.gdirect];
  const forwardChoices = legal.filter(({ direction }) => direction !== reverse);
  return chooseRandom(
    forwardChoices.length > 0 ? forwardChoices : legal,
    random,
  ).direction;
};

const shortestDistance = (
  map: MapData,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  blocks: BlockOccupancy,
) => {
  if (startX === targetX && startY === targetY) return 0;

  const queue: Array<readonly [number, number, number]> = [[startX, startY, 0]];
  const visited = new Set([`${startX},${startY}`]);

  let head = 0;
  while (head < queue.length) {
    const [x, y, distance] = queue[head];
    let foundDistance: number | undefined;
    directionSteps.forEach(({ dx, dy }) => {
      const nextX = x + dx;
      const nextY = y + dy;
      const key = `${nextX},${nextY}`;
      if (!visited.has(key) && isOpenCell(map, blocks, nextX, nextY)) {
        if (nextX === targetX && nextY === targetY) {
          foundDistance = distance + 1;
        } else {
          visited.add(key);
          queue.push([nextX, nextY, distance + 1]);
        }
      }
    });
    if (foundDistance !== undefined) {
      return foundDistance;
    }
    head += 1;
  }

  return Number.POSITIVE_INFINITY;
};

const chooseChaseDirection = (
  ghost: GhostData,
  player: PlayerData,
  map: MapData,
  random: () => number,
  blocks: BlockOccupancy,
) => {
  const legal = legalDirections(ghost, map, blocks);
  const scored = legal.map((step) => ({
    step,
    distance: shortestDistance(
      map,
      ghost.gtargetX + step.dx,
      ghost.gtargetY + step.dy,
      player.preX,
      player.preY,
      blocks,
    ),
  }));
  const minimumDistance = Math.min(...scored.map(({ distance }) => distance));
  if (!Number.isFinite(minimumDistance)) {
    return chooseRandomDirection(ghost, map, random, blocks);
  }

  const shortest = scored.filter(
    ({ distance }) => distance === minimumDistance,
  );
  const reverse = oppositeDirection[ghost.gdirect];
  const nonReversing = legal.filter(({ direction }) => direction !== reverse);
  const isJunction = nonReversing.length > 1;
  const alternatives = scored.filter(
    ({ distance }) => Number.isFinite(distance) && distance > minimumDistance,
  );
  const chaseProbability =
    ghost.balance.type === "chase" ? ghost.balance.chaseProbability : 1;

  if (isJunction && alternatives.length > 0 && random() >= chaseProbability) {
    return chooseRandom(alternatives, random).step.direction;
  }

  return chooseRandom(shortest, random).step.direction;
};

const choosePatrolDirection = (
  ghost: GhostData,
  map: MapData,
  blocks: BlockOccupancy,
): GhostDirection => {
  if (ghost.balance.type !== "patrol") return "gNone";

  const route = ghost.balance.patrolRoute;
  const nextIndex = (ghost.patrolRouteIndex + 1) % route.length;
  const [nextX, nextY] = route[nextIndex];
  const step = directionSteps.find(
    ({ dx, dy }) =>
      ghost.gtargetX + dx === nextX && ghost.gtargetY + dy === nextY,
  );
  if (!step) throw new Error("Patrol route must use adjacent cells");
  if (!isOpenCell(map, blocks, nextX, nextY)) return "gNone";

  ghost.patrolRouteIndex = nextIndex;
  return step.direction;
};

const getLineOfSightDirection = (
  ghost: GhostData,
  player: PlayerData,
  map: MapData,
  blocks: BlockOccupancy,
): CardinalGhostDirection | undefined => {
  const dx = player.preX - ghost.gtargetX;
  const dy = player.preY - ghost.gtargetY;
  if (dx !== 0 && dy !== 0) return undefined;
  if (dx === 0 && dy === 0) return undefined;

  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  let x = ghost.gtargetX + stepX;
  let y = ghost.gtargetY + stepY;
  while (x !== player.preX || y !== player.preY) {
    if (!isOpenCell(map, blocks, x, y)) return undefined;
    x += stepX;
    y += stepY;
  }

  if (stepX < 0) return "gLeft";
  if (stepX > 0) return "gRight";
  return stepY < 0 ? "gUp" : "gDown";
};

const chooseChargeBehavior = (
  ghost: GhostData,
  player: PlayerData,
  map: MapData,
  random: () => number,
  blocks: BlockOccupancy,
) => {
  if (ghost.state.kind === "charging") {
    const chargeDirection = ghost.state.direction;
    const chargeStep = directionSteps.find(
      ({ direction }) => direction === chargeDirection,
    );
    if (
      chargeStep &&
      hasBlockAt(
        blocks,
        ghost.gtargetX + chargeStep.dx,
        ghost.gtargetY + chargeStep.dy,
      )
    ) {
      ghost.state = { kind: "stunned" };
      ghost.gdirect = "gNone";
      return;
    }
    if (
      chargeStep &&
      isOpenCell(
        map,
        blocks,
        ghost.gtargetX + chargeStep.dx,
        ghost.gtargetY + chargeStep.dy,
      )
    ) {
      ghost.gdirect = chargeStep.direction;
      return;
    }

    ghost.state = { kind: "normal" };
    ghost.gdirect = chooseRandomDirection(ghost, map, random, blocks);
    return;
  }

  if (ghost.state.kind === "alertingCharge") {
    ghost.state = {
      kind: "charging",
      direction: ghost.state.direction,
    };
    ghost.gdirect = ghost.state.direction;
    return;
  }

  if (ghost.state.kind === "stunned") {
    ghost.state = { kind: "normal" };
    ghost.gdirect = chooseRandomDirection(ghost, map, random, blocks);
    return;
  }

  const detectionRange = playerBalance[player.shurui].detectionRangeTiles;
  if (
    !isWithinDetectionRange(
      ghost.gtargetX,
      ghost.gtargetY,
      player.preX,
      player.preY,
      detectionRange,
    )
  ) {
    ghost.state = { kind: "normal" };
    ghost.gdirect = chooseRandomDirection(ghost, map, random, blocks);
    return;
  }

  const lineOfSightDirection = getLineOfSightDirection(
    ghost,
    player,
    map,
    blocks,
  );
  if (lineOfSightDirection) {
    ghost.state = {
      kind: "alertingCharge",
      direction: lineOfSightDirection,
    };
    ghost.gdirect = "gNone";
    return;
  }

  ghost.state = { kind: "normal" };
  ghost.gdirect = chooseRandomDirection(ghost, map, random, blocks);
};

export const ghostType = (
  ghost: GhostData,
  player: PlayerData,
  map: MapData,
  random = Math.random,
  blocks: BlockOccupancy = [],
) => {
  const occupiedBlocks = createBlockPositionSet(blocks);
  if (ghost.balance.type === "patrol") {
    ghost.state = { kind: "normal" };
    ghost.gdirect = choosePatrolDirection(ghost, map, occupiedBlocks);
    return;
  }

  if (ghost.balance.type === "charge") {
    chooseChargeBehavior(ghost, player, map, random, occupiedBlocks);
    return;
  }

  const detectionRange = playerBalance[player.shurui].detectionRangeTiles;
  const playerDetected = isWithinDetectionRange(
    ghost.gtargetX,
    ghost.gtargetY,
    player.preX,
    player.preY,
    detectionRange,
  );

  if (ghost.balance.type === "chase" && playerDetected) {
    if (ghost.state.kind === "normal") {
      ghost.state = { kind: "alertingChase" };
      ghost.gdirect = "gNone";
    } else {
      ghost.state = { kind: "chasing" };
      ghost.gdirect = chooseChaseDirection(
        ghost,
        player,
        map,
        random,
        occupiedBlocks,
      );
    }
  } else {
    ghost.state = { kind: "normal" };
    ghost.gdirect = chooseRandomDirection(ghost, map, random, occupiedBlocks);
  }
};
