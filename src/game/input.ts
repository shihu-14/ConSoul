import { CharacterType, Direction } from "./types";

// 同時押しでは最後に押した方向を優先する。
const pressedDirections: Direction[] = [];

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

export const getMoveDirection = () => pressedDirections.at(-1) ?? null;

export const resetInput = () => {
  pressedDirections.splice(0, pressedDirections.length);
};

export const registerInput = (handlers: {
  onAction: (direction: Direction | null) => void;
  onRetry: () => void;
  onSelectCharacter: (characterType: CharacterType) => void;
  onShareResult: () => void;
}) => {
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
      handlers.onAction(getMoveDirection());
      return;
    }
    if (event.key.toLowerCase() === "r") {
      handlers.onRetry();
      return;
    }
    if (event.key.toLowerCase() === "e") {
      handlers.onShareResult();
      return;
    }
    const characterType = getCharacterForKey(event.key);
    if (characterType) handlers.onSelectCharacter(characterType);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const direction = getDirectionForKey(event.key);
    if (!direction) return;
    const index = pressedDirections.indexOf(direction);
    if (index >= 0) pressedDirections.splice(index, 1);
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
};
