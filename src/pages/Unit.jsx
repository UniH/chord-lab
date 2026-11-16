import { CHORD_LAB } from '../data/chords.js';
import ChordCard from '../components/ChordCard.jsx';
import Score from '../components/Score.jsx';
import { CagedExplorer, TriadExplorer, Segmented } from '../components/Explorer.jsx';
import { useStore, setState } from '../lib/store.js';
import { IconArrow } from '../components/Icons.jsx';

export function LabelToolbar({ showPlayMode = true }) {
  const labelMode = useStore((s) => s.labelMode);
  const playMode = useStore((s) => s.playMode);
  return (
    <div className="toolbar toolbar-sticky">
      <Segmented
        label="和弦圖標示"
        value={labelMode}
        onChange={(v) => setState({ labelMode: v })}
        options={[{ value: 'finger', label: '指法' }, { value: 'note', label: '音名' }, { value: 'degree', label: '級數' }]}
      />
      {showPlayMode && (
        <Segmented
          label="試聽方式"
          value={playMode}
          onChange={(v) => setState({ playMode: v })}
          options={[{ value: 'strum', label: '刷弦' }, { value: 'arp', label: '分解' }]}
        />
      )}
    </div>
  );
}

export default function Unit({ id }) {
  const units = CHORD_LAB.units;
  const index = units.findIndex((u) => u.id === id);
  const unit = units[index];
  if (!unit) return <div className="page"><p>找不到這個單元。<a href="#/">回首頁</a></p></div>;
  const prev = units[index - 1];
  const next = units[index + 1];
  const tracks = CHORD_LAB.progressions.filter((p) => p.unit === unit.id);

  return (
    <div className="page">
      <header className="unit-head">
        <p className="eyebrow">Unit {unit.no}</p>
        <h1>{unit.title}</h1>
        <p className="lead">{unit.subtitle}</p>
        {unit.intro.map((p, i) => (<p key={i} className="prose">{p}</p>))}
      </header>

      <LabelToolbar />

      {unit.sections.map((sec) => (
        <section key={sec.id} id={sec.id} className="lesson">
          <h2>{sec.title}</h2>
          {sec.text && <p className="prose">{sec.text}</p>}
          {sec.chords && (
            <div className="chord-grid">
              {sec.chords.map((c) => (<ChordCard key={c.id} chord={c} />))}
            </div>
          )}
          {sec.widget === 'caged' && <CagedExplorer />}
          {sec.widget === 'triads' && <TriadExplorer />}
          {sec.score && <Score title={sec.score.title} tex={sec.score.tex} />}
        </section>
      ))}

      {tracks.length > 0 && (
        <section className="lesson">
          <h2>搭配這個單元的配樂</h2>
          <div className="link-list">
            {tracks.map((t) => (
              <a key={t.id} href={`#/backing/${t.id}`}><span>{t.name}</span><IconArrow /></a>
            ))}
          </div>
        </section>
      )}

      <nav className="pager">
        {prev ? <a href={`#/unit/${prev.id}`}><small>上一個單元</small>{prev.title}</a> : <span />}
        {next ? <a className="next" href={`#/unit/${next.id}`}><small>下一個單元</small>{next.title}</a> : <a className="next" href="#/backing"><small>接下來</small>配樂練習</a>}
      </nav>
    </div>
  );
}
