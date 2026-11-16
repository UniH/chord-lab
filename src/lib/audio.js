// 音訊引擎:Tone.js 負責時脈、合成音、效果;smplr 負責取樣音色(吉他、貝斯、鼓)
import * as Tone from 'tone';
import { Soundfont, DrumMachine, CacheStorage } from 'smplr';
import { Note } from 'tonal';
import { CHORD_LAB } from '../data/chords.js';
import { analyzeChord, CHORD_INDEX, TUNING_MIDI, plain } from './theory.js';
import { getState, setState } from './store.js';

export const VOICES = [
  { id: 'clean', name: '乾淨電吉他(取樣)', instrument: 'electric_guitar_clean' },
  { id: 'jazz', name: '爵士電吉他(取樣)', instrument: 'electric_guitar_jazz' },
  { id: 'steel', name: '木吉他鋼弦(取樣)', instrument: 'acoustic_guitar_steel' },
  { id: 'overdrive', name: '破音電吉他(取樣)', instrument: 'overdriven_guitar' },
  { id: 'synth', name: '合成撥弦(內建,免下載)', instrument: null },
];

export const TIME_SIGS = {
  '4/4': { steps: 16, beatEvery: 4, accents: [] },
  '3/4': { steps: 12, beatEvery: 4, accents: [] },
  '6/8': { steps: 12, beatEvery: 2, accents: [6] },
};

let E = null; // 所有音訊節點
let booting = null;
const LOAD_TIMEOUT = 20000;

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}
function storage() {
  try {
    return typeof caches !== 'undefined' && window.isSecureContext ? CacheStorage() : undefined;
  } catch {
    return undefined;
  }
}

/** 第一次由使用者點擊觸發時建立整個音訊圖 */
export function ensureAudio() {
  if (E) {
    if (E.ctx.state !== 'running') E.ctx.resume();
    return Promise.resolve(E);
  }
  if (!booting) booting = boot();
  return booting;
}

async function boot() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx({ latencyHint: 'interactive' });
  Tone.setContext(ctx);
  await Tone.start();
  const s = getState();

  const limiter = new Tone.Limiter(-1).toDestination();
  const master = new Tone.Gain(s.volume).connect(limiter);
  const reverb = new Tone.Reverb({ decay: 6, preDelay: 0.02, wet: 1 }).connect(master);

  // 吉他:破音 → 合唱 → 乾聲 + 殘響
  const guitarIn = ctx.createGain();
  const fuzz = new Tone.Distortion({ distortion: 0.55, wet: s.fuzz ? 1 : 0 });
  const fuzzTone = new Tone.Filter(s.fuzz ? 3200 : 12000, 'lowpass');
  const chorus = new Tone.Chorus({ frequency: 0.8, delayTime: 4.5, depth: 0.6, wet: s.chorus ? 0.45 : 0 }).start();
  const guitarOut = new Tone.Gain(0.9).connect(master);
  const guitarSend = new Tone.Gain(s.reverb).connect(reverb);
  Tone.connect(guitarIn, fuzz);
  fuzz.chain(fuzzTone, chorus, guitarOut);
  chorus.connect(guitarSend);

  const synthTone = new Tone.Filter(2400, 'lowpass');
  Tone.connect(synthTone, guitarIn);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 2, spread: 10 },
    envelope: { attack: 0.004, decay: 1.6, sustain: 0.04, release: 1.4 },
    volume: -12,
  }).connect(synthTone);
  synth.maxPolyphony = 24;

  // 鋪底 Pad
  const padGain = new Tone.Gain(0.5).connect(master);
  const padSend = new Tone.Gain(0.6).connect(reverb);
  const padFilter = new Tone.Filter(1100, 'lowpass').fan(padGain, padSend);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 24 },
    envelope: { attack: 0.5, decay: 0.4, sustain: 0.8, release: 1.6 },
    volume: -22,
  }).connect(padFilter);

  // Drone
  const droneGain = new Tone.Gain(0).connect(master);
  const droneSend = new Tone.Gain(0.5).connect(reverb);
  const droneFilter = new Tone.Filter(900, 'lowpass').fan(droneGain);
  droneGain.connect(droneSend);
  const droneLfo = new Tone.LFO({ frequency: 0.07, min: 600, max: 1500 }).start();
  droneLfo.connect(droneFilter.frequency);

  // 貝斯與鼓
  const bassIn = ctx.createGain();
  const bassGain = new Tone.Gain(0.9).connect(master);
  Tone.connect(bassIn, bassGain);
  const bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 120, octaves: 2.5 },
    volume: -8,
  }).connect(bassGain);

  const drumsIn = ctx.createGain();
  const drumGain = new Tone.Gain(0.8).connect(master);
  const drumSend = new Tone.Gain(0.12).connect(reverb);
  Tone.connect(drumsIn, drumGain);
  drumGain.connect(drumSend);
  const kick = new Tone.MembraneSynth({ pitchDecay: 0.04, octaves: 6, envelope: { attack: 0.001, decay: 0.35, sustain: 0 }, volume: -4 }).connect(drumGain);
  const snareTone = new Tone.Filter(1800, 'highpass').connect(drumGain);
  const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.19, sustain: 0 }, volume: -10 }).connect(snareTone);
  const hatTone = new Tone.Filter(7500, 'highpass').connect(drumGain);
  const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 }, volume: -20 }).connect(hatTone);

  const click = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
    volume: -6,
  }).connect(master);

  E = {
    ctx, master, reverb, guitarIn, fuzz, fuzzTone, chorus, guitarSend, synth, pad, padGain,
    droneGain, droneFilter, bassIn, bassSynth, drumsIn, kick, snare, hat, click,
    sampled: {}, bass: null, drums: null, droneOscs: [],
  };
  setState({ audioReady: true });
  loadVoice(getState().voice);
  return E;
}

