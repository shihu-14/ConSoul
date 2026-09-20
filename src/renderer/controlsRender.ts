import { getImage } from "../imageloader/imageStore";

const PANEL_X = 980;
const PANEL_Y = 650;
const PANEL_WIDTH = 288;
const PANEL_HEIGHT = 300;
const PANEL_PADDING = 16;
const MOVEMENT_ICON_SIZE = 39;
const ACTION_ICON_SIZE = 48;
const ICON_GAP = 1;

const movementIcons = [
  "keyArrowUp",
  "keyArrowDown",
  "keyArrowLeft",
  "keyArrowRight",
  "keyW",
  "keyA",
  "keyS",
  "keyD",
] as const;

const movementIconOffsets = [
  [MOVEMENT_ICON_SIZE + ICON_GAP, 0],
  [MOVEMENT_ICON_SIZE + ICON_GAP, MOVEMENT_ICON_SIZE + ICON_GAP],
  [0, MOVEMENT_ICON_SIZE + ICON_GAP],
  [2 * (MOVEMENT_ICON_SIZE + ICON_GAP), MOVEMENT_ICON_SIZE + ICON_GAP],
] as const;

const drawKeyIcon = (
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  size: number,
) => {
  ctx.drawImage(getImage(id), x, y, size, size);
};

export const controlsRender = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
  ctx.fillRect(PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";

  ctx.font = "bold 24px sans-serif";
  ctx.fillText("操作方法", PANEL_X + PANEL_PADDING, PANEL_Y + 28);

  ctx.font = "bold 18px sans-serif";
  ctx.fillText("移動", PANEL_X + PANEL_PADDING, PANEL_Y + 51);
  const movementY = PANEL_Y + 56;
  movementIcons.slice(0, 4).forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    drawKeyIcon(
      ctx,
      id,
      PANEL_X + PANEL_PADDING + offsetX,
      movementY + offsetY,
      MOVEMENT_ICON_SIZE,
    );
  });
  ctx.font = "20px sans-serif";
  ctx.fillText("/", PANEL_X + 141, movementY + 63);
  movementIcons.slice(4).forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    drawKeyIcon(
      ctx,
      id,
      PANEL_X + 153 + offsetX,
      movementY + offsetY,
      MOVEMENT_ICON_SIZE,
    );
  });

  ctx.font = "bold 15px sans-serif";
  ctx.fillText(
    "ダッシュまたはブロックの押し出し",
    PANEL_X + PANEL_PADDING,
    PANEL_Y + 158,
  );
  drawKeyIcon(
    ctx,
    "keySpace",
    PANEL_X + PANEL_PADDING,
    PANEL_Y + 164,
    ACTION_ICON_SIZE,
  );

  ctx.font = "bold 18px sans-serif";
  ctx.fillText("盤面のリセット", PANEL_X + PANEL_PADDING, PANEL_Y + 235);
  drawKeyIcon(
    ctx,
    "keyR",
    PANEL_X + PANEL_PADDING,
    PANEL_Y + 241,
    ACTION_ICON_SIZE,
  );
  ctx.restore();
};
