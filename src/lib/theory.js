// 樂理計算:由調弦 + 琴格算出音名、級數、和弦圖需要的資料(使用 tonal)
import { Note } from 'tonal';
import { CHORD_LAB } from '../data/chords.js';

export const TUNING = CHORD_LAB.tuning;
export const TUNING_MIDI = TUNING.map((n) => Note.midi(n));
export const STRING_NAMES = TUNING.map((n) => Note.pitchClass(n));

const SEMI_TO_IVL = ['1P', '2m', '2M', '3m', '3M', '4P', '4A', '5P', '6m', '6M', '7m', '7M'];
const SEMI_TO_DEGREE = ['R', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];

export const pretty = (name) => String(name).replace(/#/g, '♯').replace(/b/g, '♭');
export const plain = (name) => String(name).replace(/♯/g, '#').replace(/♭/g, 'b');

/** 'x32010' 或 'x x 10 12 13 12' → [null,3,2,0,1,0](第 6 弦 → 第 1 弦) */
export function parseFrets(input) {
  if (Array.isArray(input)) return input.map((f) => (f === null || f < 0 ? null : f));
  const s = String(input).trim();
  const parts = /\s/.test(s) ? s.split(/\s+/) : s.split('');
  return parts.map((p) => (/^x$/i.test(p) ? null : parseInt(p, 10)));
}

export function parseFingers(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((f) => (f >= 1 && f <= 4 ? f : 0));
  const s = String(input).trim();
  const parts = /\s/.test(s) ? s.split(/\s+/) : s.split('');
  return parts.map((p) => (/^[1-4]$/.test(p) ? parseInt(p, 10) : 0));
}

/** 以根音為準拼出音名(根音是 F 時,小三度會拼成 A♭ 而不是 G♯) */
export function spell(root, semis) {
  const n = Note.transpose(plain(root), SEMI_TO_IVL[((semis % 12) + 12) % 12]);
  const pc = Note.pitchClass(n);
  return /##|bb/.test(pc) ? Note.pitchClass(Note.simplify(pc)) : pc;
}

export function degreeLabel(semis, chordName = '') {
  let d = SEMI_TO_DEGREE[((semis % 12) + 12) % 12];
  if (d === '2' && /9/.test(chordName)) d = '9';
  if (d === '4' && /11/.test(chordName)) d = '11';
  return d;
}

/** 把一筆和弦資料展開成每條弦的詳細資訊 */
export function analyzeChord(chord) {
  const frets = parseFrets(chord.frets);
  const fingers = parseFingers(chord.fingers);
  const rootChroma = Note.chroma(plain(chord.root));
  const strings = frets.map((fret, i) => {
    const stringNo = 6 - i; // 6 = 最粗
    if (fret === null || Number.isNaN(fret)) return { stringNo, fret: null };
    const midi = TUNING_MIDI[i] + fret;
    const semis = (((midi % 12) - rootChroma) % 12 + 12) % 12;
    return {
      stringNo,
      fret,
      midi,
      finger: fingers[i] || 0,
      semis,
      note: spell(chord.root, semis),
      degree: degreeLabel(semis, chord.name),
      isRoot: semis === 0,
    };
  });
  const fretted = strings.filter((s) => s.fret > 0).map((s) => s.fret);
  const max = fretted.length ? Math.max(...fretted) : 0;
  const min = fretted.length ? Math.min(...fretted) : 1;
  const position = max <= 4 ? 1 : min;
  const span = Math.max(4, max - position + 1);

  // 同一根手指、同一格、兩條弦以上 → 封閉
  const barres = [];
  for (let f = 1; f <= 4; f++) {
    const held = strings.filter((s) => s.finger === f && s.fret > 0);
    if (held.length < 2) continue;
    const fret = held[0].fret;
    if (!held.every((s) => s.fret === fret)) continue;
    barres.push({
      finger: f,
      fret,
      fromString: Math.max(...held.map((s) => s.stringNo)),
      toString: Math.min(...held.map((s) => s.stringNo)),
    });
  }
  return { strings, position, span, barres, midis: strings.filter((s) => s.fret !== null).map((s) => s.midi) };
}

/** 所有和弦的 id → 和弦資料(配樂用) */
export const CHORD_INDEX = (() => {
  const map = {};
  for (const unit of CHORD_LAB.units)
    for (const sec of unit.sections) for (const c of sec.chords || []) map[c.id] = c;
  return map;
})();

export const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/** 指板上某一點的音高 */
export function midiAt(stringNo, fret) {
  return TUNING_MIDI[6 - stringNo] + fret;
}

/** CAGED:某個根音、某個指型在指板上的所有點(可能有低八度與高八度兩組) */
export function cagedPositions(root, quality, maxFret = 15) {
  const rootChroma = Note.chroma(plain(root));
  const out = [];
  for (const tpl of CHORD_LAB.cagedShapes[quality]) {
    const rel = parseFrets(tpl.frets);
    const open = TUNING_MIDI[6 - tpl.rootOn] % 12;
    const rootFret = ((rootChroma - open) % 12 + 12) % 12;
    for (let base = rootFret - tpl.rootAt - 12; base <= maxFret; base += 12) {
      const dots = [];
      let ok = true;
      rel.forEach((r, i) => {
        if (r === null) return;
        const fret = base + r;
        if (fret < 0 || fret > maxFret) ok = false;
        const stringNo = 6 - i;
        const midi = TUNING_MIDI[i] + fret;
        const semis = (((midi % 12) - rootChroma) % 12 + 12) % 12;
        dots.push({ string: stringNo, fret, midi, semis, note: spell(root, semis), degree: degreeLabel(semis), shape: tpl.shape });
      });
      if (ok) out.push({ shape: tpl.shape, base, dots });
    }
  }
  return out.sort((a, b) => a.base - b.base);
}

/** 三和弦在三條相鄰弦上的三個轉位。strings 例如 [3,2,1] */
export function triadPositions(root, quality, strings, maxFret = 15) {
  const rootChroma = Note.chroma(plain(root));
  const tones = quality === 'minor' ? [0, 3, 7] : [0, 4, 7];
  const names = ['根音位置', '第一轉位', '第二轉位'];
  const out = [];
  for (let inv = 0; inv < 3; inv++) {
    const order = [tones[inv], tones[(inv + 1) % 3], tones[(inv + 2) % 3]];
    const lowIdx = 6 - strings[0];
    let f0 = (((rootChroma + order[0]) % 12) - (TUNING_MIDI[lowIdx] % 12) + 12) % 12;
    for (; f0 <= maxFret; f0 += 12) {
      const dots = [];
      let prevMidi = -1;
      let ok = true;
      strings.forEach((stringNo, k) => {
        const idx = 6 - stringNo;
        let fret = (((rootChroma + order[k]) % 12) - (TUNING_MIDI[idx] % 12) + 12) % 12;
        // 找離最低弦那一格最近、而且音高往上的位置
        const candidates = [fret - 12, fret, fret + 12, fret + 24].filter((f) => f >= 0 && f <= maxFret && TUNING_MIDI[idx] + f > prevMidi);
        candidates.sort((a, b) => Math.abs(a - f0) - Math.abs(b - f0));
        if (!candidates.length || Math.abs(candidates[0] - f0) > 4) { ok = false; return; }
        fret = candidates[0];
        const midi = TUNING_MIDI[idx] + fret;
        prevMidi = midi;
        const semis = order[k];
        dots.push({ string: stringNo, fret, midi, semis, note: spell(root, semis), degree: degreeLabel(semis), inversion: inv });
      });
      if (ok && dots.length === 3) out.push({ inversion: inv, name: names[inv], dots });
    }
  }
  return out.sort((a, b) => a.dots[0].fret - b.dots[0].fret);
}

/** 某個音階在整條指板上的所有點 */
export function scalePositions(root, intervals, maxFret = 12) {
  const rootChroma = Note.chroma(plain(root));
  const dots = [];
  for (let i = 0; i < 6; i++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const midi = TUNING_MIDI[i] + fret;
      const semis = (((midi % 12) - rootChroma) % 12 + 12) % 12;
      if (intervals.includes(semis)) dots.push({ string: 6 - i, fret, midi, semis, note: spell(root, semis), degree: degreeLabel(semis) });
    }
  }
  return dots;
}
