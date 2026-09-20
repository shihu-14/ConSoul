/**
 * BGMと効果音の再生を一元管理する．
 * GameStateやゲームロジックへブラウザー音声APIを持ち込まない．
 */

import { GameSignal } from "../game/events";
import { Mode } from "../game/types";
import { audioAssets, SfxId } from "./audioAssets";

const BGM_VOLUME = 0.35;

const bgm = new Audio(audioAssets.gameBgm);
bgm.loop = true;
bgm.preload = "auto";
bgm.volume = BGM_VOLUME;
const activeSfx = new Set<HTMLAudioElement>();
const sfxStopTimers = new Map<
  HTMLAudioElement,
  ReturnType<typeof setTimeout>
>();

const sfxByEvent: Record<GameSignal["type"], SfxId> = {
  playerStep: "walk",
  playerCreak: "floorCreak",
  blockPush: "stonePush",
  itemDeliver: "itemDeliver",
  chaseAlert: "chaseAlert",
  dash: "dash",
  itemPickup: "itemPickup",
};
type SfxMetadata = {
  volume: number;
  startOffsetSeconds: number;
  playbackRate: number;
  gain?: number;
};

const sfxMetadata: Record<SfxId, SfxMetadata> = {
  walk: {
    volume: 1,
    startOffsetSeconds: 0.6,
    playbackRate: 1,
    gain: 2,
  },
  floorCreak: {
    volume: 0.4,
    startOffsetSeconds: 2.8,
    playbackRate: 1,
  },
  stonePush: {
    volume: 0.6,
    startOffsetSeconds: 0.18,
    playbackRate: 1.8,
  },
  itemDeliver: {
    volume: 0.4,
    startOffsetSeconds: 0,
    playbackRate: 1,
  },
  chaseAlert: {
    volume: 0.4,
    startOffsetSeconds: 0,
    playbackRate: 1,
  },
  dash: {
    volume: 0.24,
    startOffsetSeconds: 0,
    playbackRate: 1,
  },
  itemPickup: {
    volume: 0.4,
    startOffsetSeconds: 0,
    playbackRate: 1,
  },
};
let audioContext: AudioContext | null = null;
const amplifiedSfxNodes = new Map<
  HTMLAudioElement,
  { source: MediaElementAudioSourceNode; gain: GainNode }
>();

const getAudioContext = () => {
  if (typeof AudioContext === "undefined") return null;
  audioContext ??= new AudioContext();
  return audioContext;
};

const resumeAudioContext = () => {
  const context = getAudioContext();
  if (!context || context.state !== "suspended") return;
  context.resume().catch(() => undefined);
};

const connectWalkingGain = (audio: HTMLAudioElement) => {
  const context = getAudioContext();
  if (!context) return;
  const source = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = sfxMetadata.walk.gain ?? 1;
  source.connect(gain);
  gain.connect(context.destination);
  amplifiedSfxNodes.set(audio, { source, gain });
};

/**
 * 音声再生のPromise拒否を未処理にせず，再生開始成功後の処理も安全に実行する．
 */
const startAudio = (
  audio: HTMLAudioElement,
  onRejected?: () => void,
  onStarted?: () => void,
) => {
  audio
    .play()
    .then(() => onStarted?.())
    .catch(() => onRejected?.());
};

/**
 * 効果音の再生管理対象からAudio要素を外し，関連する停止予約も解除する．
 */
const releaseSfx = (audio: HTMLAudioElement) => {
  activeSfx.delete(audio);
  const amplifiedNodes = amplifiedSfxNodes.get(audio);
  amplifiedNodes?.source.disconnect();
  amplifiedNodes?.gain.disconnect();
  amplifiedSfxNodes.delete(audio);
  const timer = sfxStopTimers.get(audio);
  if (timer === undefined) return;
  clearTimeout(timer);
  sfxStopTimers.delete(audio);
};

/**
 * 指定した効果音を停止し，次回再生時に先頭から始められる状態へ戻す．
 */
const stopSfx = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
  releaseSfx(audio);
};

/**
 * ゲームBGMをLoop再生する．
 * 既に再生中の場合は再開処理を重複させない．
 */
export const playBgm = () => {
  resumeAudioContext();
  if (bgm.paused) startAudio(bgm);
};

/**
 * ゲームBGMを停止し，次回開始時は先頭から再生する．
 */
export const stopBgm = () => {
  bgm.pause();
  bgm.currentTime = 0;
};

/**
 * 再生中の効果音をすべて停止し，次のゲーム開始時に残らないようにする．
 */
export const stopAllSfx = () => {
  Array.from(activeSfx).forEach(stopSfx);
};

/**
 * BGMと効果音をまとめて停止する．画面遷移時の音声終了に使用する．
 */
export const stopAllAudio = () => {
  stopBgm();
  stopAllSfx();
};

/**
 * 指定した効果音を一回再生する．durationSecondsを指定した場合は，その時間で動的に停止する．
 * 再生ごとにAudio要素を作成し，同じ効果音の重なりを許可する．
 */
export const playSfx = (id: SfxId, durationSeconds?: number) => {
  const audio = new Audio(audioAssets.sfx[id]);
  const metadata = sfxMetadata[id];
  audio.volume = metadata.volume;
  audio.playbackRate = metadata.playbackRate;
  audio.currentTime = metadata.startOffsetSeconds;
  if (metadata.gain !== undefined) connectWalkingGain(audio);
  activeSfx.add(audio);
  audio.addEventListener("ended", () => releaseSfx(audio), {
    once: true,
  });
  startAudio(
    audio,
    () => releaseSfx(audio),
    () => {
      if (durationSeconds === undefined) return;
      const timer = setTimeout(
        () => stopSfx(audio),
        Math.max(0, durationSeconds) * 1000,
      );
      sfxStopTimers.set(audio, timer);
    },
  );
};

/**
 * ゲームイベントを対応する効果音へ変換し，発生順に再生する．
 */
export const playGameEvents = (events: readonly GameSignal[]) => {
  events.forEach((event) => {
    const durationSeconds =
      "durationSeconds" in event ? event.durationSeconds : undefined;
    playSfx(sfxByEvent[event.type], durationSeconds);
  });
};

/**
 * 現在の画面モードに応じてBGMの再生状態を同期する．
 * gameとstageTransitionでは再生し，その他の画面では停止する．
 */
export const syncBgmMode = (mode: Mode) => {
  if (mode === "game" || mode === "stageTransition") {
    playBgm();
    return;
  }
  stopAllAudio();
};
