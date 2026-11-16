import { useEffect, useMemo, useRef, useState } from 'react';
import Neck from '../components/Neck.jsx';
import { Segmented } from '../components/Explorer.jsx';
import { useQuizStats, setQuizStats } from '../lib/store.js';
import { playNote } from '../lib/audio.js';
import { TUNING_MIDI, KEYS, spell, pretty, midiAt } from '../lib/theory.js';
import { Note } from 'tonal';

const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const TONES = [
  { semis: 4, name: '大三度' },
  { semis: 3, name: '小三度' },
  { semis: 7, name: '五度' },
  { semis: 2, name: '九度(二度)' },
  { semis: 5, name: '四度' },
  { semis: 11, name: '大七度' },
  { semis: 10, name: '小七度' },
];
const GOOD = '#7ff0c0';
const BAD = '#ff8a8a';

function pickQuestion({ mode, strings, maxFret, naturalOnly, accidental, misses, avoid }) {
  const pool = [];
  for (const stringNo of strings) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const chroma = midiAt(stringNo, fret) % 12;
      if (mode === 'note' && naturalOnly && !NATURAL.includes(chroma)) continue;
      const key = `${stringNo}-${chroma}`;
      if (key === avoid) continue;
      pool.push({ stringNo, chroma, key, weight: 1 + Math.min(6, 2 * (misses[chroma] || 0)) });
    }
  }
  if (!pool.length) return null;
  let r = Math.random() * pool.reduce((n, p) => n + p.weight, 0);
  let pick = pool[0];
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) { pick = p; break; }
  }
  if (mode === 'note') {
    const name = (accidental === 'flat' ? FLAT : SHARP)[pick.chroma];
    return { ...pick, prompt: name, answer: name, sub: `在第 ${pick.stringNo} 弦上找出` };
  }
  const tone = TONES[Math.floor(Math.random() * TONES.length)];
  const rootChroma = (pick.chroma - tone.semis + 12) % 12;
  const root = KEYS.find((k) => Note.chroma(k) === rootChroma);
  return { ...pick, prompt: `${pretty(root)} 的${tone.name}`, answer: pretty(spell(root, tone.semis)), sub: `在第 ${pick.stringNo} 弦上找出` };
}

