import { PlayerData } from "../data/playerData";
import { getImage } from "../imageloader/imageStore";
import { getItemSpriteSource } from "./itemSprite";

const HUD_X = 980;
const HUD_Y = 500;
const HUD_PADDING = 16;
const HUD_WIDTH = 288;
const HUD_HEIGHT = 112;
const ICON_SIZE = 40;
const ICON_GAP = 8;

export const inventoryRender = (
  playerData: PlayerData,
  ctx: CanvasRenderingContext2D,
) => {
  const iconY = HUD_Y + 56;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
  ctx.fillRect(HUD_X, HUD_Y, HUD_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("所持中のアイテム", HUD_X + HUD_PADDING, HUD_Y + 34);

  playerData.heldItems.forEach((itemIndex, heldIndex) => {
    const [sourceX, sourceY, sourceWidth, sourceHeight] =
      getItemSpriteSource(itemIndex);
    ctx.drawImage(
      getImage("item"),
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      HUD_X + HUD_PADDING + heldIndex * (ICON_SIZE + ICON_GAP),
      iconY,
      ICON_SIZE,
      ICON_SIZE,
    );
  });
  ctx.restore();
};
