// 和弦表:沒輸入時顯示常用和弦與各調的順階和弦;可以用名稱、類型、中文或音名搜尋
import { useEffect, useMemo, useState } from 'react';
import ChordCard from '../components/ChordCard.jsx';
import { Segmented } from '../components/Explorer.jsx';
import { LabelToolbar } from './Unit.jsx';
import { CHORD_INDEX, KEYS, pretty, plain } from '../lib/theory.js';
import {
  COMMON_GROUPS, COMMON_TYPES, chordHref, chordName, dbVoicing, dbVoicings, diatonicChords, keyName,
  loadChordDb, parseChord, searchChords, typeLabel,
} from '../lib/chordbook.js';
import { IconArrow } from '../components/Icons.jsx';
import { Note } from 'tonal';

/** 搜尋框下方的範例,點了會直接帶入 */
const EXAMPLES = [
  { text: 'F#m7', label: '和弦名稱' },
  { text: 'sus4', label: '只打類型' },
  { text: '大七', label: '中文' },
  { text: 'C E G', label: '用音名反查' },
];

const LESSON_ALIASES = { '': 'major', m: 'minor', sus: 'sus4', add2: 'add9' };

/** 教材裡的和弦名稱 → 資料庫的類型名稱 */
function teachingSuffix(chord) {
  const name = plain(chord.name).split('/')[0];
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m || /[(]/.test(name)) return null;
  return LESSON_ALIASES[m[2]] ?? m[2];
}

/** 一張可以點進去看所有指型的和弦卡 */
function PickCard({ db, root, suffix, chord }) {
  const c = chord || dbVoicing(db, root, suffix);
  if (!c) return null;
  return <ChordCard chord={c} href={chordHref(root, suffix)} />;
}

/** 某個和弦的所有指型 */
function Voicings({ db, root, suffix }) {
  const title = chordName(root, suffix);
  const fromDb = useMemo(() => dbVoicings(db, root, suffix), [db, root, suffix]);
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

  return (
    <>
      <section className="lesson">
        <h2>{title}:常用指型</h2>
        {fromDb.length === 0 && <p className="hint">資料庫裡沒有這個和弦。</p>}
        <div className="chord-grid">
          {fromDb.map((c) => (<ChordCard key={c.id} chord={c} />))}
        </div>
      </section>
      {fromLessons.length > 0 && (
        <section className="lesson">
          <h2>{title}:教材裡的指型</h2>
          <div className="chord-grid">
            {fromLessons.map((c) => (<ChordCard key={c.id} chord={c} />))}
          </div>
        </section>
      )}
    </>
  );
}

/** 搜尋結果 */
function Results({ db, result, onType }) {
  if (result.note) return <p className="hint" role="status">{result.note}</p>;
  return (
    <>
      {result.exact && <Voicings db={db} root={result.exact.root} suffix={result.exact.suffix} />}
      {result.exact && result.chords.length > 0 && (
        <section className="lesson">
          <h2>{result.title}</h2>
          <div className="chip-row">
            {result.chords.map((c) => (
              <a key={c.root + c.suffix} className="chip" href={chordHref(c.root, c.suffix)}>{chordName(c.root, c.suffix)}</a>
            ))}
          </div>
        </section>
      )}
      {!result.exact && (
        <section className="lesson">
          <h2>{result.title}</h2>
          {result.types.length > 0 && (
            <div className="chip-row" role="group" aria-label="相近的類型">
              <span className="chip-label">相近的類型</span>
              {result.types.map((t) => (<button key={t} className="chip" onClick={() => onType(t)}>{typeLabel(t)}</button>))}
            </div>
          )}
          <div className="chord-grid">
            {result.chords.map((c) => (<PickCard key={c.root + c.suffix} db={db} root={c.root} suffix={c.suffix} />))}
          </div>
        </section>
      )}
    </>
  );
}

/** 常用和弦 */
function CommonChords({ db }) {
  return COMMON_GROUPS.map((g) => (
    <section key={g.title} className="lesson">
      <h2>{g.title}</h2>
      <p className="prose">{g.note}</p>
      <div className="chord-grid">
        {g.chords.map((name) => {
          const c = parseChord(db, name);
          return c && <PickCard key={name} db={db} root={c.root} suffix={c.suffix} />;
        })}
      </div>
    </section>
  ));
}

/** 依調性:某個調的順階和弦 */
function KeyChords({ db }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState('major');
  const [sevenths, setSevenths] = useState(false);
  const chords = useMemo(() => diatonicChords(db, index, mode, sevenths), [db, index, mode, sevenths]);
  const title = `${pretty(keyName(index, mode))} ${mode === 'minor' ? '小調' : '大調'}`;
  return (
    <>
      <section className="panel book-filters">
        <div>
          <p className="field-label">調</p>
          <div className="key-grid" role="group" aria-label="調">
            {KEYS.map((k, i) => (
              <button key={k} className={`chip${index === i ? ' is-on' : ''}`} aria-pressed={index === i} onClick={() => setIndex(i)}>{pretty(keyName(i, mode))}</button>
            ))}
          </div>
        </div>
        <div className="toolbar">
          <Segmented label="大調或小調" value={mode} onChange={setMode} options={[{ value: 'major', label: '大調' }, { value: 'minor', label: '小調' }]} />
          <Segmented label="三和弦或七和弦" value={sevenths ? '7' : '3'} onChange={(v) => setSevenths(v === '7')} options={[{ value: '3', label: '三和弦' }, { value: '7', label: '七和弦' }]} />
        </div>
      </section>
      <section className="lesson">
        <h2>{title}的和弦</h2>
        <p className="prose">同一個調裡最常一起出現的和弦,和弦名稱下方是它在這個調裡的級數。寫歌或抓歌時,先從這幾個找。</p>
        <div className="chord-grid">
          {chords.map((c) => (<PickCard key={c.chord.label} db={db} root={c.root} suffix={c.suffix} chord={c.chord} />))}
        </div>
      </section>
    </>
  );
}

