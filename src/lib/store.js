// 全站共用的狀態(偏好設定會存進 localStorage)
import { useSyncExternalStore } from 'react';

const PREF_KEY = 'chordlab.prefs.v1';
const PERSISTED = [
  'bpm', 'timeSig', 'voice', 'reverb', 'chorus', 'fuzz', 'volume',
  'droneString', 'droneFifth', 'droneLow', 'droneVolume', 'droneMode',
  'labelMode', 'playMode', 'mix', 'drumKit',
];

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

let state = {
  // 偏好
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
  labelMode: 'finger', // finger | note | degree
  playMode: 'strum', // strum | arp
  mix: { drums: true, bass: true, pad: true, guitar: false, click: false },
  drumKit: 'sampled',
  ...read(PREF_KEY, {}),
  // 執行期狀態(不儲存)
  audioReady: false,
  voiceStatus: 'idle', // idle | loading | ready | failed
  drumStatus: 'idle',
  metronomeOn: false,
  beat: -1,
  beatLevel: 0,
  droneOn: false,
  backingId: null,
  backingBar: -1,
  backingCountIn: false,
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
