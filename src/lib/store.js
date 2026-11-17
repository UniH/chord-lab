// 全站共用的狀態(偏好設定會存進 localStorage)
import { useSyncExternalStore } from 'react';

const PREF_KEY = 'chordlab.prefs.v1';
const PREFS_VERSION = 2;
const PERSISTED = [
  'prefsVersion', 'bpm', 'timeSig', 'voice', 'reverb', 'chorus', 'fuzz', 'volume',
  'droneString', 'droneFifth', 'droneLow', 'droneVolume', 'droneMode',
  'labelMode', 'playMode', 'mix', 'mixVol', 'drumKit', 'backingSel', 'backingStyle',
];
export const MIX_DEFAULT = 0.7; // 推桿在 70% 時是原本的音量

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 無痕模式等情況下寫不進去,直接略過 */
  }
}

/** 讀回存過的偏好。第 2 版起和弦圖預設顯示音名,舊版存下來的「指法」預設值要跟著換 */
function readPrefs() {
  const saved = read(PREF_KEY, {});
  if ((saved.prefsVersion || 1) < 2 && saved.labelMode === 'finger') delete saved.labelMode;
  saved.prefsVersion = PREFS_VERSION;
  return saved;
}
const savedPrefs = readPrefs();

let state = {
  // 偏好
  prefsVersion: PREFS_VERSION,
  bpm: 90,
  timeSig: '4/4',
  voice: 'clean',
  reverb: 0.45,
  chorus: true,
  fuzz: false,
  volume: 0.85,
  droneString: 6,
  droneFifth: false,
  droneLow: false,
  droneVolume: 0.5,
  droneMode: 'major',
  labelMode: 'note', // note | finger | degree
  playMode: 'strum', // strum | arp
  mix: { drums: true, bass: true, pad: true, guitar: false, click: false }, // 各音軌的開關
  drumKit: 'sampled',
  backingSel: null, // 目前選的配樂 id(null = 第一首)
  backingStyle: null, // 目前選的節奏(null = 那首配樂預設的節奏)
  ...savedPrefs,
  // 各音軌的音量(0–1),舊紀錄裡沒有的音軌補上預設值
  mixVol: { drums: MIX_DEFAULT, bass: MIX_DEFAULT, pad: MIX_DEFAULT, guitar: MIX_DEFAULT, click: MIX_DEFAULT, ...(savedPrefs.mixVol || {}) },
  // 執行期狀態(不儲存)
  audioReady: false,
  voiceStatus: 'idle', // idle | loading | ready | failed
  drumStatus: 'idle',
  metronomeOn: false,
  beat: -1,
  beatLevel: 0,
  droneOn: false,
  backingId: null, // 正在播放(或暫停中)的配樂 id
  backingPaused: false,
  backingBar: -1,
  backingCountIn: false,
  mixerOpen: false,
};

const listeners = new Set();
export function getState() {
  return state;
}
export function setState(patch) {
  state = { ...state, ...patch };
  if (Object.keys(patch).some((k) => PERSISTED.includes(k))) {
    const prefs = {};
    for (const k of PERSISTED) prefs[k] = state[k];
    write(PREF_KEY, prefs);
  }
  listeners.forEach((fn) => fn());
}
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state));
}

/* ───────── 練習紀錄與測驗統計 ───────── */
const PROGRESS_KEY = 'chordlab.progress.v1';
const QUIZ_KEY = 'chordlab.quiz.v1';
let progress = read(PROGRESS_KEY, {}); // { [itemId]: 完成時間 ISO 字串 }
let quiz = read(QUIZ_KEY, { right: 0, wrong: 0, best: 0, misses: {} });
const dataListeners = new Set();
const emitData = () => dataListeners.forEach((fn) => fn());
const subData = (fn) => {
  dataListeners.add(fn);
  return () => dataListeners.delete(fn);
};

export function useProgress() {
  return useSyncExternalStore(subData, () => progress);
}
export function toggleProgress(id) {
  progress = { ...progress };
  if (progress[id]) delete progress[id];
  else progress[id] = new Date().toISOString();
  write(PROGRESS_KEY, progress);
  emitData();
}
export function useQuizStats() {
  return useSyncExternalStore(subData, () => quiz);
}
export function setQuizStats(next) {
  quiz = next;
  write(QUIZ_KEY, quiz);
  emitData();
}
export function exportData() {
  return JSON.stringify({ app: 'chord-lab', version: 1, exportedAt: new Date().toISOString(), progress, quiz }, null, 2);
}
export function importData(text) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'chord-lab') throw new Error('這不是 Chord Lab 的備份檔');
  progress = data.progress || {};
  quiz = data.quiz || { right: 0, wrong: 0, best: 0, misses: {} };
  write(PROGRESS_KEY, progress);
  write(QUIZ_KEY, quiz);
  emitData();
}
export function resetData() {
  progress = {};
  quiz = { right: 0, wrong: 0, best: 0, misses: {} };
  write(PROGRESS_KEY, progress);
  write(QUIZ_KEY, quiz);
  emitData();
}
