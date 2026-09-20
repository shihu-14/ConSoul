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

const renderStateOverlay = (
  ghostData: GhostData,
  ctx: CanvasRenderingContext2D,
  cellWidth: number,
  cellHeight: number,
) => {
  const { gx, gy, state } = ghostData;
  let label: string | undefined;
  let color: string | undefined;
  if (state.kind === "alertingChase") {
    label = "!";
    color = "#ffd400";
  } else if (state.kind === "alertingCharge") {
    label = "!!";
    color = "#ff3b30";
  } else if (state.kind === "stunned") {
    label = "✦";
    color = "#9aa0a6";
  }
  if (!label || !color) return;
  const labelX = (gx + 0.5) * cellWidth;
  const labelY = (gy + 0.12) * cellHeight;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = Math.max(2, Math.min(cellWidth, cellHeight) * 0.1);
  ctx.font = `bold ${Math.max(14, cellHeight * 0.8)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(label, labelX, labelY);
  ctx.fillText(label, labelX, labelY);
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
  renderStateOverlay(ghostData, ctx, dx, dy);
};
