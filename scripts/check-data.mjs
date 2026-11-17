// 檢查資料有沒有寫錯:npm run check
//   1. 和弦資料庫套用 chord-fixes.js 之後,每個指型的音與指法都對
//   2. 配樂的每個小節都找得到和弦,節奏型長度正確,和弦庫的指型按出來是那個和弦
import { createRequire } from 'node:module';
import { Note } from 'tonal';
import { CHORD_LAB } from '../src/data/chords.js';
import { CHORD_FIXES } from '../src/data/chord-fixes.js';
import { CHORD_BY_ID, TUNING_MIDI, analyzeChord, plain } from '../src/lib/theory.js';
import { TYPE_TONES, chordSlug, chordTones, dbVoicings } from '../src/lib/chordbook.js';

const db = createRequire(import.meta.url)('@tombatossals/chords-db/lib/guitar.json');
const problems = [];
const fretText = (frets) => frets.map((f) => f ?? 'x').join(' ');

/* ───── 1. 和弦資料庫 ───── */
// 決定「這是什麼和弦」的音,指型裡一定要有(離根音幾個半音)
const NEED = {
  major: [4], minor: [3], dim: [3, 6], dim7: [3, 6, 9], aug: [4, 8], alt: [4, 6], sus2: [2], sus4: [5], '7sus4': [5, 10],
  '6': [4, 9], '69': [4, 9, 2], m6: [3, 9], m69: [3, 9, 2], '7': [4, 10], '7b5': [4, 6, 10], aug7: [4, 8, 10], '7b9': [4, 10, 1], '7#9': [4, 10, 3], '7sg': [4, 10],
  '9': [4, 10, 2], '9b5': [4, 6, 10, 2], aug9: [4, 8, 10, 2], '9#11': [4, 10, 6], '11': [10, 5], '13': [4, 10, 9],
  maj7: [4, 11], maj7b5: [4, 6, 11], 'maj7#5': [4, 8, 11], maj9: [4, 11, 2], maj11: [11, 5], maj13: [4, 11, 9],
  m7: [3, 10], m7b5: [3, 6, 10], m9: [3, 10, 2], m11: [3, 10, 5], mmaj7: [3, 11], mmaj7b5: [3, 6, 11], mmaj9: [3, 11, 2], mmaj11: [3, 11, 5],
  add9: [4, 2], madd9: [3, 2],
};
let voicings = 0;
let hidden = 0;
for (const root of db.keys) {
  for (const entry of db.chords[root.replace('#', 'sharp')]) {
    const { suffix } = entry;
    const name = chordSlug(root, suffix);
    const slash = suffix.match(/^(m?)\/(.+)$/);
    if (!slash && !TYPE_TONES[suffix]) problems.push(`${name}:TYPE_TONES 沒有「${suffix}」這個類型`);
    const list = dbVoicings(db, root, suffix);
    const removed = CHORD_FIXES.filter((f) => f[0] === root && f[1] === suffix && f[4] === null).length;
    hidden += entry.positions.length - list.length - removed;
    if (list.length !== entry.positions.length - removed) problems.push(`${name}:有 ${entry.positions.length - removed - list.length} 個指型含和弦以外的音,已被隱藏,請在 chord-fixes.js 補上更正`);
    if (!list.length) problems.push(`${name}:一個指型都沒有`);
    const rootChroma = Note.chroma(root);
    const need = slash ? NEED[slash[1] ? 'minor' : 'major'] : NEED[suffix] || [];
    for (const v of list) {
      voicings++;
      const where = `${name} ${v.label} [${fretText(v.frets)}]`;
      const sounding = v.frets.map((f, s) => (f === null ? null : TUNING_MIDI[s] + f));
      const tones = new Set(sounding.filter((m) => m !== null).map((m) => (m - rootChroma + 120) % 12));
      const missing = need.filter((t) => !tones.has(t));
      if (missing.length) problems.push(`${where}:少了關鍵的音(離根音 ${missing.join('、')} 個半音)`);
      if (slash && sounding.find((m) => m !== null) % 12 !== Note.chroma(slash[2])) problems.push(`${where}:最低音不是 ${slash[2]}`);
      // 指法:按著的弦要有手指,空弦與不彈的弦不能有;同一根手指只能在同一格;手指編號要由低把位往高把位排
      const byFinger = {};
      v.frets.forEach((f, s) => {
        const finger = v.fingers[s] || 0;
        if (f > 0 && !finger) problems.push(`${where}:第 ${6 - s} 弦沒有標手指`);
        if (!(f > 0) && finger) problems.push(`${where}:第 ${6 - s} 弦沒有按卻標了手指`);
        if (f > 0 && finger) (byFinger[finger] ||= new Set()).add(f);
      });
      const used = [1, 2, 3, 4].filter((n) => byFinger[n]);
      if (used.some((n) => byFinger[n].size > 1)) problems.push(`${where}:同一根手指按了不同格`);
      else if (used.some((n, k) => k > 0 && [...byFinger[n]][0] < [...byFinger[used[k - 1]]][0])) problems.push(`${where}:手指編號和琴格的高低對不上`);
    }
  }
}
// 每一筆更正都要對得上資料庫裡原本的那個指型
for (const [root, suffix, n, was] of CHORD_FIXES) {
  const p = db.chords[root.replace('#', 'sharp')]?.find((c) => c.suffix === suffix)?.positions[n - 1];
  const now = p && fretText(p.frets.map((f) => (f < 0 ? null : f === 0 ? 0 : f + p.baseFret - 1)));
  if (now !== was) problems.push(`更正 ${chordSlug(root, suffix)} #${n} 沒有套用:資料庫現在是 [${now}],更正表寫的是 [${was}]`);
}

