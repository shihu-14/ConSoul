import { StageTransitionState } from "../controller/stageController";

const GAME_FIELD_WIDTH = 960;

export const stageTransitionRender = (
  transition: StageTransitionState,
  ctx: CanvasRenderingContext2D,
) => {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(0, 0, GAME_FIELD_WIDTH, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = 8;
  ctx.font = "bold 72px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = `STAGE ${transition.nextStageNumber}`;
  ctx.strokeText(label, GAME_FIELD_WIDTH / 2, ctx.canvas.height / 2);
  ctx.fillText(label, GAME_FIELD_WIDTH / 2, ctx.canvas.height / 2);
  ctx.restore();
};
