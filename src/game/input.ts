/**
 * キーボードの押下状態を保持し，単発操作をゲーム処理へ通知する．
 */

import { CharacterType, Direction } from "./types";

const pressedDirections: Direction[] = [];

/**
 * キー名をゲーム内の移動方向へ変換する．
 * ArrowキーとWASDを同じ方向へ割り当て，対応しないキーはnullを返す．
 */
const getDirectionForKey = (key: string): Direction | null => {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
};

/**
 * 数字キーをキャラクター種別へ変換する．
 * 1をStudent，2をExorcist，3をMonkへ割り当て，対応しないキーはnullを返す．
 */
const getCharacterForKey = (key: string): CharacterType | null => {
  switch (key) {
    case "1":
      return "student";
    case "2":
      return "exorcist";
    case "3":
      return "monk";
    default:
      return null;
  }
};

/**
 * 現在押下中の移動方向を返す．
 * 複数方向が押されている場合は，最後に押された方向を優先する．
 */
export const getMoveDirection = () => pressedDirections.at(-1) ?? null;

/**
 * 保持している移動キー状態をすべて解除する．
 * ステージ開始，リトライ，タイトル復帰時にキー状態が次の状態へ漏れないようにする．
 */
export const resetInput = () => {
  pressedDirections.splice(0, pressedDirections.length);
};

export const registerInput = (
  handlers: {
    onAction?: (direction: Direction | null) => void;
    onRetry?: () => void;
    onSelectCharacter?: (characterType: CharacterType) => void;
    onShareResult?: () => void;
  },
  target: {
    addEventListener: (
      type: string,
      listener: (event: KeyboardEvent) => void,
    ) => void;
    removeEventListener: (
      type: string,
      listener: (event: KeyboardEvent) => void,
    ) => void;
  } = window,
) => {
  /**
   * KeyDownを移動キー，Action，リトライ，結果共有，キャラクター選択へ振り分ける．
   * 移動キーは押下順を保持し，repeat付きの単発操作は二重実行しない．
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    const direction = getDirectionForKey(event.key);
    if (direction) {
      const previousIndex = pressedDirections.indexOf(direction);
      if (previousIndex >= 0) return;
      pressedDirections.push(direction);
      return;
    }
    if (event.repeat) return;
    if (event.key === " ") {
      handlers.onAction?.(getMoveDirection());
      return;
    }
    if (event.key.toLowerCase() === "r") {
      handlers.onRetry?.();
      return;
    }
    if (event.key.toLowerCase() === "e") {
      handlers.onShareResult?.();
      return;
    }
    const characterType = getCharacterForKey(event.key);
    if (characterType) handlers.onSelectCharacter?.(characterType);
  };

  /**
   * KeyUpされた移動方向だけを押下状態から削除する．
   */
  const handleKeyUp = (event: KeyboardEvent) => {
    const direction = getDirectionForKey(event.key);
    if (!direction) return;
    const index = pressedDirections.indexOf(direction);
    if (index >= 0) pressedDirections.splice(index, 1);
  };

  target.addEventListener("keydown", handleKeyDown);
  target.addEventListener("keyup", handleKeyUp);
  // 登録したイベントだけを解除し，入力状態も同時に初期化する解除関数を返す．
  return () => {
    target.removeEventListener("keydown", handleKeyDown);
    target.removeEventListener("keyup", handleKeyUp);
    resetInput();
  };
};