export default function Quiz() {
  const stats = useQuizStats();
  const [mode, setMode] = useState('note');
  const [strings, setStrings] = useState([6, 5]);
  const [maxFret, setMaxFret] = useState(12);
  const [naturalOnly, setNaturalOnly] = useState(false);
  const [accidental, setAccidental] = useState('sharp');
  const [question, setQuestion] = useState(null);
  const [marks, setMarks] = useState([]); // 指板上的作答記號
  const [session, setSession] = useState({ right: 0, wrong: 0, streak: 0 });
  const [state, setStateQ] = useState('asking'); // asking | correct | revealed
  const missed = useRef(false);
  const timer = useRef(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const settings = { mode, strings, maxFret, naturalOnly, accidental };
  function next(avoid) {
    clearTimeout(timer.current);
    missed.current = false;
    setMarks([]);
    setStateQ('asking');
    setQuestion(pickQuestion({ ...settings, misses: statsRef.current.misses || {}, avoid }));
  }
  useEffect(() => {
    next();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, strings.join(''), maxFret, naturalOnly, accidental]);

  function record(correct) {
    const st = statsRef.current;
    const misses = { ...(st.misses || {}) };
    if (!correct) misses[question.chroma] = (misses[question.chroma] || 0) + 1;
    else if (misses[question.chroma] > 0 && !missed.current) misses[question.chroma] -= 1;
    const streak = correct && !missed.current ? session.streak + 1 : correct ? session.streak : 0;
    setSession({
      right: session.right + (correct && !missed.current ? 1 : 0),
      wrong: session.wrong + (!correct && !missed.current ? 1 : 0),
      streak,
    });
    setQuizStats({
      right: st.right + (correct && !missed.current ? 1 : 0),
      wrong: st.wrong + (!correct && !missed.current ? 1 : 0),
      best: Math.max(st.best || 0, streak),
      misses,
    });
  }

  function pick(pos) {
    if (!question || state !== 'asking') return;
    if (pos.fret > maxFret) return;
    const midi = midiAt(pos.string, pos.fret);
    const chroma = midi % 12;
    playNote(midi, 1.2);
    const names = accidental === 'flat' ? FLAT : SHARP;
    if (pos.string === question.stringNo && chroma === question.chroma) {
      record(true);
      setMarks((m) => [...m, { string: pos.string, fret: pos.fret, text: question.answer, fill: GOOD }]);
      setStateQ('correct');
      timer.current = setTimeout(() => next(question.key), 900);
    } else {
      record(false);
      missed.current = true;
      setMarks((m) => [...m.filter((d) => !(d.string === pos.string && d.fret === pos.fret)), { string: pos.string, fret: pos.fret, text: names[chroma], fill: BAD }]);
    }
  }

  function reveal() {
    if (!question || state !== 'asking') return;
    if (!missed.current) record(false);
    missed.current = true;
    const found = [];
    for (let fret = 0; fret <= maxFret; fret++) {
      if (midiAt(question.stringNo, fret) % 12 === question.chroma) found.push({ string: question.stringNo, fret, text: question.answer, fill: GOOD });
    }
    setMarks((m) => [...m, ...found]);
    setStateQ('revealed');
  }

  function toggleString(n) {
    const nextSet = strings.includes(n) ? strings.filter((x) => x !== n) : [...strings, n];
    if (nextSet.length) setStrings(nextSet.sort((a, b) => b - a));
  }

  const dots = useMemo(() => marks, [marks]);
  const total = session.right + session.wrong;
  const allTotal = stats.right + stats.wrong;
  const weak = Object.entries(stats.misses || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Fretboard Quiz</p>
        <h1>指板測驗</h1>
        <p className="hint">看題目,在指板上點出正確的位置。答錯的音之後會比較常出現。</p>
      </header>

      <details className="panel quiz-settings">
        <summary>
          出題設定
          <span>{mode === 'note' ? '找音名' : '找和弦內音'} · 第 {strings.join('、')} 弦 · 0–{maxFret} 格</span>
        </summary>
        <Segmented label="題型" value={mode} onChange={setMode} options={[{ value: 'note', label: '找音名' }, { value: 'tone', label: '找和弦內音' }]} />
        <div className="chip-row" role="group" aria-label="出題的弦">
          {[6, 5, 4, 3, 2, 1].map((n) => (
            <button key={n} className={`chip${strings.includes(n) ? ' is-on' : ''}`} aria-pressed={strings.includes(n)} onClick={() => toggleString(n)}>第 {n} 弦</button>
          ))}
        </div>
        <div className="toolbar">
          <label className="select-inline">
            <span>範圍</span>
            <select value={maxFret} onChange={(e) => setMaxFret(Number(e.target.value))}>
              <option value={5}>0–5 格</option>
              <option value={7}>0–7 格</option>
              <option value={12}>0–12 格</option>
            </select>
          </label>
          <Segmented label="升降記號" value={accidental} onChange={setAccidental} options={[{ value: 'sharp', label: '♯' }, { value: 'flat', label: '♭' }]} />
          {mode === 'note' && (
            <label className="check"><input type="checkbox" checked={naturalOnly} onChange={(e) => setNaturalOnly(e.target.checked)} /> 只考自然音</label>
          )}
        </div>
      </details>

      <div className="quiz-play">
      <section className={`panel quiz-card is-${state}`} aria-live="polite">
        {question ? (
          <>
            <p className="quiz-sub">{question.sub}</p>
            <p className="quiz-prompt">{question.prompt}</p>
            <p className="quiz-feedback">
              {state === 'correct' ? '答對了' : state === 'revealed' ? `答案是 ${question.answer},位置已標在指板上` : missed.current ? '再試一次' : ' '}
            </p>
          </>
        ) : (
          <p className="quiz-sub">這個範圍內沒有題目,請調整設定。</p>
        )}
        <div className="quiz-actions">
          {state === 'revealed' ? (
            <button className="btn btn-primary" onClick={() => next(question?.key)}>下一題</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={reveal} disabled={state !== 'asking'}>看答案</button>
              <button className="btn btn-ghost" onClick={() => next(question?.key)}>跳過</button>
            </>
          )}
        </div>
      </section>

      <Neck dots={dots} fretCount={maxFret} onPick={pick} height={230} />
      <p className="hint">最上面是第 1 弦(最細),最下面是第 6 弦(最粗),和六線譜的方向相同。點弦的最左邊代表空弦。</p>
      </div>

      <section className="stats">
        <div><strong>{session.streak}</strong><span>連續答對</span></div>
        <div><strong>{total ? Math.round((session.right / total) * 100) : 0}%</strong><span>本次正確率({session.right}/{total})</span></div>
        <div><strong>{stats.best || 0}</strong><span>最佳連續紀錄</span></div>
        <div><strong>{allTotal ? Math.round((stats.right / allTotal) * 100) : 0}%</strong><span>累計正確率({allTotal} 題)</span></div>
      </section>
      {weak.length > 0 && (
        <p className="hint">比較不熟的音:{weak.map(([c]) => `${SHARP[c]}/${FLAT[c]}`.replace(/^(.+)\/\1$/, '$1')).join('、')}</p>
      )}
    </div>
  );
}
