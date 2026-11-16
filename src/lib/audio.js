// 音訊引擎:Tone.js 負責時脈、合成音、效果;smplr 負責取樣音色(吉他、貝斯、鼓)
import * as Tone from 'tone';
import { Soundfont, DrumMachine, CacheStorage } from 'smplr';
import { Note } from 'tonal';
import { CHORD_LAB } from '../data/chords.js';
import { analyzeChord, CHORD_BY_ID, TUNING_MIDI, plain } from './theory.js';
import { getState, setState, MIX_DEFAULT } from './store.js';

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

/** 配樂的音軌(混音器的順序) */
export const MIX_TRACKS = [
  { id: 'drums', name: '鼓' },
  { id: 'bass', name: '貝斯' },
  { id: 'pad', name: '鋪底' },
  { id: 'guitar', name: '吉他示範' },
  { id: 'click', name: '節拍器' },
];
/** 推桿位置(0–1)→ 音量倍率。70% 是原本的音量,100% 約大一倍,曲線取平方讓小音量比較好調 */
const mixLevel = (id) => {
  const v = getState().mixVol?.[id];
  return ((typeof v === 'number' ? v : MIX_DEFAULT) / MIX_DEFAULT) ** 2;
};
/** 取樣樂器用力度控制音量時用(力度到音量本身就是平方關係) */
const mixVelocity = (id) => Math.sqrt(mixLevel(id));
const BASE_GAIN = { drums: 0.8, bass: 0.9, pad: 1, click: 1 };

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
  const padLevel = new Tone.Gain(BASE_GAIN.pad * mixLevel('pad')).fan(padGain, padSend);
  const padFilter = new Tone.Filter(1100, 'lowpass').connect(padLevel);
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
  const bassGain = new Tone.Gain(BASE_GAIN.bass * mixLevel('bass')).connect(master);
  Tone.connect(bassIn, bassGain);
  const bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 120, octaves: 2.5 },
    volume: -8,
  }).connect(bassGain);

  const drumsIn = ctx.createGain();
  const drumGain = new Tone.Gain(BASE_GAIN.drums * mixLevel('drums')).connect(master);
  const drumSend = new Tone.Gain(0.12).connect(reverb);
  Tone.connect(drumsIn, drumGain);
  drumGain.connect(drumSend);
  const kick = new Tone.MembraneSynth({ pitchDecay: 0.04, octaves: 6, envelope: { attack: 0.001, decay: 0.35, sustain: 0 }, volume: -4 }).connect(drumGain);
  const snareTone = new Tone.Filter(1800, 'highpass').connect(drumGain);
  const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.19, sustain: 0 }, volume: -10 }).connect(snareTone);
  const hatTone = new Tone.Filter(7500, 'highpass').connect(drumGain);
  const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 }, volume: -20 }).connect(hatTone);

  const clickGain = new Tone.Gain(BASE_GAIN.click * mixLevel('click')).connect(master);
  const click = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
    volume: -6,
  }).connect(clickGain);

  E = {
    ctx, master, reverb, guitarIn, fuzz, fuzzTone, chorus, guitarSend, synth, pad, padGain,
    droneGain, droneFilter, bassIn, bassSynth, drumsIn, kick, snare, hat, click,
    levels: { drums: drumGain, bass: bassGain, pad: padLevel, click: clickGain },
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
let loopGen = 0; // 每次重新開始就加一,舊迴圈殘留的回呼靠它擋掉
let lastTick = -1;
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

/** 合成音的排程時間一旦早於上一個音,Tone 會丟例外;單一個音出錯不能讓整個節拍停下來 */
function safely(fn) {
  try {
    fn();
  } catch (err) {
    console.warn('略過一個音', err);
  }
}

/** 節奏型裡的字元 → 力度倍率:X 重音、x 一般、o 輕 */
const HIT_LEVEL = { X: 1.18, x: 1, o: 0.55 };

function drumHit(kind, time, level = 1) {
  const useSamples = getState().drumKit === 'sampled' && E.drums?.ok;
  if (useSamples) {
    const velocity = Math.max(1, Math.min(127, Math.round((kind === 'hat' ? 70 : 105) * level)));
    E.drums.inst.start({ note: E.drums.map[kind], time, velocity });
  } else {
    const velocity = Math.min(1, 0.85 * level * level);
    safely(() => {
      if (kind === 'kick') E.kick.triggerAttackRelease(48, 0.3, time, velocity);
      else if (kind === 'snare') E.snare.triggerAttackRelease(0.18, time, velocity);
      else E.hat.triggerAttackRelease(0.04, time, velocity);
    });
  }
}

function bassNote(midi, time, duration) {
  if (E.bass?.ok) E.bass.inst.start({ note: midi, time, duration, velocity: 100 });
  else safely(() => E.bassSynth.triggerAttackRelease(Tone.Frequency(midi, 'midi').toFrequency(), duration * 0.9, time, 0.8));
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
    if (audible) safely(() => E.click.triggerAttackRelease(level === 2 ? 1568 : level === 1 ? 1175 : 880, 0.05, time, level === 2 ? 1 : 0.55));
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
      if (s.mix.guitar) {
        const velocity = Math.max(1, Math.min(127, Math.round(78 * mixVelocity('guitar'))));
        chord.midis.forEach((m, i) => guitarNote(m, time + i * 0.028, barDur * 1.05, velocity));
      }
    }
    const p = b.pattern;
    // Swing:反拍的八分音符往後推
    const late = p.swing && pos % 4 === 2 ? p.swing * stepDur : 0;
    const t = time + late;
    if (s.mix.drums) {
      for (const kind of ['kick', 'snare', 'hat']) {
        const level = HIT_LEVEL[p[kind][pos]];
        if (level) drumHit(kind, t, level);
      }
    }
    const bc = p.bass[pos];
    if (s.mix.bass && bc && bc !== '.' && bc !== '-') {
      let len = 1;
      while (pos + len < sig.steps && p.bass[pos + len] === '.') len++;
      const up = bc === 'o' ? 12 : bc === '5' ? 7 : bc === '3' ? chord.third : bc === '7' ? chord.seventh : 0;
      // 被往後推的音要縮短,才不會蓋到下一個音
      bassNote(chord.bassMidi + up, t, (Math.min(len, 8) * stepDur - late) * 0.95);
    }
  }
  step++;
}

