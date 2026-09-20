export const hudRailRender = (ctx: CanvasRenderingContext2D) => {
  const railX = ctx.canvas.height;
  const railWidth = ctx.canvas.width - railX;

  ctx.save();
  ctx.fillStyle = "#161616";
  ctx.fillRect(railX, 0, railWidth, ctx.canvas.height);
  ctx.fillStyle = "#454545";
  ctx.fillRect(railX, 0, 2, ctx.canvas.height);
  ctx.restore();
};
