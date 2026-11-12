import "./style.css";
import {
  handleGameModeChange,
  playGameSignals,
  stopSoundEffects,
} from "./audio";
import {
  createGame,
  getMoveDirection,
  performGameAction,
  registerInput,
  resetInput,
  retryStage,
  returnToTitle,
  startGame,
  type Mode,
  updateGame,
} from "./game";
import {
  renderGame,
  renderGameOver,
  renderResult,
  renderTitle,
  renderTutorial,
} from "./renderer";
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

const getNowSeconds = () => performance.now() / 1000;
const game = createGame(getNowSeconds());
const tutorial = createTutorial();
let previousFrameSeconds = getNowSeconds();

const notifyModeChange = (previousMode: Mode): void => {
  if (game.mode !== previousMode) handleGameModeChange(game.mode);
};

const returnFromFinishedScreen = () => {
  const nowSeconds = getNowSeconds();
  const previousMode = game.mode;
  if (returnToTitle(game, nowSeconds)) {
    notifyModeChange(previousMode);
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
    if (game.mode !== "game") return;
    clearTutorialHint(tutorial);
    const events = performGameAction(game, direction);
    if (events.some((event) => event.type === "blockPush")) {
      observeTutorialPush(tutorial, game);
    }
    playGameSignals(events);
  },
  onRetry: () => {
    const nowSeconds = getNowSeconds();
    if (retryStage(game, nowSeconds)) {
      beginTutorial(tutorial, game);
      stopSoundEffects();
      resetInput();
      previousFrameSeconds = nowSeconds;
    }
  },
  onSelectCharacter: (characterType) => {
    const nowSeconds = getNowSeconds();
    const previousMode = game.mode;
    if (startGame(game, characterType, nowSeconds)) {
      beginTutorial(tutorial, game);
      notifyModeChange(previousMode);
      resetInput();
      previousFrameSeconds = nowSeconds;
    }
  },
  onShareResult: () => {
    if (game.mode !== "result") return;
    const elapsedSeconds = Math.round(game.elapsedSeconds);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const text = `ConSoulを${minutes}分${seconds}秒でクリアしました！`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=ConSoul`;
    window.open(url, "_blank");
  },
});

const tick = (timestampMilliseconds: number) => {
  const nowSeconds = timestampMilliseconds / 1000;
  const deltaSeconds = nowSeconds - previousFrameSeconds;
  previousFrameSeconds = nowSeconds;

  const previousMode = game.mode;
  const signals = updateGame(
    game,
    getMoveDirection(),
    deltaSeconds,
    nowSeconds,
  );
  observeTutorialEvents(tutorial, game, signals);
  updateTutorial(tutorial, game, nowSeconds);
  playGameSignals(signals);
  notifyModeChange(previousMode);
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
        tutorial.guidance,
        tutorial.pushHintVisible,
      );
      break;
    case "stageTransition":
      renderGame(game, context, nowSeconds);
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