/** 換曲、換節奏、停止時:把合成貝斯已經排好的音收掉,不然下一個音會排在它的前面 */
function releaseSynths() {
  if (!E) return;
  E.pad.releaseAll();
  safely(() => {
    const now = Tone.now();
    E.bassSynth.envelope.cancel(now);
    E.bassSynth.filterEnvelope.cancel(now);
    E.bassSynth.triggerRelease(now);
  });
}
function clearLoop() {
  const T = Tone.getTransport();
  loopGen++;
  if (loopId !== null) T.clear(loopId);
  loopId = null;
  T.stop();
  T.cancel();
  releaseSynths();
}
function startTransport() {
  const T = Tone.getTransport();
  clearLoop();
  T.bpm.value = getState().bpm;
  step = 0;
  lastTick = -1;
  // 播放中換曲或換節奏時,Tone 偶爾會留下舊迴圈的回呼,同一個十六分音符就會被算兩三次(聽起來變成兩三倍速)。
  // 這裡只認「這一次開始的迴圈」,而且同一個時間點只算一次。
  const gen = loopGen;
  loopId = T.scheduleRepeat((time) => {
    if (gen !== loopGen || time <= lastTick + 0.001) return;
    lastTick = time;
    tick(time);
  }, '16n');
  // 起點要晚於 Tone 已經預先排出去的音(預排約 0.1 秒)
  T.start('+0.2');
}
function stopTransport() {
  clearLoop();
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
    const chord = CHORD_BY_ID[id];
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
    // 貝斯走音用:這個和弦的三度與七度(以貝斯音為準;沒有的話退回五度、高八度)
    const fromBass = new Set(chromas.map((c) => (c - bassChroma + 12) % 12));
    const third = fromBass.has(4) ? 4 : fromBass.has(3) ? 3 : 7;
    const seventh = fromBass.has(10) ? 10 : fromBass.has(11) ? 11 : 12;
    return { id, chord, midis: a.midis, bassMidi, third, seventh, padFreqs: padMidis.map((m) => Tone.Frequency(m, 'midi').toFrequency()) };
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

/** 調整各音軌的音量,patch 例如 { bass: 0.5 }(0–1) */
export function setMixVolume(patch) {
  setState({ mixVol: { ...getState().mixVol, ...patch } });
  if (!E) return;
  for (const id of Object.keys(patch)) {
    const node = E.levels[id];
    if (node) node.gain.rampTo(BASE_GAIN[id] * mixLevel(id), 0.05);
  }
}
export function resetMixVolume() {
  setMixVolume(Object.fromEntries(MIX_TRACKS.map((t) => [t.id, MIX_DEFAULT])));
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
