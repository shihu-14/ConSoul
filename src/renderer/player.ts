import { GameState, gameConfig, getDisplayPosition, Position } from "../game";
import { getDirectionSource, getImage } from "./assets";
import { drawActorSpeedEffect } from "./effects";
import { FIELD_SIZE, getCellSize } from "./layout";

const CHARACTER_SOURCE_Y = { student: 64, monk: 128, exorcist: 0 } as const;
const ENERGY_BAR_WIDTH_TILES = 1.25;
const ENERGY_BAR_HEIGHT_TILES = 0.12;
const ENERGY_BAR_GAP_TILES = 0.08;
const ENERGY_BAR_MINIMUM_HEIGHT = 5;
const ENERGY_BAR_FIELD_PADDING = 2;
const ENERGY_BAR_STROKE_TILES = 0.04;

export const getPlayerEnergyBarLayout = (
  game: GameState,
  displayPosition: Readonly<Position>,
) => {
  const cellSize = getCellSize(game);
  const width = cellSize * ENERGY_BAR_WIDTH_TILES;
  const height = Math.max(
    ENERGY_BAR_MINIMUM_HEIGHT,
    cellSize * ENERGY_BAR_HEIGHT_TILES,
  );
  return {
    width,
    height,
    x: Math.max(
      ENERGY_BAR_FIELD_PADDING,
      Math.min(
        FIELD_SIZE - width - ENERGY_BAR_FIELD_PADDING,
        (displayPosition.x + 0.5) * cellSize - width / 2,
      ),
    ),
    y: Math.max(
      ENERGY_BAR_FIELD_PADDING,
      displayPosition.y * cellSize - height - cellSize * ENERGY_BAR_GAP_TILES,
    ),
  };
};

export const renderPlayer = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  context.save();
  const cellSize = getCellSize(game);
  const { player } = game;
  const displayPosition = getDisplayPosition(
    player.position,
    player.movement ? player.direction : null,
    player.movement?.elapsedDistance ?? 0,
  );
  drawActorSpeedEffect(context, {
    actor: player,
    active: player.movement?.type === "dash",
    displayPosition,
    direction: player.direction,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] = getDirectionSource(
    player.direction,
  );
  context.drawImage(
    getImage("player"),
    sourceX,
    CHARACTER_SOURCE_Y[player.characterType] + sourceY,
    sourceWidth,
    sourceHeight,
    displayPosition.x * cellSize,
    displayPosition.y * cellSize,
    cellSize,
    cellSize,
  );
  const bar = getPlayerEnergyBarLayout(game, displayPosition);
  const energyRatio = Math.max(
    0,
    Math.min(1, player.energy / gameConfig.energy.maximum),
  );
  context.fillStyle = "#1b1b1b";
  context.fillRect(bar.x, bar.y, bar.width, bar.height);
  context.fillStyle = "#f59e0b";
  context.fillRect(bar.x, bar.y, bar.width * energyRatio, bar.height);
  context.strokeStyle = "#000000";
  context.lineWidth = Math.max(1, cellSize * ENERGY_BAR_STROKE_TILES);
  context.strokeRect(bar.x, bar.y, bar.width, bar.height);
  context.restore();
};
