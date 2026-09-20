import { PlayerData } from "../data/playerData";
import { getImage } from "../imageloader/imageStore";
import { getItemSpriteSource } from "./itemSprite";

const HUD_MARGIN = 8;
const HUD_PADDING = 12;
const HUD_WIDTH = 208;
const HUD_HEIGHT = 96;
const ICON_SIZE = 40;
const ICON_GAP = 8;

export const inventoryRender = (
  playerData: PlayerData,
  ctx: CanvasRenderingContext2D,
) => {
  const hudX = ctx.canvas.width - HUD_MARGIN - HUD_WIDTH;
  const hudY = HUD_MARGIN;
  const iconY = hudY + 44;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
  ctx.fillRect(hudX, hudY, HUD_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("所持", hudX + HUD_PADDING, hudY + 34);

  playerData.heldItems.forEach((itemIndex, heldIndex) => {
    const [sourceX, sourceY, sourceWidth, sourceHeight] =
      getItemSpriteSource(itemIndex);
    ctx.drawImage(
      getImage("item"),
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      hudX + HUD_PADDING + heldIndex * (ICON_SIZE + ICON_GAP),
      iconY,
      ICON_SIZE,
      ICON_SIZE,
    );
  });
  ctx.restore();
};