/* ───────── 吉他音色 ───────── */
async function loadVoice(id) {
  const voice = VOICES.find((v) => v.id === id) || VOICES[0];
  if (!voice.instrument) {
    setState({ voiceStatus: 'ready' });
    return;
  }
  if (E.sampled[id]?.ok) {
    setState({ voiceStatus: 'ready' });
    return;
  }
  setState({ voiceStatus: 'loading' });
  try {
    const inst = Soundfont(E.ctx, { instrument: voice.instrument, destination: E.guitarIn, storage: storage(), volume: 100 });
    await withTimeout(inst.ready, LOAD_TIMEOUT);
    E.sampled[id] = { inst, ok: true };
    if (getState().voice === id) setState({ voiceStatus: 'ready' });
  } catch (err) {
    console.warn('取樣音色載入失敗,改用合成音', err);
    if (getState().voice === id) setState({ voiceStatus: 'failed' });
  }
}

export function setVoice(id) {
  setState({ voice: id });
  if (E) loadVoice(id);
}

function guitarNote(midi, time, duration = 3, velocity = 90) {
  const cur = E.sampled[getState().voice];
  if (cur?.ok) {
    cur.inst.start({ note: midi, time, duration, velocity });
  } else {
    E.synth.triggerAttackRelease(Tone.Frequency(midi, 'midi').toFrequency(), Math.min(duration, 2.5), time, velocity / 127);
  }
}

export function stopGuitar() {
  if (!E) return;
  Object.values(E.sampled).forEach((v) => v.ok && v.inst.stop());
  E.synth.releaseAll();
}

/** 試聽單音 */
export async function playNote(midi, duration = 1.6) {
  await ensureAudio();
  guitarNote(midi, E.ctx.currentTime + 0.02, duration, 95);
}

/** 試聽和弦。mode: 'strum' 刷弦、'arp' 分解 */
export async function playMidis(midis, mode = getState().playMode) {
  await ensureAudio();
  stopGuitar();
  const now = E.ctx.currentTime + 0.04;
  const sorted = [...midis].sort((a, b) => a - b);
  const gap = mode === 'arp' ? Math.min(0.32, 60 / getState().bpm / 2) : 0.03;
  sorted.forEach((m, i) => guitarNote(m, now + i * gap, mode === 'arp' ? 3.2 : 3.6, 82 + i * 3));
  if (mode === 'arp') {
    // 分解之後再一起刷一次,聽整體的聲音
    const t = now + sorted.length * gap + 0.25;
    sorted.forEach((m, i) => guitarNote(m, t + i * 0.025, 3.6, 80));
  }
}
export function playChord(chord, mode) {
  return playMidis(analyzeChord(chord).midis, mode);
}

/* ───────── 效果與音量 ───────── */
export function setFx(patch) {
  setState(patch);
  if (!E) return;
  const s = getState();
  E.master.gain.rampTo(s.volume, 0.05);
  E.guitarSend.gain.rampTo(s.reverb, 0.1);
  E.chorus.wet.rampTo(s.chorus ? 0.45 : 0, 0.1);
  E.fuzz.wet.rampTo(s.fuzz ? 1 : 0, 0.05);
  E.fuzzTone.frequency.rampTo(s.fuzz ? 3200 : 12000, 0.05);
}

