import { PlayerData } from '../data/playerData';
import { settings } from '../settings';

export const titleKeydownEvent = (player: PlayerData) => {
  window.addEventListener('keydown', (e) => {
    if (settings.mode === 'title') {
      switch (e.key) {
        case '1':
          player.shurui = 'monk';
          settings.mode = 'game';
          break;
        case '2':
          player.shurui = 'exorcist';
          settings.mode = 'game';
          break;
        case '3':
          player.shurui = 'student';
          settings.mode = 'game';
          break;
        default:
          break;
      }
    }
  });
};

export const resultKeydownEvent = () => {
  window.addEventListener('keydown', (e) => {
    if (settings.mode === 'result') {
      if (e.key === ' ') settings.mode = 'title';
      if (e.key === 'e') {
        window.open(`https://twitter.com/intent/tweet?text=ConSoulを${3}分${3}秒でクリアしました！&hashtags=ConSoul`, '_blank');
      }
    }
  });
};

export const result2KeydownEvent = () => {
  window.addEventListener('keydown', (e) => {
    if (settings.mode === 'result2') {
      if (e.key === ' ') settings.mode = 'title';
    }
  });
};
