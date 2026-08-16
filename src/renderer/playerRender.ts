import { MapData } from '../data/mapData';
import { PlayerData } from '../data/playerData';
import { getImage } from '../imageloader/imageStore';

const PLAYER_DIRECTION_SRC: Record<string, number[]> = {
  ArrowUp: [64, 0, 64, 64],
  ArrowDown: [128, 0, 64, 64],
  ArrowLeft: [0, 0, 64, 64],
  ArrowRight: [192, 0, 64, 64],
  None: [0, 0, 0, 0],
};
const PLAYER_SHURUI_SRC: Record<string, number> = {
  student: 64,
  monk: 128,
  exorcist: 0,
};

export const playerRender = (
  playerData: PlayerData,
  mapData: MapData,
  ctx: CanvasRenderingContext2D,
) => {
  const {
    x, y,
  } = playerData;
  const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
  const dx = canvasWidth / mapData.width;
  const dy = canvasHeight / mapData.height;
  const playerImage = getImage('player');
  const [xSrc, ySrc, wSrc, hSrc] = PLAYER_DIRECTION_SRC[playerData.forward];
  ctx.drawImage(
    playerImage,
    xSrc,
    PLAYER_SHURUI_SRC[playerData.shurui] + ySrc,
    wSrc,
    hSrc,
    x * dx,
    y * dy,
    dx,
    dy,
  );
};