/* ───── 2. 配樂 ───── */
for (const c of CHORD_LAB.library) {
  const a = analyzeChord(c);
  const type = c.id.split('@')[0].replace(/^[A-G][#b]?/, '');
  const suffix = { '': 'major', m: 'minor', AmMaj7: 'mmaj7', mMaj7: 'mmaj7' }[type] ?? type;
  const allowed = suffix === '5' ? new Set([0, 7].map((t) => (Note.chroma(c.root) + t) % 12)) : chordTones(c.root, suffix);
  if (!allowed) problems.push(`library ${c.id}:不認得的類型「${type}」`);
  else if (a.midis.some((m) => !allowed.has(m % 12))) problems.push(`library ${c.id}:有和弦以外的音`);
  if (a.midis[0] % 12 !== Note.chroma(plain(c.root))) problems.push(`library ${c.id}:最低音不是根音`);
}
const cats = new Set(CHORD_LAB.progressionCats.map((c) => c.id));
const seen = new Set();
for (const p of CHORD_LAB.progressions) {
  if (seen.has(p.id)) problems.push(`配樂 ${p.id}:id 重複`);
  seen.add(p.id);
  if (!cats.has(p.cat)) problems.push(`配樂 ${p.id}:沒有「${p.cat}」這個分類`);
  if (!CHORD_LAB.drumPatterns[p.style]) problems.push(`配樂 ${p.id}:沒有「${p.style}」這個節奏`);
  for (const b of p.bars) if (!CHORD_BY_ID[b]) problems.push(`配樂 ${p.id}:找不到和弦「${b}」`);
}
for (const [id, p] of Object.entries(CHORD_LAB.drumPatterns)) {
  const steps = p.timeSig === '4/4' ? 16 : 12;
  for (const track of ['kick', 'snare', 'hat', 'bass']) if (p[track].length !== steps) problems.push(`節奏 ${id}:${track} 應該是 ${steps} 個字元,現在是 ${p[track].length}`);
}

console.log(`和弦資料庫:${voicings} 個指型,套用 ${CHORD_FIXES.length} 筆更正`);
console.log(`配樂:${CHORD_LAB.progressions.length} 段進行、${Object.keys(CHORD_LAB.drumPatterns).length} 種節奏、和弦庫 ${CHORD_LAB.library.length} 個和弦`);
if (problems.length) {
  console.error(`\n發現 ${problems.length} 個問題:\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
console.log('全部通過 ✓');
