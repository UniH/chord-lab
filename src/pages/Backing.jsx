import { useEffect, useState } from 'react';
import { CHORD_LAB } from '../data/chords.js';
import ChordCard from '../components/ChordCard.jsx';
import { LabelToolbar } from './Unit.jsx';
import { useStore } from '../lib/store.js';
import { toggleBacking, stopBacking, selectBacking, setBackingStyle, selectedBacking, setBpm } from '../lib/audio.js';
import { CHORD_BY_ID } from '../lib/theory.js';
import { openMixer } from '../components/Mixer.jsx';
import { IconPlay, IconPause, IconStop, IconSliders } from '../components/Icons.jsx';

const PROGS = CHORD_LAB.progressions;
const STYLES = CHORD_LAB.drumPatterns;
const CATS = CHORD_LAB.progressionCats.filter((c) => PROGS.some((p) => p.cat === c.id));
const countIn = (cat) => PROGS.filter((p) => p.cat === cat).length;

export default function Backing({ id }) {
  const s = useStore();
  // 選了哪一首、哪個節奏存在全站狀態裡,底部工具列的播放鍵才知道要播什麼
  const { prog, style } = selectedBacking();
  const selected = prog.id;
  const [cat, setCat] = useState(prog.cat);
  const active = !!s.backingId; // 播放中或暫停中
  const playing = active && !s.backingPaused;
  const bars = prog.bars.map((cid) => CHORD_BY_ID[cid]);
  const shown = cat === 'all' ? PROGS : PROGS.filter((p) => p.cat === cat);
  const barIdx = active ? s.backingBar : -1;
  const current = bars[barIdx >= 0 ? barIdx : 0];
  const nextIdx = ((barIdx >= 0 ? barIdx : 0) + 1) % bars.length;
  // 下一個「不同」的和弦
  let upcoming = bars[nextIdx];
  for (let k = 1; k <= bars.length; k++) {
    const c = bars[((barIdx >= 0 ? barIdx : 0) + k) % bars.length];
    if (c.id !== current.id) { upcoming = c; break; }
  }

  // 從別頁的連結進來(#/backing/某一首):換到那一首,已經是那一首就不打斷播放
  useEffect(() => {
    const target = id && PROGS.find((p) => p.id === id);
    if (!target) return;
    if (target.id !== selectedBacking().prog.id) selectBacking(target.id);
    setCat(target.cat);
  }, [id]);
  // 沒有在播的時候進到這一頁,速度換成這一首預設的
  useEffect(() => {
    if (!s.backingId) setBpm(selectedBacking().prog.bpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = selectBacking;
  function pickRandom() {
    const pool = shown.filter((p) => p.id !== selected);
    if (pool.length) pick(pool[Math.floor(Math.random() * pool.length)].id);
  }
  const status = !active
    ? '按「開始播放」後會先數一小節預備拍'
    : s.backingCountIn
      ? (s.backingPaused ? '已暫停(預備拍)' : '預備拍…')
      : `${s.backingPaused ? '已暫停 · ' : ''}第 ${barIdx + 1} 小節`;

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
          <button className={`btn btn-primary btn-lg${playing ? ' is-on' : ''}`} onClick={toggleBacking}>
            {playing ? <IconPause /> : <IconPlay />}
            {playing ? '暫停' : active ? '繼續播放' : '開始播放'}
          </button>
          {active && (
            <button className="btn btn-ghost" onClick={stopBacking}><IconStop /> 回到開頭</button>
          )}
          <div className="bpm">
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm - 4)} aria-label="減慢">−</button>
            <div className="bpm-value"><strong>{s.bpm}</strong><span>BPM</span></div>
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm + 4)} aria-label="加快">+</button>
          </div>
          <label className="select-inline">
            <span>節奏</span>
            <select value={style} onChange={(e) => setBackingStyle(e.target.value)}>
              {Object.entries(STYLES).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
            </select>
          </label>
          <button className="btn btn-ghost" onClick={openMixer}><IconSliders /> 混音器</button>
        </div>

        <div className="bars" aria-label="小節">
          {bars.map((c, i) => (
            <span key={i} className={`bar${i === barIdx ? ' is-now' : ''}`}>
              <small>{i + 1}</small>
              {i === 0 || bars[i - 1].id !== c.id ? c.name : '〃'}
            </span>
          ))}
        </div>
        <p className="now-status" role="status">{status}</p>
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
          <li><b>調整混音。</b>按「混音器」(底部工具列最右邊也有)可以開關每個音軌、調各自的音量。關掉鋪底只留鼓和貝斯,和弦的顏色就完全靠你。</li>
          <li><b>邊播邊查。</b>播放鍵在底部工具列也有一個,切到和弦表或其他單元時配樂不會停。</li>
          <li><b>開「吉他示範」對答案。</b>不確定自己按得對不對時,打開來聽聽看是不是同一個聲音。</li>
        </ol>
        <p className="hint">想加自己的進行:打開 <code>src/data/chords.js</code>,在 <code>progressions</code> 裡照格式新增一筆就會出現在這裡;常見和弦在同一個檔案的 <code>library</code>。</p>
      </section>
    </div>
  );
}
