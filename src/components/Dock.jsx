// 底部常駐的練習列:配樂播放/暫停、節拍器、Drone、混音器
import { useStore } from '../lib/store.js';
import { setBpm, setMetronome, setDrone, toggleBacking, selectedBacking, TIME_SIGS } from '../lib/audio.js';
import { STRING_NAMES, pretty } from '../lib/theory.js';
import Mixer, { openMixer } from './Mixer.jsx';
import { IconPlay, IconPause, IconStop, IconSliders, IconWave, IconMetronome } from './Icons.jsx';

function BeatDots() {
  const { beat, beatLevel, timeSig, metronomeOn, backingId, backingPaused } = useStore();
  if (backingId) return backingPaused ? null : <span className={`beat-pulse level-${beatLevel}`} key={beat} />;
  if (!metronomeOn) return null;
  const sig = TIME_SIGS[timeSig] || TIME_SIGS['4/4'];
  const count = sig.steps / sig.beatEvery;
  return (
    <span className="beat-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i === beat ? `is-on level-${beatLevel}` : ''} />
      ))}
    </span>
  );
}

export default function Dock() {
  const s = useStore();
  const { prog } = selectedBacking();
  const playing = !!s.backingId && !s.backingPaused;

  return (
    <>
      <Mixer />
      <footer className="dock" aria-label="練習工具列">
        <div className="dock-group">
          <button
            className={`btn btn-round btn-transport${playing ? ' is-on' : ''}`}
            onClick={toggleBacking}
            aria-label={playing ? `暫停配樂:${prog.name}` : `播放配樂:${prog.name}`}
            title={playing ? '暫停配樂' : '播放配樂'}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>
          <a className="dock-track" href={`#/backing/${prog.id}`} title="到配樂頁換一首">
            <small>{playing ? '播放中' : s.backingPaused ? '已暫停' : '配樂'}</small>
            <span>{prog.name}</span>
          </a>
        </div>

        <div className="dock-group">
          <button
            className={`btn btn-round${s.metronomeOn ? ' is-on' : ''}`}
            onClick={() => setMetronome(!s.metronomeOn)}
            aria-pressed={s.metronomeOn}
            aria-label={s.metronomeOn ? '停止節拍器' : '開始節拍器'}
          >
            {s.metronomeOn ? <IconStop /> : <IconMetronome />}
          </button>
          <div className="bpm">
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm - 4)} aria-label="減慢">−</button>
            <div className="bpm-value"><strong>{s.bpm}</strong><span>BPM</span></div>
            <button className="btn btn-ghost btn-step" onClick={() => setBpm(s.bpm + 4)} aria-label="加快">+</button>
          </div>
          <BeatDots />
        </div>

        <div className="dock-group">
          <button
            className={`btn btn-round${s.droneOn ? ' is-on' : ''}`}
            onClick={() => setDrone({ droneOn: !s.droneOn })}
            aria-pressed={s.droneOn}
            aria-label={s.droneOn ? '停止持續音' : '開始持續音'}
          >
            {s.droneOn ? <IconStop /> : <IconWave />}
          </button>
          <label className="select-inline dock-drone">
            <span>Drone</span>
            <select value={s.droneString} onChange={(e) => setDrone({ droneString: Number(e.target.value) })} aria-label="持續音的弦">
              {[6, 5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{pretty(STRING_NAMES[6 - n])}({n} 弦)</option>
              ))}
            </select>
          </label>
        </div>

        <button className="btn btn-ghost btn-icon" onClick={openMixer} aria-label="混音器" title="混音器"><IconSliders /></button>
      </footer>
    </>
  );
}
