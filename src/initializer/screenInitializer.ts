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
        const elapsedSeconds = Math.max(0, Math.round((settings.end - settings.start) / 1000));
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const text = `ConSoulを${minutes}分${seconds}秒でクリアしました！`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=ConSoul`;
        window.open(url, '_blank');
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
