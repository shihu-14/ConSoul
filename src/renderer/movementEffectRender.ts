import { movementEffectBalance } from "../config/visualEffects";
import { MapData } from "../data/mapData";
import { MovementEffectState } from "../data/movementEffect";

export const movementEffectRender = (
  state: MovementEffectState,
  map: MapData,
  ctx: CanvasRenderingContext2D,
  nowSeconds = performance.now() / 1000,
) => {
  const cellWidth = ctx.canvas.width / map.width;
  const cellHeight = ctx.canvas.height / map.height;
  const tileSize = Math.min(cellWidth, cellHeight);

  ctx.save();
  state.particles.forEach((particle) => {
    const elapsedSeconds = nowSeconds - particle.startedAtSeconds;
    const progress = elapsedSeconds / particle.lifetimeSeconds;
    if (progress < 0 || progress >= 1) return;

    const size = particle.sizeTiles * tileSize * (1 + progress * 0.4);
    const x =
      (particle.x + particle.velocityX * elapsedSeconds) * cellWidth - size / 2;
    const y =
      (particle.y + particle.velocityY * elapsedSeconds) * cellHeight -
      size / 2;
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = movementEffectBalance[particle.kind].color;
    ctx.fillRect(x, y, size, size);
  });
  ctx.restore();
};
