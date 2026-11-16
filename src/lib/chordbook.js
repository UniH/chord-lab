// 和弦表的資料整理與搜尋。和弦指型來自 @tombatossals/chords-db(用到時才載入)
import { Chord, Key, Note } from 'tonal';
import { KEYS, TUNING_MIDI, pretty } from './theory.js';

let dbPromise = null;
export const loadChordDb = () => (dbPromise ||= import('@tombatossals/chords-db/lib/guitar.json').then((m) => m.default || m));

/** 類型按鈕的順序,也是搜尋結果的排序依據 */
export const COMMON_TYPES = ['major', 'minor', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9', 'madd9', '6', 'm6', '9', 'maj9', 'm9', '7sus4', 'dim', 'aug'];

/** 沒有輸入任何東西時顯示的常用和弦 */
export const COMMON_GROUPS = [
  { title: '開放和弦', note: '最先學、也最常用的八個和弦。', chords: ['C', 'D', 'E', 'G', 'A', 'Am', 'Dm', 'Em'] },
  { title: '封閉和弦', note: '食指橫按,整個指型可以平移到任何一格。', chords: ['F', 'B', 'Bb', 'Bm', 'F#m', 'C#m', 'Cm', 'Gm'] },
  { title: '屬七和弦', note: '藍調與搖滾的基本色彩。', chords: ['A7', 'B7', 'C7', 'D7', 'E7', 'G7'] },
  { title: '大七與小七', note: '比三和弦柔一點、飄一點。', chords: ['Cmaj7', 'Dmaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Am7', 'Dm7', 'Em7', 'Bm7'] },
  { title: 'sus 與 add9', note: '把三度換掉或再加一個音,瞪鞋與後搖很常用。', chords: ['Dsus2', 'Dsus4', 'Asus2', 'Asus4', 'Esus4', 'Cadd9', 'Gadd9', 'Aadd9'] },
];

const TYPE_LABEL = { major: '大三和弦', minor: '小三和弦 m', '69': '6/9', mmaj7: 'm(maj7)', mmaj9: 'm(maj9)', mmaj11: 'm(maj11)', mmaj7b5: 'm(maj7)♭5', m69: 'm6/9' };
/** 類型按鈕上的文字 */
export const typeLabel = (s) => pretty(TYPE_LABEL[s] || s);
/** 接在根音後面的文字:major → ''、minor → 'm' */
export const typeText = (s) => (s === 'major' ? '' : s === 'minor' ? 'm' : pretty(TYPE_LABEL[s] || s));
export const chordName = (root, suffix) => pretty(root) + typeText(suffix);
/** 網址與搜尋用的純文字名稱:F#m7、Bbmaj7、C/E */
export const chordSlug = (root, suffix) => root + (suffix === 'major' ? '' : suffix === 'minor' ? 'm' : suffix);
export const chordHref = (root, suffix) => `#/chords/${encodeURIComponent(chordSlug(root, suffix))}`;

/** 每個類型除了本名以外還能用哪些字找到 */
const TYPE_WORDS = {
  major: ['maj', 'major', 'M', '大三', '大三和弦', '大和弦', '大調', '大'],
  minor: ['m', 'min', 'minor', '-', '小三', '小三和弦', '小和弦', '小調', '小'],
  '7': ['dom7', '屬七', '屬七和弦', '屬'],
  maj7: ['M7', 'major7', 'Δ', '△', '大七', '大七和弦'],
  m7: ['min7', 'minor7', '-7', '小七', '小七和弦'],
  sus2: ['2', '掛二', '掛留二'],
  sus4: ['sus', '4', '掛四', '掛留', '掛留四'],
  add9: ['add2', '加九'],
  madd9: ['madd2', 'm(add9)', '小加九'],
  '6': ['大六', '六'],
  m6: ['min6', '小六'],
  '9': ['dom9', '屬九', '九'],
  maj9: ['M9', '大九'],
  m9: ['min9', '小九'],
  '69': ['6/9'],
  m69: ['m6/9'],
  '7sus4': ['7sus'],
  dim: ['°', '減', '減三', '減和弦'],
  dim7: ['°7', '減七'],
  aug: ['+', '增', '增三', '增和弦'],
  aug7: ['7#5', '+7', '增七'],
  aug9: ['9#5'],
  m7b5: ['m7-5', 'ø', '半減', '半減七'],
  mmaj7: ['mM7', 'm(maj7)', 'minmaj7', '小大七'],
  mmaj9: ['mM9', 'm(maj9)'],
  '11': ['屬十一'],
  '13': ['屬十三'],
};

const ENHARMONIC = { Db: 'C#', 'D#': 'Eb', Gb: 'F#', 'G#': 'Ab', 'A#': 'Bb', Cb: 'B', 'B#': 'C', Fb: 'E', 'E#': 'F' };
const clean = (text) =>
  String(text)
    .normalize('NFKC')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .trim();

/** 'bb' → 'Bb'、'f#' → 'F#'、'Db' → 'C#'(換成資料庫用的寫法);不是音名就回傳 null */
function toKey(letter, accidental) {
  const name = letter.toUpperCase() + accidental;
  const key = ENHARMONIC[name] || name;
  return KEYS.includes(key) ? key : null;
}

/** 把開頭的根音拆出來 */
function splitRoot(text) {
  const m = text.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;
  const root = toKey(m[1], m[2]);
  return root ? { root, rest: m[3].replace(/\s+/g, '') } : null;
}

const commonRank = (s) => {
  const i = COMMON_TYPES.indexOf(s);
  return i < 0 ? 99 : i;
};

/** 用文字找類型,回傳 [{ suffix, score }],score 越小越符合(0、1 = 完全相同) */
function matchTypes(db, rest) {
  const q = rest.toLowerCase();
  const out = [];
  for (const suffix of db.suffixes) {
    const words = [suffix, ...(TYPE_WORDS[suffix] || [])];
    let score = 9;
    for (const w of words) {
      const lw = w.toLowerCase();
      if (w === rest) score = Math.min(score, 0);
      else if (lw === q) score = Math.min(score, 1);
      else if (lw.startsWith(q)) score = Math.min(score, 2);
      else if (q.length >= 2 && lw.includes(q)) score = Math.min(score, 3);
    }
    if (score < 9) out.push({ suffix, score });
  }
  return out.sort((a, b) => a.score - b.score || commonRank(a.suffix) - commonRank(b.suffix) || a.suffix.length - b.suffix.length);
}

/** 網址上的和弦名稱 → { root, suffix },找不到回傳 null */
export function parseChord(db, text) {
  const parts = splitRoot(clean(text));
  if (!parts) return null;
  const suffix = parts.rest === '' ? 'major' : parts.rest === 'm' ? 'minor' : parts.rest;
  return db.suffixes.includes(suffix) ? { root: parts.root, suffix } : null;
}

/** 資料庫裡某個和弦的所有指型,整理成和弦圖吃的格式 */
export function dbVoicings(db, root, suffix) {
  const entry = (db.chords[root.replace('#', 'sharp')] || []).find((c) => c.suffix === suffix);
  if (!entry) return [];
  return entry.positions.map((p, i) => ({
    id: `db-${root}-${suffix}-${i}`,
    name: chordName(root, suffix),
    label: `指型 ${i + 1}`,
    frets: p.frets.map((f) => (f < 0 ? null : f === 0 ? 0 : f + p.baseFret - 1)),
    fingers: p.fingers,
    root,
  }));
}
/** 最常用的那一個指型 */
export function dbVoicing(db, root, suffix, extra = {}) {
  const first = dbVoicings(db, root, suffix)[0];
  return first ? { ...first, label: '', ...extra } : null;
}

/* ───────── 用音名反查 ───────── */
const TONAL_SYMBOL = { major: 'M', minor: 'm', aug7: '7#5', aug9: '9#5', mmaj7: 'mM7', mmaj9: 'mM9', add9: 'Madd9' };
const tonesCache = new Map();
/** 某個和弦的組成音(0–11 的集合) */
function chordTones(db, root, suffix) {
  const id = `${root}|${suffix}`;
  if (!tonesCache.has(id)) {
    const notes = Chord.get(root + (TONAL_SYMBOL[suffix] ?? suffix)).notes;
    let tones = new Set(notes.map((n) => Note.chroma(n)));
    if (!tones.size) {
      // tonal 不認得的類型,改從指型裡的音算
      tones = new Set(dbVoicings(db, root, suffix).flatMap((v) => v.frets.map((f, i) => (f === null ? null : (TUNING_MIDI[i] + f) % 12)).filter((x) => x !== null)));
    }
    tonesCache.set(id, tones);
  }
  return tonesCache.get(id);
}

function searchByNotes(db, keys) {
  const wanted = new Set(keys.map((k) => Note.chroma(k)));
  const found = [];
  for (const root of KEYS) {
    for (const suffix of db.suffixes) {
      if (suffix.includes('/')) continue;
      const tones = chordTones(db, root, suffix);
      if (tones.size < wanted.size || ![...wanted].every((c) => tones.has(c))) continue;
      found.push({ root, suffix, extra: tones.size - wanted.size, first: root === keys[0] ? 0 : 1 });
    }
  }
  found.sort((a, b) => a.extra - b.extra || a.first - b.first || commonRank(a.suffix) - commonRank(b.suffix) || a.suffix.length - b.suffix.length);
  return found;
}

/**
 * 搜尋。回傳:
 *   exact  : 完全符合的那一個和弦(直接顯示它的所有指型)
 *   chords : 其他候選和弦 [{ root, suffix }]
 *   types  : 只輸入類型(例如 sus4)時,其他相近的類型
 *   title  : 候選區塊的標題        note : 找不到時的提示
 */
export function searchChords(db, input) {
  const text = clean(input);
  if (!text) return null;
  const none = { exact: null, chords: [], types: [], title: '' };

  // 1. 幾個音名(C E G)→ 反查包含這些音的和弦
  const tokens = text.split(/[\s,、,]+/).filter(Boolean);
  if (tokens.length >= 2) {
    const keys = tokens.map((t) => {
      const m = t.match(/^([A-Ga-g])([#b]?)$/);
      return m ? toKey(m[1], m[2]) : null;
    });
    if (keys.every(Boolean)) {
      const uniq = [...new Set(keys)];
      const found = searchByNotes(db, uniq);
      const names = uniq.map(pretty).join('、');
      if (!found.length) return { ...none, note: `找不到同時包含 ${names} 的和弦。` };
      const exact = found.filter((f) => f.extra === 0);
      return {
        ...none,
        chords: (exact.length ? [...exact, ...found.filter((f) => f.extra === 1)] : found).slice(0, 12),
        title: exact.length ? `由 ${names} 組成的和弦,以及多一個音的和弦` : `包含 ${names} 的和弦`,
      };
    }
  }

  // 2. 根音 + 類型(Am7、F#、C大七)
  const parts = splitRoot(text);
  const typeOnly = matchTypes(db, text.replace(/\s+/g, ''));
  if (parts) {
    const { root, rest } = parts;
    if (rest === '') {
      return { ...none, exact: { root, suffix: 'major' }, chords: COMMON_TYPES.slice(1).map((suffix) => ({ root, suffix })), title: `${pretty(root)} 的其他和弦` };
    }
    const types = matchTypes(db, rest);
    // dim、aug、add9 這些字的開頭剛好也是音名:整串字比較像類型時,當成類型來找
    const looksLikeType = typeOnly.length && typeOnly[0].score <= (types[0]?.score ?? 9) && (types[0]?.score ?? 9) > 1;
    if (types.length && !looksLikeType) {
      const exact = types[0].score <= 1 ? { root, suffix: types[0].suffix } : null;
      const others = types.slice(exact ? 1 : 0, exact ? 13 : 12).map((t) => ({ root, suffix: t.suffix }));
      return { ...none, exact, chords: others, title: exact ? '相近的和弦' : `${pretty(root)} 開頭、符合「${rest}」的和弦` };
    }
  }

  // 3. 只有類型(sus4、maj7、dim、大七)→ 列出十二個根音
  if (typeOnly.length) {
    const best = typeOnly[0].suffix;
    return {
      ...none,
      chords: KEYS.map((root) => ({ root, suffix: best })),
      types: typeOnly.slice(1, 9).map((t) => t.suffix),
      title: `所有的 ${typeLabel(best)}`,
    };
  }
  return { ...none, note: `找不到「${input.trim()}」。可以試試和弦名稱(Am7)、類型(sus4)、或幾個音名(C E G)。` };
}

/* ───────── 依調性列出順階和弦 ───────── */
const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
const NUMERALS = {
  major: { triads: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], sevenths: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'] },
  minor: { triads: ['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII'], sevenths: ['i7', 'iiø7', '♭IIImaj7', 'iv7', 'v7', '♭VImaj7', '♭VII7'] },
};
/** 某個調的名稱(小調會用比較好讀的升降記號,例如 G♯ 小調) */
export const keyName = (index, mode) => (mode === 'minor' ? MINOR_KEYS : MAJOR_KEYS)[index];

/** 第 index 個調(對應 KEYS 的順序)的七個順階和弦 */
export function diatonicChords(db, index, mode, sevenths) {
  const tonic = keyName(index, mode);
  const scale = mode === 'minor' ? Key.minorKey(tonic).natural : Key.majorKey(tonic);
  const names = sevenths ? scale.chords : scale.triads;
  const numerals = NUMERALS[mode][sevenths ? 'sevenths' : 'triads'];
  const list = names.map((name, i) => {
    const m = name.match(/^([A-G])([#b]?)(.*)$/);
    const root = toKey(m[1], m[2]);
    const suffix = m[3] === '' ? 'major' : m[3] === 'm' ? 'minor' : m[3];
    // 圖上的音名照這個調的寫法拼(F♯ 大調裡是 A♯m,不是 B♭m)
    const chord = dbVoicing(db, root, suffix, { name: pretty(name), label: numerals[i], root: m[1] + m[2] });
    return chord && { root, suffix, chord };
  });
  if (mode === 'minor') {
    // 小調實際上很常把五級換成大和弦(和聲小調)
    const fifth = Note.transpose(tonic, '5P');
    const root = toKey(fifth[0], fifth.slice(1));
    const suffix = sevenths ? '7' : 'major';
    const chord = root && dbVoicing(db, root, suffix, { name: pretty(fifth) + typeText(suffix), label: sevenths ? 'V7(和聲小調)' : 'V(和聲小調)', root: fifth });
    if (chord) list.push({ root, suffix, chord });
  }
  return list.filter(Boolean);
}
