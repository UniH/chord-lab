// 混音器:配樂各音軌的開關與音量、吉他音色與效果、總音量、節拍器設定。從底部工具列打開
import { useEffect, useRef } from 'react';
import { useStore, setState } from '../lib/store.js';
import {
  setBpm, setTimeSig, setVoice, setFx, setMix, setMixVolume, resetMixVolume, setDrumKit, setDrone, toggleBacking, selectedBacking,
  VOICES, TIME_SIGS, MIX_TRACKS,
} from '../lib/audio.js';
import { STRING_NAMES, pretty } from '../lib/theory.js';
import { IconPlay, IconPause, IconClose } from './Icons.jsx';

export const openMixer = () => setState({ mixerOpen: true });
const closeMixer = () => setState({ mixerOpen: false });

export default function Mixer() {
  const s = useStore();
  const taps = useRef([]);
  const open = s.mixerOpen;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeMixer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  function tap() {
    const now = performance.now();
    taps.current = taps.current.filter((t) => now - t < 2500);
    taps.current.push(now);
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
    }
  }

  const { prog } = selectedBacking();
  const playing = !!s.backingId && !s.backingPaused;
  const voiceNote =
    s.voice === 'synth' ? '' : s.voiceStatus === 'loading' ? '音色下載中…' : s.voiceStatus === 'failed' ? '取樣音色載入失敗,目前使用合成音' : '';
  const kitNote =
    s.drumKit !== 'sampled' ? '' : s.drumStatus === 'loading' ? '鼓組取樣下載中,先用合成鼓…' : s.drumStatus === 'failed' ? '鼓組取樣載入失敗,目前使用合成鼓' : '';

  return (
    <div className="sheet-backdrop" onClick={closeMixer}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label="混音器" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>混音器</h3>
          <button className="btn btn-ghost btn-icon" onClick={closeMixer} aria-label="關閉"><IconClose /></button>
        </header>

        <div className="sheet-section">
          <div className="sheet-now">
            <button className={`btn btn-round${playing ? ' is-on' : ''}`} onClick={toggleBacking} aria-label={playing ? '暫停配樂' : '播放配樂'}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <div>
              <h4>配樂音軌</h4>
              <p>{prog.name} · <a href={`#/backing/${prog.id}`} onClick={closeMixer}>換一首</a></p>
            </div>
          </div>
          <div className="mixer" role="group" aria-label="各音軌的開關與音量">
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
          </div>
          <div className="field field-row">
            <label className="select-inline">
              <span>鼓組</span>
              <select value={s.drumKit} onChange={(e) => setDrumKit(e.target.value)}>
                <option value="sampled">取樣鼓機</option>
                <option value="synth">合成鼓</option>
              </select>
            </label>
            <button className="btn btn-ghost btn-sm" onClick={resetMixVolume}>音量還原</button>
          </div>
          {kitNote && <p className="hint">{kitNote}</p>}
          <p className="hint">點音軌名稱可以開關。「節拍器」的開關只管配樂播放時要不要有拍點;它的音量和工具列的節拍器共用。</p>
        </div>

        <hr />
        <div className="sheet-section">
          <h4>吉他音色</h4>
          <p className="hint">試聽和弦與「吉他示範」音軌都用這個音色。</p>
          <div className="field">
            <label htmlFor="voice">音色</label>
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
        </div>

        <hr />
        <div className="sheet-section">
          <h4>Drone 持續音</h4>
          <div className="field field-row">
            <label className="select-inline">
              <span>弦</span>
              <select value={s.droneString} onChange={(e) => setDrone({ droneString: Number(e.target.value) })} aria-label="持續音的弦">
                {[6, 5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{pretty(STRING_NAMES[6 - n])}({n} 弦)</option>
                ))}
              </select>
            </label>
            <label className="check"><input type="checkbox" checked={s.droneOn} onChange={(e) => setDrone({ droneOn: e.target.checked })} /> 開啟</label>
          </div>
          <div className="field">
            <label htmlFor="drone-volume">音量 <output>{Math.round(s.droneVolume * 100)}%</output></label>
            <input id="drone-volume" type="range" min="0" max="1" step="0.01" value={s.droneVolume} onChange={(e) => setDrone({ droneVolume: Number(e.target.value) })} />
          </div>
        </div>

        <hr />
        <div className="field">
          <label htmlFor="volume">總音量 <output>{Math.round(s.volume * 100)}%</output></label>
          <input id="volume" type="range" min="0" max="1" step="0.01" value={s.volume} onChange={(e) => setFx({ volume: Number(e.target.value) })} />
        </div>

        <hr />
        <div className="sheet-section">
          <h4>速度與拍號</h4>
          <div className="field">
            <label htmlFor="bpm">速度 <output>{s.bpm} BPM</output></label>
            <input id="bpm" type="range" min="40" max="220" step="1" value={s.bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </div>
          <div className="field field-row">
            <div className="segmented" role="group" aria-label="節拍器的拍號">
              {Object.keys(TIME_SIGS).map((t) => (
                <button key={t} className={s.timeSig === t ? 'is-on' : ''} onClick={() => setTimeSig(t)} disabled={!!s.backingId}>{t}</button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={tap}>點擊測速</button>
          </div>
          <p className="hint">拍號只用在節拍器;配樂的拍號跟著節奏型走。</p>
        </div>
        <p className="hint">iPhone 沒有聲音時,請確認側邊的靜音開關沒有開啟。</p>
      </section>
    </div>
  );
}
