import ChordDiagram from './ChordDiagram.jsx';
import { playChord } from '../lib/audio.js';
import { useStore } from '../lib/store.js';
import { IconPlay, IconArrow } from './Icons.jsx';

/** href:有的話,和弦名稱與「所有指型」會連到和弦表裡這個和弦的頁面 */
export default function ChordCard({ chord, active = false, compact = false, href }) {
  const labelMode = useStore((s) => s.labelMode);
  return (
    <article className={`chord-card${active ? ' is-active' : ''}${compact ? ' is-compact' : ''}`}>
      <header>
        <h4>{href ? <a href={href}>{chord.name}</a> : chord.name}</h4>
        {chord.label && <span className="chord-label">{chord.label}</span>}
      </header>
      <ChordDiagram chord={chord} labelMode={labelMode} />
      {!compact && (
        <button className="btn btn-ghost btn-play" onClick={() => playChord(chord)} aria-label={`試聽 ${chord.name}`}>
          <IconPlay /> 試聽
        </button>
      )}
      {href && <a className="chord-more" href={href}>所有指型 <IconArrow /></a>}
      {chord.tip && !compact && <p className="chord-tip">{chord.tip}</p>}
    </article>
  );
}
