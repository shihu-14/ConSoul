import { playerEnergyBalance } from "../config/gameBalance";
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";

export const playerEnergyRender = (
  playerData: PlayerData,
  mapData: MapData,
  ctx: CanvasRenderingContext2D,
) => {
  const cellWidth = ctx.canvas.width / mapData.width;
  const cellHeight = ctx.canvas.height / mapData.height;
  const width = cellWidth * 1.25;
  const height = Math.max(5, cellHeight * 0.12);
  const x = Math.max(
    2,
    Math.min(
      ctx.canvas.width - width - 2,
      (playerData.x + 0.5) * cellWidth - width / 2,
    ),
  );
  const y = Math.max(2, playerData.y * cellHeight - height - cellHeight * 0.08);
  const ratio = Math.max(
    0,
    Math.min(1, playerData.energy / playerEnergyBalance.maximumEnergy),
  );

  ctx.save();
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(x, y, width * ratio, height);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.max(1, Math.min(cellWidth, cellHeight) * 0.04);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
};
