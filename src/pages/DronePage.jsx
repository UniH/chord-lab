import { useMemo } from 'react';
import Neck from '../components/Neck.jsx';
import { COLORS } from '../components/ChordDiagram.jsx';
import { DEGREE_FILL, Segmented } from '../components/Explorer.jsx';
import { useStore, setState } from '../lib/store.js';
import { setDrone, playNote } from '../lib/audio.js';
import { STRING_NAMES, pretty, scalePositions, midiAt } from '../lib/theory.js';
import { IconPlay, IconStop } from '../components/Icons.jsx';

export const MODES = [
  { id: 'major', name: '大調', mood: '明亮、開闊', ivl: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'lydian', name: 'Lydian', mood: '夢幻、飄浮(升四度)', ivl: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian', name: 'Mixolydian', mood: '迷幻搖滾(降七度)', ivl: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'dorian', name: 'Dorian', mood: '冷靜、不太悲傷的小調', ivl: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'aeolian', name: '自然小調', mood: '憂鬱', ivl: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'majpent', name: '大調五聲', mood: '怎麼彈都不會錯', ivl: [0, 2, 4, 7, 9] },
  { id: 'minpent', name: '小調五聲', mood: '怎麼彈都不會錯', ivl: [0, 3, 5, 7, 10] },
];

export default function DronePage() {
  const s = useStore();
  const root = STRING_NAMES[6 - s.droneString];
  const mode = MODES.find((m) => m.id === s.droneMode) || MODES[0];
  const showDegree = s.labelMode === 'degree';

  const dots = useMemo(
    () =>
      scalePositions(root, mode.ivl, 12).map((d) => ({
        string: d.string,
        fret: d.fret,
        text: showDegree ? d.degree : pretty(d.note),
        fill: DEGREE_FILL[d.semis] || COLORS.note,
      })),
    [root, mode, showDegree],
  );

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Drone</p>
        <h1>持續音練習</h1>
        <p className="lead">選一條空弦當持續音,讓它一直響,在上面慢慢彈。播放中換弦,音高會直接滑過去。</p>
      </header>

      <section className="panel">
        <div className="string-picker" role="group" aria-label="選擇空弦">
          {[6, 5, 4, 3, 2, 1].map((n) => (
            <button key={n} className={s.droneString === n ? 'is-on' : ''} aria-pressed={s.droneString === n} onClick={() => setDrone({ droneString: n })}>
              <strong>{pretty(STRING_NAMES[6 - n])}</strong>
              <span>第 {n} 弦</span>
            </button>
          ))}
        </div>
        <div className="drone-controls">
          <button className={`btn btn-primary btn-lg${s.droneOn ? ' is-on' : ''}`} onClick={() => setDrone({ droneOn: !s.droneOn })}>
            {s.droneOn ? <IconStop /> : <IconPlay />}
            {s.droneOn ? '停止' : `開始 ${pretty(root)} 持續音`}
          </button>
          <label className="check"><input type="checkbox" checked={s.droneFifth} onChange={(e) => setDrone({ droneFifth: e.target.checked })} /> 加上五度</label>
          <label className="check"><input type="checkbox" checked={s.droneLow} onChange={(e) => setDrone({ droneLow: e.target.checked })} /> 低八度</label>
          <label className="range-inline">
            <span>音量</span>
            <input type="range" min="0.05" max="1" step="0.01" value={s.droneVolume} onChange={(e) => setDrone({ droneVolume: Number(e.target.value) })} aria-label="持續音音量" />
          </label>
        </div>
      </section>

      <section className="lesson">
        <h2>在 {pretty(root)} 上面可以彈的音</h2>
        <p className="prose">選一個音階,指板上會標出所有可以彈的位置,點一下可以試聽。同一個持續音,換一個音階,氣氛會完全不同。</p>
        <div className="chip-row" role="group" aria-label="音階">
          {MODES.map((m) => (
            <button key={m.id} className={`chip${mode.id === m.id ? ' is-on' : ''}`} onClick={() => setState({ droneMode: m.id })}>{m.name}</button>
          ))}
        </div>
        <div className="toolbar">
          <span className="mood">{mode.name}:{mode.mood}</span>
          <Segmented
            label="標示"
            value={showDegree ? 'degree' : 'note'}
            onChange={(v) => setState({ labelMode: v })}
            options={[{ value: 'note', label: '音名' }, { value: 'degree', label: '級數' }]}
          />
        </div>
        <Neck dots={dots} fretCount={12} onPick={(p) => playNote(midiAt(p.string, p.fret))} />
        <p className="legend">
          <i style={{ background: COLORS.root }} /> 根音(和持續音同音)
          <i style={{ background: '#7fd6ff' }} /> 三度
          <i style={{ background: '#b9a6ff' }} /> 五度
          <i style={{ background: COLORS.note }} /> 其他音階音
        </p>
      </section>

      <section className="lesson">
        <h2>練習方法</h2>
        <ol className="steps">
          <li><b>只彈一條弦。</b>選第 1 或第 2 弦,沿著指板上下滑,每個音都停久一點,聽它和持續音之間的距離。</li>
          <li><b>找出最穩定和最緊張的音。</b>根音、五度最穩;大調的四度、Lydian 的升四度最有張力。</li>
          <li><b>改用兩條弦彈三度或六度。</b>單元 4 的「空 D 弦 + 三度音程」就是這個練法。</li>
          <li><b>換音階不換持續音。</b>同樣是 E,從大調換到 Lydian 再換到 Dorian,感受氣氛怎麼變。</li>
          <li><b>加上節拍器或配樂。</b>下方工具列可以同時開節拍器,或到配樂頁開「D 持續音」。</li>
        </ol>
      </section>
    </div>
  );
}
