// 指板總覽:CAGED 指型 / 三和弦轉位
import { useMemo, useState } from 'react';
import Neck from './Neck.jsx';
import { COLORS } from './ChordDiagram.jsx';
import { KEYS, cagedPositions, triadPositions, pretty, scalePositions } from '../lib/theory.js';
import { playMidis } from '../lib/audio.js';
import { useStore } from '../lib/store.js';
import { IconPlay } from './Icons.jsx';

export const DEGREE_FILL = { 0: COLORS.root, 3: '#7fd6ff', 4: '#7fd6ff', 7: '#b9a6ff' };
const fretName = (f) => (f === 0 ? '開放' : `第 ${f} 格`);

function Segmented({ value, options, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? 'is-on' : ''} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
export { Segmented };

export function KeyPicker({ value, onChange, label = '根音' }) {
  return (
    <label className="select-inline">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {KEYS.map((k) => (
          <option key={k} value={k}>{pretty(k)}</option>
        ))}
      </select>
    </label>
  );
}

function ShapeExplorer({ positions, allDots, itemLabel, legend }) {
  const labelMode = useStore((s) => s.labelMode);
  const [picked, setPicked] = useState(null);
  const current = picked !== null && positions[picked] ? positions[picked] : null;

  const dots = useMemo(() => {
    const inShape = current ? new Set(current.dots.map((d) => `${d.string}-${d.fret}`)) : null;
    return allDots.map((d) => ({
      string: d.string,
      fret: d.fret,
      text: labelMode === 'degree' ? d.degree : pretty(d.note),
      fill: DEGREE_FILL[d.semis] || COLORS.note,
      disabled: inShape ? !inShape.has(`${d.string}-${d.fret}`) : false,
    }));
  }, [allDots, current, labelMode]);

  return (
    <div className="explorer">
      <div className="chip-row" role="group" aria-label="選擇位置">
        <button className={`chip${picked === null ? ' is-on' : ''}`} onClick={() => setPicked(null)}>全部</button>
        {positions.map((p, i) => (
          <button
            key={i}
            className={`chip${picked === i ? ' is-on' : ''}`}
            onClick={() => {
              setPicked(picked === i ? null : i);
              if (picked !== i) playMidis(p.dots.map((d) => d.midi));
            }}
          >
            {picked === i && <IconPlay />}
            {itemLabel(p)}
            <small>{fretName(Math.min(...p.dots.map((d) => d.fret)))}</small>
          </button>
        ))}
      </div>
      <Neck dots={dots} fretCount={15} />
      <p className="legend">{legend}</p>
    </div>
  );
}

const Legend = ({ third }) => (
  <>
    <i style={{ background: COLORS.root }} /> 根音
    <i style={{ background: '#7fd6ff' }} /> {third}
    <i style={{ background: '#b9a6ff' }} /> 五度
  </>
);

export function CagedExplorer() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('major');
  const positions = useMemo(() => cagedPositions(root, quality, 15), [root, quality]);
  const allDots = useMemo(() => scalePositions(root, quality === 'minor' ? [0, 3, 7] : [0, 4, 7], 15), [root, quality]);
  return (
    <div>
      <div className="toolbar">
        <KeyPicker value={root} onChange={setRoot} />
        <Segmented label="和弦性質" value={quality} onChange={setQuality} options={[{ value: 'major', label: '大和弦' }, { value: 'minor', label: '小和弦' }]} />
      </div>
      <ShapeExplorer
        key={root + quality}
        positions={positions}
        allDots={allDots}
        itemLabel={(p) => `${p.shape}${quality === 'minor' ? 'm' : ''} 型`}
        legend={<Legend third={quality === 'minor' ? '小三度' : '大三度'} />}
      />
    </div>
  );
}

export function TriadExplorer() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('major');
  const [set, setSet] = useState('321');
  const strings = set.split('').map(Number);
  const positions = useMemo(() => triadPositions(root, quality, strings, 15), [root, quality, set]);
  const allDots = useMemo(() => positions.flatMap((p) => p.dots), [positions]);
  return (
    <div>
      <div className="toolbar">
        <KeyPicker value={root} onChange={setRoot} />
        <Segmented label="和弦性質" value={quality} onChange={setQuality} options={[{ value: 'major', label: '大三和弦' }, { value: 'minor', label: '小三和弦' }]} />
        <Segmented label="弦組" value={set} onChange={setSet} options={[{ value: '321', label: '1-2-3 弦' }, { value: '432', label: '2-3-4 弦' }]} />
      </div>
      <ShapeExplorer
        key={root + quality + set}
        positions={positions}
        allDots={allDots}
        itemLabel={(p) => p.name}
        legend={<Legend third={quality === 'minor' ? '小三度' : '大三度'} />}
      />
    </div>
  );
}