/* ───────── Drone ───────── */
function droneFreq() {
  const s = getState();
  const midi = TUNING_MIDI[6 - s.droneString] - (s.droneLow ? 12 : 0);
  return Tone.Frequency(midi, 'midi').toFrequency();
}
function buildDrone() {
  const s = getState();
  const f = droneFreq();
  const mk = (freq, vol, type = 'sawtooth') => {
    const o = new Tone.FatOscillator({ frequency: freq, type, count: 3, spread: 16, volume: vol }).connect(E.droneFilter);
    o.start();
    return { o, ratio: freq / f };
  };
  E.droneOscs = [mk(f, -14), mk(f * 2, -24), mk(f / 2, -16, 'sine')];
  if (s.droneFifth) E.droneOscs.push(mk(f * 1.5, -19));
}
function disposeDrone(delay = 0) {
  const old = E.droneOscs;
  E.droneOscs = [];
  setTimeout(() => old.forEach(({ o }) => { o.stop(); o.dispose(); }), delay);
}
export async function setDrone(patch) {
  setState(patch);
  const s = getState();
  if (!s.droneOn && !E) return;
  await ensureAudio();
  if (!s.droneOn) {
    E.droneGain.gain.rampTo(0, 0.8);
    disposeDrone(1000);
  } else if ('droneFifth' in patch || 'droneOn' in patch || !E.droneOscs.length) {
    disposeDrone(0);
    buildDrone();
    E.droneGain.gain.rampTo(s.droneVolume, 1.2);
  } else {
    const f = droneFreq();
    E.droneOscs.forEach(({ o, ratio }) => o.frequency.rampTo(f * ratio, 0.25));
    E.droneGain.gain.rampTo(s.droneVolume, 0.2);
  }
  syncWakeLock();
}

/* ───────── 節拍器 + 配樂(共用同一個時脈) ───────── */
let loopId = null;
let step = 0;
let backing = null;

async function loadRhythmSection() {
  if (!E.bass) {
    E.bass = { ok: false };
    try {
      const inst = Soundfont(E.ctx, { instrument: 'electric_bass_finger', destination: E.bassIn, storage: storage(), volume: 110 });
      withTimeout(inst.ready, LOAD_TIMEOUT).then(() => { E.bass = { inst, ok: true }; }).catch(() => {});
    } catch { /* 用合成貝斯 */ }
  }
  if (!E.drums && getState().drumKit === 'sampled') {
    E.drums = { ok: false };
    setState({ drumStatus: 'loading' });
    try {
      const inst = DrumMachine(E.ctx, { instrument: 'LM-2', destination: E.drumsIn, storage: storage(), volume: 105 });
      withTimeout(inst.ready, LOAD_TIMEOUT)
        .then(() => {
          // 各家鼓機的取樣命名不同,用名稱去對出大鼓、小鼓、閉合 hi-hat
          const names = [...inst.getSampleNames(), ...inst.getGroupNames()];
          const find = (...res) => {
            for (const re of res) {
              const g = names.find((name) => re.test(name));
              if (g) return g;
            }
            return null;
          };
          const map = {
            kick: find(/^kick/i, /kick|^bd|bass.?drum/i),
            snare: find(/^snare/i, /snare|^sd/i, /clap|rim/i),
            hat: find(/(hh|hat).*(cl|closed)|closed.*(hh|hat)|^chh|^hhc/i, /^hh|hi.?hat|hat/i),
          };
          if (map.kick && map.snare && map.hat) {
            E.drums = { inst, ok: true, map };
            setState({ drumStatus: 'ready' });
          } else {
            setState({ drumStatus: 'failed' });
          }
        })
        .catch(() => setState({ drumStatus: 'failed' }));
    } catch {
      setState({ drumStatus: 'failed' });
    }
  }
}

function drumHit(kind, time) {
  const useSamples = getState().drumKit === 'sampled' && E.drums?.ok;
  if (useSamples) {
    E.drums.inst.start({ note: E.drums.map[kind], time, velocity: kind === 'hat' ? 70 : 105 });
  } else if (kind === 'kick') E.kick.triggerAttackRelease(48, 0.3, time);
  else if (kind === 'snare') E.snare.triggerAttackRelease(0.18, time);
  else E.hat.triggerAttackRelease(0.04, time);
}

function bassNote(midi, time, duration) {
  if (E.bass?.ok) E.bass.inst.start({ note: midi, time, duration, velocity: 100 });
  else E.bassSynth.triggerAttackRelease(Tone.Frequency(midi, 'midi').toFrequency(), duration * 0.9, time, 0.8);
}

