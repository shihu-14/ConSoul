/**
 * ブラウザーの入力，ゲーム更新，Canvas描画を一つのフレームループへ接続する．
 */

import "./style.css";
import {
  createGame,
  performGameAction,
  retryStage,
  returnToTitle,
  startGame,
  updateGame,
} from "./game/game";
import { getMoveDirection, registerInput, resetInput } from "./game/input";
import { renderGame } from "./renderer/renderGame";
import {
  renderGameOver,
  renderResult,
  renderStageTransition,
  renderTitle,
} from "./renderer/renderScreens";

const canvas = document.getElementById("cnv") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvasが存在しない。");

const context = canvas.getContext("2d");
if (!context) throw new Error("Canvas 2D Contextを取得できない。");
context.imageSmoothingEnabled = false;

const getNowSeconds = () => performance.now() / 1000;
const game = createGame(getNowSeconds());
let previousFrameSeconds = getNowSeconds();

const returnFromFinishedScreen = () => {
  const nowSeconds = getNowSeconds();
  if (returnToTitle(game, nowSeconds)) {
    resetInput();
    previousFrameSeconds = nowSeconds;
  }
};

registerInput({
  onAction: (direction) => {
    if (game.mode === "result" || game.mode === "gameOver") {
      returnFromFinishedScreen();
      return;
    }
    performGameAction(game, direction);
  },
  onRetry: () => {
    const nowSeconds = getNowSeconds();
    if (retryStage(game, nowSeconds)) {
      resetInput();
      previousFrameSeconds = nowSeconds;
    }
  },
  onSelectCharacter: (characterType) => {
    const nowSeconds = getNowSeconds();
    if (startGame(game, characterType, nowSeconds)) {
      resetInput();
      previousFrameSeconds = nowSeconds;
    }
  },
  onShareResult: () => {
    if (game.mode !== "result") return;
    const elapsedSeconds = Math.max(0, Math.round(game.elapsedSeconds));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const text = `ConSoulを${minutes}分${seconds}秒でクリアしました！`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=ConSoul`;
    window.open(url, "_blank");
  },
});

const tick = (timestampMilliseconds: number) => {
  const nowSeconds = timestampMilliseconds / 1000;
  const deltaSeconds = Math.max(0, nowSeconds - previousFrameSeconds);
  previousFrameSeconds = nowSeconds;

  updateGame(game, getMoveDirection(), deltaSeconds, nowSeconds);
  context.clearRect(0, 0, canvas.width, canvas.height);

  switch (game.mode) {
    case "title":
      renderTitle(context);
      break;
    case "game":
      renderGame(game, context, nowSeconds);
      break;
    case "stageTransition":
      renderGame(game, context, nowSeconds);
      renderStageTransition(game, context);
      break;
    case "result":
      renderResult(game, context);
      break;
    case "gameOver":
      renderGameOver(context);
      break;
    default:
      throw new Error("未知の画面モードです。");
  }

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
