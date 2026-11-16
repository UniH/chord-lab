// 和弦表:快速查指法。資料來自 @tombatossals/chords-db,再加上本站教材裡的指型
import { useEffect, useMemo, useState } from 'react';
import ChordCard from '../components/ChordCard.jsx';
import { LabelToolbar } from './Unit.jsx';
import { CHORD_INDEX, KEYS, pretty, plain } from '../lib/theory.js';
import { Note } from 'tonal';

const COMMON = ['major', 'minor', 'sus2', 'sus4', 'add9', 'maj7', 'm7', '7', 'madd9', '6', 'm6', '9', 'maj9', 'm9', '7sus4', 'dim', 'aug'];
const SUFFIX_LABEL = { major: '大三和弦', minor: '小三和弦 m', '69': '6/9', mmaj7: 'm(maj7)', mmaj9: 'm(maj9)', mmaj11: 'm(maj11)', mmaj7b5: 'm(maj7)♭5', m69: 'm6/9' };
const suffixText = (s) => (s === 'major' ? '' : s === 'minor' ? 'm' : pretty(SUFFIX_LABEL[s] && !/和弦/.test(SUFFIX_LABEL[s]) ? SUFFIX_LABEL[s] : s));
const suffixLabel = (s) => pretty(SUFFIX_LABEL[s] || s);
const ALIASES = { '': 'major', maj: 'major', M: 'major', m: 'minor', min: 'minor', '-': 'minor', M7: 'maj7', Maj7: 'maj7', 'm7-5': 'm7b5', min7: 'm7', '+': 'aug', '2': 'sus2', '4': 'sus4', sus: 'sus4', '6/9': '69', '7sus': '7sus4', add2: 'add9' };

let dbPromise = null;
const loadDb = () => (dbPromise ||= import('@tombatossals/chords-db/lib/guitar.json').then((m) => m.default || m));

/** 教材裡的和弦名稱 → 資料庫的類型名稱 */
function teachingSuffix(chord) {
  const name = plain(chord.name).split('/')[0];
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m || /[(]/.test(name)) return null;
  return ALIASES[m[2]] ?? m[2];
}

export default function ChordBook() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(false);
  const [root, setRoot] = useState('C');
  const [suffix, setSuffix] = useState('major');
  const [query, setQuery] = useState('');
  const [queryNote, setQueryNote] = useState('');

  useEffect(() => {
    loadDb().then(setDb).catch(() => setError(true));
  }, []);

  const others = useMemo(() => (db ? db.suffixes.filter((s) => !COMMON.includes(s)) : []), [db]);

  const fromDb = useMemo(() => {
    if (!db) return [];
    const entry = (db.chords[root.replace('#', 'sharp')] || []).find((c) => c.suffix === suffix);
    if (!entry) return [];
    return entry.positions.map((p, i) => ({
      id: `db-${root}-${suffix}-${i}`,
      name: pretty(root) + suffixText(suffix),
      label: `指型 ${i + 1}`,
      frets: p.frets.map((f) => (f < 0 ? null : f === 0 ? 0 : f + p.baseFret - 1)),
      fingers: p.fingers,
      root,
    }));
  }, [db, root, suffix]);

  const fromLessons = useMemo(() => {
    const chroma = Note.chroma(root);
    const seen = new Set();
    return Object.values(CHORD_INDEX).filter((c) => {
      if (Note.chroma(plain(c.root)) !== chroma || teachingSuffix(c) !== suffix) return false;
      const key = String(c.frets).replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [root, suffix]);

  function search(text) {
    setQuery(text);
    const t = text.trim().replace(/♯/g, '#').replace(/♭/g, 'b');
    if (!t) return setQueryNote('');
    const m = t.match(/^([A-Ga-g])([#b]?)(.*)$/);
    if (!m) return setQueryNote('請以根音開頭,例如 F#m7、Cadd9、Bbmaj7');
    const typed = m[1].toUpperCase() + m[2];
    const key = KEYS.find((k) => Note.chroma(k) === Note.chroma(typed));
    const rest = m[3].trim();
    const all = db ? db.suffixes : COMMON;
    const found = ALIASES[rest] ?? (all.includes(rest) ? rest : all.find((s) => s.toLowerCase() === rest.toLowerCase()));
    if (!key) return setQueryNote('找不到這個根音');
    setRoot(key);
    if (found && all.includes(found)) {
      setSuffix(found);
      setQueryNote('');
    } else {
      setQueryNote(`已切到 ${pretty(key)},但找不到「${rest}」這個類型,請從下方選擇`);
    }
  }

  const title = pretty(root) + suffixText(suffix);

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Chord Book</p>
        <h1>和弦表</h1>
        <p className="lead">選根音與類型,或直接輸入和弦名稱,查各把位的指法。</p>
      </header>

      <section className="panel book-filters">
        <div className="field">
          <label htmlFor="chord-search">直接輸入和弦名稱</label>
          <input id="chord-search" className="text-input" type="search" inputMode="text" autoCapitalize="off" autoCorrect="off" spellCheck="false" placeholder="例如 F#m7、Cadd9、Bbmaj7" value={query} onChange={(e) => search(e.target.value)} />
          {queryNote && <p className="hint" role="status">{queryNote}</p>}
        </div>
        <div>
          <p className="field-label">根音</p>
          <div className="key-grid" role="group" aria-label="根音">
            {KEYS.map((k) => (
              <button key={k} className={`chip${root === k ? ' is-on' : ''}`} aria-pressed={root === k} onClick={() => { setRoot(k); setQuery(''); setQueryNote(''); }}>{pretty(k)}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">類型</p>
          <div className="chip-row" role="group" aria-label="和弦類型">
            {COMMON.map((sfx) => (
              <button key={sfx} className={`chip${suffix === sfx ? ' is-on' : ''}`} aria-pressed={suffix === sfx} onClick={() => { setSuffix(sfx); setQuery(''); setQueryNote(''); }}>{suffixLabel(sfx)}</button>
            ))}
            <label className="select-inline">
              <span>其他</span>
              <select value={others.includes(suffix) ? suffix : ''} onChange={(e) => e.target.value && setSuffix(e.target.value)} aria-label="其他和弦類型">
                <option value="">選擇…</option>
                {others.map((sfx) => (<option key={sfx} value={sfx}>{suffixLabel(sfx)}</option>))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <LabelToolbar />

      {fromLessons.length > 0 && (
        <section className="lesson">
          <h2>{title}:教材裡的指型</h2>
          <div className="chord-grid">
            {fromLessons.map((c) => (<ChordCard key={c.id} chord={c} />))}
          </div>
        </section>
      )}

      <section className="lesson">
        <h2>{title}:常用指型</h2>
        {error && <p className="hint">和弦資料庫載入失敗,請重新整理頁面。</p>}
        {!db && !error && <p className="hint">載入和弦資料庫…</p>}
        {db && fromDb.length === 0 && <p className="hint">資料庫裡沒有這個和弦。</p>}
        <div className="chord-grid">
          {fromDb.map((c) => (<ChordCard key={c.id} chord={c} />))}
        </div>
        <p className="hint">常用指型的資料來自開源的 chords-db 和弦資料庫,共兩千多個指型;音名與級數由本站依琴格自動計算。</p>
      </section>
    </div>
  );
}
