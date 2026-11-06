import { GameSignal } from "../game/events";
import { Mode } from "../game/types";
import { audioAssets, SfxId } from "./audioAssets";

const BGM_VOLUME = 0.35;
const MAX_SFX_VOICES = 4;

const bgm = new Audio(audioAssets.gameBgm);
bgm.loop = true;
bgm.preload = "auto";
bgm.volume = BGM_VOLUME;
const activeSfx = new Set<HTMLAudioElement>();
const sfxVoices = new Map<SfxId, HTMLAudioElement[]>();
const sfxPlaybackIds = new Map<HTMLAudioElement, number>();
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

// ブラウザー側の設定で再生を拒否されることがある。
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

const releaseSfx = (audio: HTMLAudioElement) => {
  activeSfx.delete(audio);
  sfxPlaybackIds.set(audio, (sfxPlaybackIds.get(audio) ?? 0) + 1);
  const timer = sfxStopTimers.get(audio);
  if (timer === undefined) return;
  clearTimeout(timer);
  sfxStopTimers.delete(audio);
};

const stopSfx = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
  releaseSfx(audio);
};

export const playBgm = () => {
  resumeAudioContext();
  if (bgm.paused) startAudio(bgm);
};

export const stopBgm = () => {
  bgm.pause();
  bgm.currentTime = 0;
};

export const stopAllSfx = () => {
  Array.from(activeSfx).forEach(stopSfx);
};

export const stopAllAudio = () => {
  stopBgm();
  stopAllSfx();
};

// 同じ効果音が重なってもよいように、Audio要素を少数だけ使い回す。
const getSfxVoice = (id: SfxId) => {
  const voices = sfxVoices.get(id) ?? [];
  const available = voices.find((audio) => !activeSfx.has(audio));
  if (available) return available;

  if (voices.length < MAX_SFX_VOICES) {
    const audio = new Audio(audioAssets.sfx[id]);
    audio.addEventListener("ended", () => releaseSfx(audio));
    if (sfxMetadata[id].gain !== undefined) connectWalkingGain(audio);
    voices.push(audio);
    sfxVoices.set(id, voices);
    return audio;
  }

  const oldest = Array.from(activeSfx).find((audio) => voices.includes(audio));
  const audio = oldest ?? voices[0];
  stopSfx(audio);
  return audio;
};

export const playSfx = (id: SfxId, durationSeconds?: number) => {
  const audio = getSfxVoice(id);
  const metadata = sfxMetadata[id];
  audio.volume = metadata.volume;
  audio.playbackRate = metadata.playbackRate;
  audio.currentTime = metadata.startOffsetSeconds;
  activeSfx.add(audio);
  const playbackId = (sfxPlaybackIds.get(audio) ?? 0) + 1;
  sfxPlaybackIds.set(audio, playbackId);
  startAudio(
    audio,
    () => {
      if (sfxPlaybackIds.get(audio) === playbackId) stopSfx(audio);
    },
    () => {
      if (
        durationSeconds === undefined ||
        sfxPlaybackIds.get(audio) !== playbackId
      )
        return;
      const timer = setTimeout(
        () => stopSfx(audio),
        Math.max(0, durationSeconds) * 1000,
      );
      sfxStopTimers.set(audio, timer);
    },
  );
};

export const playGameEvents = (events: readonly GameSignal[]) => {
  events.forEach((event) => {
    const durationSeconds =
      "durationSeconds" in event ? event.durationSeconds : undefined;
    playSfx(sfxByEvent[event.type], durationSeconds);
  });
};

export const syncBgmMode = (mode: Mode) => {
  if (mode === "game" || mode === "stageTransition") {
    playBgm();
    return;
  }
  stopAllAudio();
};
