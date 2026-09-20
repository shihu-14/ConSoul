const saveField = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  const { width, height } = ctx.canvas;
  ctx.scale(height / width, 1);
};

const restoreField = (ctx: CanvasRenderingContext2D) => {
  ctx.restore();
};

export const resizeField = (
  ctx: CanvasRenderingContext2D,
  drawFunc: () => void,
) => {
  saveField(ctx);
  drawFunc();
  restoreField(ctx);
};
