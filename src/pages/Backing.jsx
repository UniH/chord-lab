import { useEffect, useState } from 'react';
import { CHORD_LAB } from '../data/chords.js';
import ChordCard from '../components/ChordCard.jsx';
import { LabelToolbar } from './Unit.jsx';
import { useStore } from '../lib/store.js';
import { startBacking, stopBacking, setBpm, setMix, setMixVolume, resetMixVolume, setDrumKit, MIX_TRACKS } from '../lib/audio.js';
import { CHORD_BY_ID } from '../lib/theory.js';
import { IconPlay, IconStop } from '../components/Icons.jsx';

const PROGS = CHORD_LAB.progressions;
const STYLES = CHORD_LAB.drumPatterns;
const CATS = CHORD_LAB.progressionCats.filter((c) => PROGS.some((p) => p.cat === c.id));
const countIn = (cat) => PROGS.filter((p) => p.cat === cat).length;

export default function Backing({ id }) {
  const s = useStore();
  const [selected, setSelected] = useState(PROGS.find((p) => p.id === id)?.id || PROGS[0].id);
  const prog = PROGS.find((p) => p.id === selected);
  const [cat, setCat] = useState(prog.cat);
  const [style, setStyle] = useState(prog.style);
  const playing = s.backingId === prog.id;
  const bars = prog.bars.map((cid) => CHORD_BY_ID[cid]);
  const shown = cat === 'all' ? PROGS : PROGS.filter((p) => p.cat === cat);
  const barIdx = playing ? s.backingBar : -1;
  const current = bars[barIdx >= 0 ? barIdx : 0];
  const nextIdx = ((barIdx >= 0 ? barIdx : 0) + 1) % bars.length;
  // 下一個「不同」的和弦
  let upcoming = bars[nextIdx];
  for (let k = 1; k <= bars.length; k++) {
    const c = bars[((barIdx >= 0 ? barIdx : 0) + k) % bars.length];
    if (c.id !== current.id) { upcoming = c; break; }
  }

  useEffect(() => {
    if (id && PROGS.some((p) => p.id === id)) {
      pick(id);
      setCat(PROGS.find((p) => p.id === id).cat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    setBpm(prog.bpm);
    return () => stopBacking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(pid) {
    const p = PROGS.find((x) => x.id === pid);
    setSelected(pid);
    setStyle(p.style);
    setBpm(p.bpm);
    if (s.backingId) startBacking(p, p.style);
  }
  function pickRandom() {
    const pool = shown.filter((p) => p.id !== selected);
    if (pool.length) pick(pool[Math.floor(Math.random() * pool.length)].id);
  }
  function changeStyle(v) {
    setStyle(v);
    if (playing) startBacking(prog, v);
  }
  const kitNote =
    s.drumKit !== 'sampled' ? '' : s.drumStatus === 'loading' ? '鼓組取樣下載中,先用合成鼓…' : s.drumStatus === 'failed' ? '鼓組取樣載入失敗,目前使用合成鼓' : '';

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Backing Tracks</p>
        <h1>配樂練習</h1>
        <p className="lead">{PROGS.length} 段和弦進行、{Object.keys(STYLES).length} 種節奏。選一段,鼓、貝斯與鋪底會循環播放,你負責吉他。</p>
      </header>

      <section className="track-picker">
        <div className="cat-row" role="group" aria-label="配樂分類">
          {CATS.map((c) => (
            <button key={c.id} className={`chip${cat === c.id ? ' is-on' : ''}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}<small>{countIn(c.id)}</small>
            </button>
          ))}
          <button className={`chip${cat === 'all' ? ' is-on' : ''}`} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
            全部<small>{PROGS.length}</small>
          </button>
          <button className="chip chip-action" onClick={pickRandom}>隨機選一段</button>
        </div>
        <div className="track-list" role="group" aria-label="選擇配樂">
          {shown.map((p) => (
            <button key={p.id} className={`track${selected === p.id ? ' is-on' : ''}`} aria-pressed={selected === p.id} onClick={() => pick(p.id)}>
              <strong>{p.name}</strong>
              <span>{p.desc}</span>
              <small>{STYLES[p.style]?.name} · {p.bpm} BPM</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel player">
        <div className="player-title">
          <h2>{prog.name}</h2>
          <p>{prog.desc}</p>
        </div>
        <div className="player-main">
          <button className={`btn btn-primary btn-lg${playing ? ' is-on' : ''}`} onClick={() => (playing ? stopBacking() : startBacking(prog, style))}>
            {playing ? <IconStop /> : <IconPlay />}
            {playing ? '停止' : '開始播放'}
          </button>
          <div className="bpm">
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm - 4)} aria-label="減慢">−</button>
            <div className="bpm-value"><strong>{s.bpm}</strong><span>BPM</span></div>
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm + 4)} aria-label="加快">+</button>
          </div>
          <label className="select-inline">
            <span>節奏</span>
            <select value={style} onChange={(e) => changeStyle(e.target.value)}>
              {Object.entries(STYLES).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
            </select>
          </label>
          <label className="select-inline">
            <span>鼓組</span>
            <select value={s.drumKit} onChange={(e) => setDrumKit(e.target.value)}>
              <option value="sampled">取樣鼓機</option>
              <option value="synth">合成鼓</option>
            </select>
          </label>
        </div>
        <div className="mixer" role="group" aria-label="混音:各音軌的開關與音量">
          {MIX_TRACKS.map((t) => {
            const on = !!s.mix[t.id];
            const vol = Math.round((s.mixVol[t.id] ?? 0.7) * 100);
            return (
              <div key={t.id} className={`mixer-row${on ? '' : ' is-off'}`}>
                <label className={`toggle${on ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={(e) => setMix({ [t.id]: e.target.checked })} />
                  {t.name}
                </label>
                <input type="range" min="0" max="100" step="1" value={vol} aria-label={`${t.name}音量`} onChange={(e) => setMixVolume({ [t.id]: Number(e.target.value) / 100 })} />
                <output>{vol}%</output>
              </div>
            );
          })}
          <button className="btn btn-ghost mixer-reset" onClick={resetMixVolume}>音量還原</button>
        </div>
        {kitNote && <p className="hint">{kitNote}</p>}

        <div className="bars" aria-label="小節">
          {bars.map((c, i) => (
            <span key={i} className={`bar${i === barIdx ? ' is-now' : ''}`}>
              <small>{i + 1}</small>
              {i === 0 || bars[i - 1].id !== c.id ? c.name : '〃'}
            </span>
          ))}
        </div>
        <p className="now-status" role="status">
          {playing ? (s.backingCountIn ? '預備拍…' : `第 ${barIdx + 1} 小節`) : '按「開始播放」後會先數一小節預備拍'}
        </p>
      </section>

      <LabelToolbar showPlayMode={false} />
      <section className="now-next">
        <div>
          <p className="eyebrow">{playing && !s.backingCountIn ? 'Now' : 'First'}</p>
          <ChordCard chord={current} active={playing && !s.backingCountIn} />
        </div>
        {upcoming.id !== current.id && (
          <div className="is-next">
            <p className="eyebrow">Next</p>
            <ChordCard chord={upcoming} />
          </div>
        )}
      </section>

      <section className="lesson">
        <h2>怎麼用配樂練習</h2>
        <ol className="steps">
          <li><b>先慢。</b>把速度降到原本的七成,確定每次換和弦都在第一拍到位。</li>
          <li><b>換彈法。</b>同一段進行,第一輪刷弦,第二輪分解,第三輪只彈上三弦。</li>
          <li><b>調整混音。</b>點音軌名稱可以開關,拉桿調各自的音量。關掉鋪底只留鼓和貝斯,和弦的顏色就完全靠你。</li>
          <li><b>開「吉他示範」對答案。</b>不確定自己按得對不對時,打開來聽聽看是不是同一個聲音。</li>
        </ol>
        <p className="hint">想加自己的進行:打開 <code>src/data/chords.js</code>,在 <code>progressions</code> 裡照格式新增一筆就會出現在這裡;常見和弦在同一個檔案的 <code>library</code>。</p>
      </section>
    </div>
  );
}
