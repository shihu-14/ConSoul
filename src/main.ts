/**
 * ブラウザーの入力，ゲーム更新，Canvas描画を一つのフレームループへ接続する．
 */

import "./style.css";
import {
  playBgm,
  playGameEvents,
  stopAllSfx,
  stopAllAudio,
  syncBgmMode,
} from "./audio/audioManager";
import { getActiveBlockPushDurationSeconds } from "./game/block";
import {
  createGame,
  performGameAction,
  retryStage,
  returnToTitle,
  startGame,
  updateGame,
} from "./game/game";
import { getMoveDirection, registerInput, resetInput } from "./game/input";
import { preserveBlockSpritesOnRetry } from "./renderer/renderField";
import { renderGame } from "./renderer/renderGame";
import { renderTutorial } from "./renderer/renderTutorial";
import {
  renderGameOver,
  renderResult,
  renderStageTransition,
  renderTitle,
} from "./renderer/renderScreens";
import {
  beginTutorial,
  clearTutorialHint,
  createTutorial,
  observeTutorialEvents,
  observeTutorialPush,
  updateTutorial,
} from "./tutorial";

const canvas = document.getElementById("cnv") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvasが存在しない。");

const context = canvas.getContext("2d");
if (!context) throw new Error("Canvas 2D Contextを取得できない。");
context.imageSmoothingEnabled = false;

/**
 * ブラウザーの高精度時計を秒単位で返す．
 */
const getNowSeconds = () => performance.now() / 1000;
const game = createGame(getNowSeconds());
const tutorial = createTutorial();
let previousFrameSeconds = getNowSeconds();

/**
 * ResultまたはGameOver画面からTitleへ戻し，入力状態とフレーム基準時刻を初期化する．
 */
const returnFromFinishedScreen = () => {
  const nowSeconds = getNowSeconds();
  if (returnToTitle(game, nowSeconds)) {
    stopAllAudio();
    resetInput();
    previousFrameSeconds = nowSeconds;
  }
};

// キーボード入力をGameのAction，リトライ，キャラクター選択，結果共有へ接続する．
registerInput({
  onAction: (direction) => {
    if (game.mode === "result" || game.mode === "gameOver") {
      returnFromFinishedScreen();
      return;
    }
    if (game.mode !== "game") return;
    clearTutorialHint(tutorial);
    const result = performGameAction(game, direction);
    if (result === "dash") {
      playGameEvents([{ type: "dash" }]);
    }
    if (result === "push") {
      observeTutorialPush(tutorial, game);
      const durationSeconds = getActiveBlockPushDurationSeconds(game.stage);
      playGameEvents([
        {
          type: "blockPush",
          durationSeconds,
        },
      ]);
    }
  },
  onRetry: () => {
    const nowSeconds = getNowSeconds();
    const previousBlocks = game.stage.blocks;
    if (retryStage(game, nowSeconds)) {
      preserveBlockSpritesOnRetry(previousBlocks, game.stage.blocks);
      beginTutorial(tutorial, game);
      stopAllSfx();
      resetInput();
      previousFrameSeconds = nowSeconds;
    }
  },
  onSelectCharacter: (characterType) => {
    const nowSeconds = getNowSeconds();
    if (startGame(game, characterType, nowSeconds)) {
      beginTutorial(tutorial, game);
      playBgm();
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

/**
 * requestAnimationFrameの1フレームを処理する．
 * 前フレームとの差分時間でGameを更新し，現在のmodeに対応する画面を描画して次フレームを予約する．
 */
const tick = (timestampMilliseconds: number) => {
  const nowSeconds = timestampMilliseconds / 1000;
  const deltaSeconds = Math.max(0, nowSeconds - previousFrameSeconds);
  previousFrameSeconds = nowSeconds;

  const events = updateGame(game, getMoveDirection(), deltaSeconds, nowSeconds);
  observeTutorialEvents(tutorial, game, events);
  updateTutorial(tutorial, game, nowSeconds);
  playGameEvents(events);
  syncBgmMode(game.mode);
  context.clearRect(0, 0, canvas.width, canvas.height);

  switch (game.mode) {
    case "title":
      renderTitle(context);
      break;
    case "game":
      renderGame(game, context, nowSeconds);
      renderTutorial(
        game,
        context,
        tutorial.overlay,
        nowSeconds,
        tutorial.resetHintStartedAtSeconds,
        tutorial.guidance,
        tutorial.pushHintVisible,
      );
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