function tick(time) {
  const s = getState();
  const b = backing;
  const sig = TIME_SIGS[b ? b.timeSig : s.timeSig] || TIME_SIGS['4/4'];
  const pos = step % sig.steps;
  const bar = Math.floor(step / sig.steps);
  const stepDur = Tone.Time('16n').toSeconds();
  const counting = b && bar < 1;

  if (pos % sig.beatEvery === 0) {
    const level = pos === 0 ? 2 : sig.accents.includes(pos) ? 1 : 0;
    const audible = counting || (b ? s.mix.click : s.metronomeOn);
    if (audible) E.click.triggerAttackRelease(level === 2 ? 1568 : level === 1 ? 1175 : 880, 0.05, time, level === 2 ? 1 : 0.55);
    const beat = pos / sig.beatEvery;
    Tone.getDraw().schedule(() => setState({ beat, beatLevel: level }), time);
  }

  if (b && !counting) {
    const idx = (bar - 1) % b.bars.length;
    const chord = b.bars[idx];
    const barDur = stepDur * sig.steps;
    if (pos === 0) {
      Tone.getDraw().schedule(() => setState({ backingBar: idx, backingCountIn: false }), time);
      if (s.mix.pad) E.pad.triggerAttackRelease(chord.padFreqs, barDur * 0.96, time, 0.5);
      if (s.mix.guitar) chord.midis.forEach((m, i) => guitarNote(m, time + i * 0.028, barDur * 1.05, 78));
    }
    const p = b.pattern;
    if (s.mix.drums) {
      if (p.kick[pos] === 'x') drumHit('kick', time);
      if (p.snare[pos] === 'x') drumHit('snare', time);
      if (p.hat[pos] === 'x') drumHit('hat', time);
    }
    const bc = p.bass[pos];
    if (s.mix.bass && bc && bc !== '.') {
      let len = 1;
      while (pos + len < sig.steps && p.bass[pos + len] === '.') len++;
      const midi = chord.bassMidi + (bc === 'o' ? 12 : bc === '5' ? 7 : 0);
      bassNote(midi, time, Math.min(len, 8) * stepDur * 0.95);
    }
  }
  step++;
}

function startTransport() {
  const T = Tone.getTransport();
  T.stop();
  T.cancel();
  T.bpm.value = getState().bpm;
  step = 0;
  loopId = T.scheduleRepeat(tick, '16n');
  T.start('+0.08');
}
function stopTransport() {
  const T = Tone.getTransport();
  T.stop();
  T.cancel();
  loopId = null;
  if (E) E.pad.releaseAll();
}

export function setBpm(bpm) {
  const v = Math.max(30, Math.min(240, Math.round(bpm)));
  setState({ bpm: v });
  if (E) Tone.getTransport().bpm.rampTo(v, 0.05);
}

export async function setMetronome(on) {
  await ensureAudio();
  setState({ metronomeOn: on, beat: -1 });
  if (on && loopId === null) startTransport();
  if (!on && !backing) stopTransport();
  syncWakeLock();
}

export function setTimeSig(timeSig) {
  setState({ timeSig });
  if (E && getState().metronomeOn && !backing) startTransport();
}

function prepareBacking(prog, styleId) {
  const pattern = CHORD_LAB.drumPatterns[styleId] || CHORD_LAB.drumPatterns[prog.style] || CHORD_LAB.drumPatterns.none;
  const bars = prog.bars.map((id) => {
    const chord = CHORD_INDEX[id];
    const a = analyzeChord(chord);
    const bassChroma = Note.chroma(plain(chord.bass || chord.root));
    let bassMidi = 24 + bassChroma;
    if (bassMidi < 28) bassMidi += 12;
    // Pad:根音在下,其餘和弦內音往上疊
    const chromas = [...new Set(a.midis.map((m) => m % 12))];
    const rootChroma = Note.chroma(plain(chord.root));
    const ordered = chromas.sort((x, y) => ((x - rootChroma + 12) % 12) - ((y - rootChroma + 12) % 12));
    let prev = 47;
    const padMidis = ordered.slice(0, 5).map((c) => {
      let m = 48 + c;
      while (m <= prev) m += 12;
      prev = m;
      return m;
    });
    return { id, chord, midis: a.midis, bassMidi, padFreqs: padMidis.map((m) => Tone.Frequency(m, 'midi').toFrequency()) };
  });
  return { id: prog.id, bars, pattern, timeSig: pattern.timeSig || '4/4' };
}

export async function startBacking(prog, styleId) {
  await ensureAudio();
  loadRhythmSection();
  backing = prepareBacking(prog, styleId);
  setState({ backingId: prog.id, backingBar: -1, backingCountIn: true, beat: -1 });
  startTransport();
  syncWakeLock();
}

export function stopBacking() {
  backing = null;
  setState({ backingId: null, backingBar: -1, backingCountIn: false, beat: -1 });
  if (!E) return;
  stopGuitar();
  if (getState().metronomeOn) startTransport();
  else stopTransport();
  syncWakeLock();
}

export function setMix(patch) {
  setState({ mix: { ...getState().mix, ...patch } });
}

export function setDrumKit(drumKit) {
  setState({ drumKit });
  if (E && backing) loadRhythmSection();
}

/* ───────── 播放中保持螢幕不關 ───────── */
let wakeLock = null;
async function syncWakeLock() {
  const s = getState();
  const active = s.metronomeOn || s.droneOn || !!s.backingId;
  try {
    if (active && !wakeLock && 'wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!active && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch { /* 不支援或被拒絕就算了 */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncWakeLock();
});
