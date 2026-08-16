import { MapData } from '../data/mapData';
import { GhostData } from '../data/ghostData';
import { getImage } from '../imageloader/imageStore';

const GHOST_DIRECTION_SRC: Record<string, number[]> = {
  gUp: [64, 0, 64, 64],
  gDown: [128, 0, 64, 64],
  gLeft: [0, 0, 64, 64],
  gRight: [192, 0, 64, 64],
  None: [0, 0, 0, 0],
};
const GHOST_SHURUI_SRC: Record<string, number> = {
  random: 64,
  chase: 128,
};

export const ghostRender = (
  ghostData: GhostData,
  mapData: MapData,
  ctx: CanvasRenderingContext2D,
) => {
  const {
    gx, gy,
  } = ghostData;
  const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
  const dx = canvasWidth / mapData.width;
  const dy = canvasHeight / mapData.height;
  const playerImage = getImage('ghost');
  const [xSrc, ySrc, wSrc, hSrc] = GHOST_DIRECTION_SRC[ghostData.gdirect];
  ctx.drawImage(
    playerImage,
    xSrc,
    GHOST_SHURUI_SRC[ghostData.gtype] + ySrc,
    wSrc,
    hSrc,
    gx * dx,
    gy * dy,
    dx,
    dy,
  );

  const time = (performance.now() / 1000) * 4;
  const id = Math.floor(time) % 3;
  ctx.drawImage(
    getImage('heartAnimation'),
    id * 64,
    0,
    64,
    64,
    gx * dx,
    gy * dy,
    dx,
    dy,
  );
};
