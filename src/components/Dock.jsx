// 底部常駐的練習列:節拍器、Drone、音色與效果
import { useRef, useState } from 'react';
import { useStore } from '../lib/store.js';
import { setBpm, setMetronome, setTimeSig, setDrone, setVoice, setFx, VOICES, TIME_SIGS } from '../lib/audio.js';
import { STRING_NAMES, pretty } from '../lib/theory.js';
import { IconPlay, IconStop, IconSliders, IconClose, IconWave, IconMetronome } from './Icons.jsx';

function BeatDots() {
  const { beat, beatLevel, timeSig, metronomeOn, backingId } = useStore();
  if (!metronomeOn && !backingId) return null;
  if (backingId) return <span className={`beat-pulse level-${beatLevel}`} key={beat} />;
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
  const [open, setOpen] = useState(false);
  const taps = useRef([]);

  function tap() {
    const now = performance.now();
    taps.current = taps.current.filter((t) => now - t < 2500);
    taps.current.push(now);
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
    }
  }

  const voiceNote =
    s.voice === 'synth' ? '' : s.voiceStatus === 'loading' ? '音色下載中…' : s.voiceStatus === 'failed' ? '取樣音色載入失敗,目前使用合成音' : '';

  return (
    <>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <section className="sheet" role="dialog" aria-label="聲音設定" onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>聲音設定</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="關閉"><IconClose /></button>
            </header>

            <div className="field">
              <label htmlFor="voice">吉他音色</label>
              <select id="voice" value={s.voice} onChange={(e) => setVoice(e.target.value)}>
                {VOICES.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
              </select>
              {voiceNote && <p className="hint">{voiceNote}</p>}
            </div>

            <div className="field">
              <label htmlFor="reverb">殘響 <output>{Math.round(s.reverb * 100)}%</output></label>
              <input id="reverb" type="range" min="0" max="1" step="0.01" value={s.reverb} onChange={(e) => setFx({ reverb: Number(e.target.value) })} />
            </div>
            <div className="field field-row">
              <label className="check"><input type="checkbox" checked={s.chorus} onChange={(e) => setFx({ chorus: e.target.checked })} /> 合唱(Chorus)</label>
              <label className="check"><input type="checkbox" checked={s.fuzz} onChange={(e) => setFx({ fuzz: e.target.checked })} /> 破音(Fuzz)</label>
            </div>
            <div className="field">
              <label htmlFor="volume">總音量 <output>{Math.round(s.volume * 100)}%</output></label>
              <input id="volume" type="range" min="0" max="1" step="0.01" value={s.volume} onChange={(e) => setFx({ volume: Number(e.target.value) })} />
            </div>

            <hr />
            <div className="field">
              <label htmlFor="bpm">節拍器速度 <output>{s.bpm} BPM</output></label>
              <input id="bpm" type="range" min="40" max="220" step="1" value={s.bpm} onChange={(e) => setBpm(Number(e.target.value))} />
            </div>
            <div className="field field-row">
              <div className="segmented" role="group" aria-label="拍號">
                {Object.keys(TIME_SIGS).map((t) => (
                  <button key={t} className={s.timeSig === t ? 'is-on' : ''} onClick={() => setTimeSig(t)} disabled={!!s.backingId}>{t}</button>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={tap}>點擊測速</button>
            </div>
            <p className="hint">iPhone 沒有聲音時,請確認側邊的靜音開關沒有開啟。</p>
          </section>
        </div>
      )}

      <footer className="dock" aria-label="練習工具列">
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

        <button className="btn btn-ghost btn-icon" onClick={() => setOpen(true)} aria-label="聲音設定"><IconSliders /></button>
      </footer>
    </>
  );
}
