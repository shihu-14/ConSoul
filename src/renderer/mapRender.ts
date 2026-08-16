import { MapData } from '../data/mapData';
import { getImage } from '../imageloader/imageStore';

const getRandom = (x: number, y: number) => Math.abs((Math.sin(x * 12.9898 + y * 78.233)) % 1);

// アイテムを描画する処理をする必要がある。描画しなくなる必要もある。

// 納品場所を描画する

export const mapRender = (mapData: MapData, ctx: CanvasRenderingContext2D) => {
  const { data, width, height } = mapData;
  const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
  const dx = canvasWidth / width;
  const dy = canvasHeight / height;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const char = data[y * width + x];
      const downChar = y === height - 1 ? '.' : data[(y + 1) * width + x];
      const floornum = Math.floor(getRandom(x, y) * 4);
      if (char === '.') {
        ctx.drawImage(getImage('floor'), (floornum % 2) * 64, Math.floor(floornum / 2) * 64, 64, 64, x * dx, y * dy, dx, dy);
      } else if (downChar === '#') {
        ctx.drawImage(getImage('wall'), 0, 0, 64, 64, x * dx, y * dy, dx, dy);
      } else {
        ctx.drawImage(getImage('wall'), 64, 0, 64, 64, x * dx, y * dy, dx, dy);
      }
    }
  }

  // アイテムの描画
  for (let i = 0; i < mapData.items.length; i += 1) {
    const [x, y] = mapData.items[i];
    if (mapData.exist[i]) ctx.drawImage(getImage('item'), 64 * (i % 3) + 64, 0, 64, 64, x * dx, y * dy, dx, dy);
  }

  // 納品場所の描画
  const [x, y] = mapData.post;
  ctx.drawImage(getImage('item'), 0, 0, 64, 64, x * dx, y * dy, dx, dy);
};
