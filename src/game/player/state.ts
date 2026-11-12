import { CharacterType, PlayerState, Position, gameConfig } from "../shared";

export const createPlayer = (
  characterType: CharacterType,
  logicalPosition: Readonly<Position>,
): PlayerState => ({
  position: { ...logicalPosition },
  direction: "right",
  characterType,
  movement: null,
  energy: gameConfig.energy.maximum,
  heldItems: [],
});
