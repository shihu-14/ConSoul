import { EnemyType } from "../config/gameBalance";
import { MapData } from "../data/mapData";
import { GhostData } from "../data/ghostData";
import { getImage } from "../imageloader/imageStore";

const GHOST_DIRECTION_SRC: Record<string, number[]> = {
  gUp: [64, 0, 64, 64],
  gDown: [128, 0, 64, 64],
  gLeft: [0, 0, 64, 64],
  gRight: [192, 0, 64, 64],
  gNone: [0, 0, 64, 64],
};
const GHOST_SHURUI_SRC: Record<EnemyType, number> = {
  patrol: 0,
  random: 0,
  chase: 64,
  charge: 128,
};

const getStateColor = (state: GhostData["state"]) => {
  if (state.kind === "alertingChase" || state.kind === "chasing") {
    return "#ffd400";
  }
  if (state.kind === "alertingCharge" || state.kind === "charging") {
    return "#ff3b30";
  }
  if (state.kind === "stunned") return "#9aa0a6";
  return undefined;
};

const renderStateOverlay = (
  ghostData: GhostData,
  ctx: CanvasRenderingContext2D,
  cellWidth: number,
  cellHeight: number,
  nowSeconds: number,
) => {
  const { gx, gy, state } = ghostData;
  const isBlinkVisible = Math.floor(nowSeconds * 8) % 2 === 0;
  const isAlerting =
    state.kind === "alertingChase" || state.kind === "alertingCharge";
  if (isAlerting && !isBlinkVisible) return;

  const color = getStateColor(state);
  if (!color) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, Math.min(cellWidth, cellHeight) * 0.08);
  ctx.strokeRect(
    gx * cellWidth + 2,
    gy * cellHeight + 2,
    cellWidth - 4,
    cellHeight - 4,
  );
  ctx.font = `bold ${Math.max(12, cellHeight * 0.32)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (state.kind === "alertingChase") {
    ctx.fillText("!", (gx + 0.5) * cellWidth, (gy + 0.2) * cellHeight);
  } else if (state.kind === "alertingCharge") {
    ctx.fillText("!!", (gx + 0.5) * cellWidth, (gy + 0.2) * cellHeight);
  } else if (state.kind === "stunned") {
    ctx.fillText("✦", (gx + 0.5) * cellWidth, (gy + 0.2) * cellHeight);
  }
  if (state.kind === "alertingCharge" || state.kind === "charging") {
    const centerX = (gx + 0.5) * cellWidth;
    const centerY = (gy + 0.5) * cellHeight;
    const length = Math.min(cellWidth, cellHeight) * 0.35;
    const vector = {
      gUp: [0, -length],
      gDown: [0, length],
      gLeft: [-length, 0],
      gRight: [length, 0],
    }[state.direction];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + vector[0], centerY + vector[1]);
    ctx.stroke();
  }
  ctx.restore();
};

export const ghostRender = (
  ghostData: GhostData,
  mapData: MapData,
  ctx: CanvasRenderingContext2D,
  nowSeconds = performance.now() / 1000,
) => {
  const { gx, gy } = ghostData;
  const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
  const dx = canvasWidth / mapData.width;
  const dy = canvasHeight / mapData.height;
  const playerImage = getImage("ghost");
  const [xSrc, ySrc, wSrc, hSrc] = GHOST_DIRECTION_SRC[ghostData.gdirect];
  ctx.drawImage(
    playerImage,
    xSrc,
    GHOST_SHURUI_SRC[ghostData.balance.type] + ySrc,
    wSrc,
    hSrc,
    gx * dx,
    gy * dy,
    dx,
    dy,
  );

  const time = nowSeconds * 4;
  const id = Math.floor(time) % 3;
  ctx.drawImage(
    getImage("heartAnimation"),
    id * 64,
    0,
    64,
    64,
    gx * dx,
    gy * dy,
    dx,
    dy,
  );
  renderStateOverlay(ghostData, ctx, dx, dy, nowSeconds);
};