/** 單一和弦:可以直接換根音與類型 */
function ChordDetail({ db, root, suffix }) {
  const others = useMemo(() => db.suffixes.filter((s) => !COMMON_TYPES.includes(s)), [db]);
  // 在同一頁換和弦不要塞滿瀏覽紀錄,按「上一頁」可以直接回到列表
  const go = (r, s) => window.location.replace(chordHref(r, s));
  return (
    <>
      <a className="back-link" href="#/chords"><IconArrow /> 回到常用和弦</a>
      <section className="panel book-filters">
        <div>
          <p className="field-label">根音</p>
          <div className="key-grid" role="group" aria-label="根音">
            {KEYS.map((k) => (
              <button key={k} className={`chip${root === k ? ' is-on' : ''}`} aria-pressed={root === k} onClick={() => go(k, suffix)}>{pretty(k)}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">類型</p>
          <div className="chip-row" role="group" aria-label="和弦類型">
            {COMMON_TYPES.map((sfx) => (
              <button key={sfx} className={`chip${suffix === sfx ? ' is-on' : ''}`} aria-pressed={suffix === sfx} onClick={() => go(root, sfx)}>{typeLabel(sfx)}</button>
            ))}
            <label className="select-inline">
              <span>其他</span>
              <select value={others.includes(suffix) ? suffix : ''} onChange={(e) => e.target.value && go(root, e.target.value)} aria-label="其他和弦類型">
                <option value="">選擇…</option>
                {others.map((sfx) => (<option key={sfx} value={sfx}>{typeLabel(sfx)}</option>))}
              </select>
            </label>
          </div>
        </div>
      </section>
      <LabelToolbar />
      <Voicings db={db} root={root} suffix={suffix} />
    </>
  );
}

export default function ChordBook({ name = '' }) {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('common');

  useEffect(() => {
    loadChordDb().then(setDb).catch(() => setError(true));
  }, []);
  // 點了任何一個和弦(網址換了)就把搜尋清掉
  useEffect(() => setQuery(''), [name]);

  const result = useMemo(() => (db && query.trim() ? searchChords(db, query) : null), [db, query]);
  const picked = useMemo(() => (db && name ? parseChord(db, name) : null), [db, name]);

  function submit(e) {
    e.preventDefault();
    const first = result && (result.exact || result.chords[0]);
    if (first) window.location.hash = chordHref(first.root, first.suffix);
  }

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Chord Book</p>
        <h1>和弦表</h1>
        <p className="lead">常用和弦都列在下面;要找其他和弦,直接在搜尋框輸入。</p>
      </header>

      <form className="panel book-search" onSubmit={submit} role="search">
        <label htmlFor="chord-search">搜尋和弦</label>
        <input id="chord-search" className="text-input" type="search" inputMode="text" enterKeyHint="search" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false" placeholder="Am7、F#、sus4、大七、C E G…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="search-tips" role="group" aria-label="搜尋範例">
          <span>可以這樣找</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.text} type="button" className="chip" onClick={() => setQuery(ex.text)}>{ex.text}<small>{ex.label}</small></button>
          ))}
        </div>
      </form>

      {error && <p className="hint">和弦資料庫載入失敗,請重新整理頁面。</p>}
      {!db && !error && <p className="hint">載入和弦資料庫…</p>}

      {db && result && (
        <>
          <LabelToolbar />
          <Results db={db} result={result} onType={(t) => setQuery(t)} />
        </>
      )}

      {db && !result && picked && <ChordDetail db={db} root={picked.root} suffix={picked.suffix} />}

      {db && !result && !picked && (
        <>
          {name && <p className="hint" role="status">找不到「{name}」這個和弦,以下是常用和弦。</p>}
          <div className="toolbar book-views">
            <Segmented label="瀏覽方式" value={view} onChange={setView} options={[{ value: 'common', label: '常用和弦' }, { value: 'key', label: '依調性' }]} />
          </div>
          {view === 'key' ? (
            <>
              <KeyChords db={db} />
              <LabelToolbar />
            </>
          ) : (
            <>
              <LabelToolbar />
              <CommonChords db={db} />
            </>
          )}
        </>
      )}

      {db && <p className="hint">指型資料來自開源的 chords-db 和弦資料庫,共兩千多個指型;音名與級數由本站依琴格自動計算。</p>}
    </div>
  );
}
