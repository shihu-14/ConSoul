import { playerEnergyBalance } from "../config/gameBalance";
import { PlayerData } from "../data/playerData";

export const recoverPlayerEnergy = (player: PlayerData, nowSeconds: number) => {
  const elapsedSeconds = Math.max(
    0,
    nowSeconds - player.energyUpdatedAtSeconds,
  );
  player.energy = Math.min(
    playerEnergyBalance.maximumEnergy,
    player.energy +
      elapsedSeconds * playerEnergyBalance.energyRecoveryPerSecond,
  );
  player.energyUpdatedAtSeconds = nowSeconds;
};

export const spendPlayerEnergy = (player: PlayerData, amount: number) => {
  if (player.energy < amount) return false;
  player.energy -= amount;
  return true;
};
