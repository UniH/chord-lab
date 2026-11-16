import ChordDiagram from './ChordDiagram.jsx';
import { playChord } from '../lib/audio.js';
import { useStore } from '../lib/store.js';
import { IconPlay } from './Icons.jsx';

export default function ChordCard({ chord, active = false, compact = false }) {
  const labelMode = useStore((s) => s.labelMode);
  return (
    <article className={`chord-card${active ? ' is-active' : ''}${compact ? ' is-compact' : ''}`}>
      <header>
        <h4>{chord.name}</h4>
        {chord.label && <span className="chord-label">{chord.label}</span>}
      </header>
      <ChordDiagram chord={chord} labelMode={labelMode} />
      {!compact && (
        <button className="btn btn-ghost btn-play" onClick={() => playChord(chord)} aria-label={`試聽 ${chord.name}`}>
          <IconPlay /> 試聽
        </button>
      )}
      {chord.tip && !compact && <p className="chord-tip">{chord.tip}</p>}
    </article>
  );
}
