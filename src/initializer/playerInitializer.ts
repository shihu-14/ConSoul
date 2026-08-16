import { PlayerData } from '../data/playerData';
import { settings } from '../settings';

export const playerInitializer = (playerData: PlayerData) => {
  window.addEventListener('keydown', (e) => {
    if (settings.mode !== 'game') return;
    switch (e.key) {
      case 'ArrowUp':
        playerData.direction = 'ArrowUp';
        break;
      case 'ArrowDown':
        playerData.direction = 'ArrowDown';
        break;
      case 'ArrowLeft':
        playerData.direction = 'ArrowLeft';
        break;
      case 'ArrowRight':
        playerData.direction = 'ArrowRight';
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', () => {
    playerData.direction = 'None';
  });
};
