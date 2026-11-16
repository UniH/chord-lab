// 譜例:用 alphaTab 畫五線譜 + 六線譜,並可播放(游標會跟著走)
import { useEffect, useRef, useState } from 'react';
import { IconPlay, IconPause, IconStop, IconLoop } from './Icons.jsx';

let alphaTabModule = null;
const loadAlphaTab = () => (alphaTabModule ||= import('@coderline/alphatab'));
const asset = (path) => new URL(path, document.baseURI).href;

export default function Score({ title, tex }) {
  const host = useRef(null);
  const api = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [player, setPlayer] = useState('off'); // off | loading | ready
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const wantPlay = useRef(false);

  function build(alphaTab, withPlayer) {
    api.current?.destroy();
    host.current.innerHTML = '';
    const narrow = host.current.clientWidth < 560;
    const a = new alphaTab.AlphaTabApi(host.current, {
      core: { fontDirectory: asset('font/'), engine: 'svg' },
      display: {
        scale: narrow ? 0.72 : 0.9,
        stretchForce: 0.9,
        justifyLastSystem: true,
        padding: [4, 12, 4, 12],
        resources: {
          mainGlyphColor: '#ece8f8',
          secondaryGlyphColor: 'rgba(236,232,248,0.55)',
          staffLineColor: 'rgba(236,232,248,0.32)',
          barSeparatorColor: 'rgba(236,232,248,0.5)',
          barNumberColor: '#a9b8ff',
          scoreInfoColor: '#ece8f8',
        },
      },
      notation: {
        elements: { scoreTitle: false, scoreSubTitle: false, scoreArtist: false, scoreAlbum: false, scoreWords: false, scoreMusic: false, guitarTuning: false, trackNames: false },
      },
      player: {
        enablePlayer: withPlayer,
        soundFont: asset('soundfont/sonivox.sf3'),
        enableCursor: true,
        enableUserInteraction: false,
        scrollMode: 'off',
      },
    });
    a.error.on((e) => {
      console.warn('alphaTab', e);
      setStatus('error');
    });
    a.renderFinished.on(() => setStatus('ready'));
    if (withPlayer) {
      a.playerReady.on(() => {
        setPlayer('ready');
        a.isLooping = loop;
        a.playbackSpeed = speed;
        a.countInVolume = 1;
        if (wantPlay.current) {
          wantPlay.current = false;
          a.play();
        }
      });
      a.playerStateChanged.on((e) => setPlaying(e.state === 1));
    }
    a.tex(tex);
    api.current = a;
  }

  useEffect(() => {
    let dead = false;
    loadAlphaTab()
      .then((alphaTab) => !dead && build(alphaTab, false))
      .catch(() => !dead && setStatus('error'));
    return () => {
      dead = true;
      api.current?.destroy();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex]);

  async function toggle() {
    if (player === 'off') {
      // 第一次按播放才載入合成器與音色庫
      setPlayer('loading');
      wantPlay.current = true;
      build(await loadAlphaTab(), true);
      return;
    }
    if (player === 'ready') api.current.playPause();
  }
  function stop() {
    wantPlay.current = false;
    if (player === 'ready') api.current.stop();
  }
  function changeSpeed(v) {
    setSpeed(v);
    if (api.current && player === 'ready') api.current.playbackSpeed = v;
  }
  function changeLoop() {
    setLoop(!loop);
    if (api.current && player === 'ready') api.current.isLooping = !loop;
  }

  return (
    <figure className="score">
      <figcaption>
        <strong>{title}</strong>
        <div className="score-controls">
          <button className="btn btn-primary btn-sm" onClick={toggle} disabled={status !== 'ready' || player === 'loading'}>
            {playing ? <IconPause /> : <IconPlay />}
            {player === 'loading' ? '載入中…' : playing ? '暫停' : '播放'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={stop} disabled={player !== 'ready'} aria-label="停止">
            <IconStop />
          </button>
          <button className={`btn btn-ghost btn-sm${loop ? ' is-on' : ''}`} onClick={changeLoop} aria-pressed={loop} aria-label="循環播放">
            <IconLoop />
          </button>
          <label className="select-inline">
            <span>速度</span>
            <select value={speed} onChange={(e) => changeSpeed(Number(e.target.value))}>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
            </select>
          </label>
        </div>
      </figcaption>
      <div className="score-paper">
        {status === 'loading' && <p className="score-note">譜例載入中…</p>}
        {status === 'error' && <p className="score-note">譜例載入失敗,請重新整理頁面。</p>}
        <div ref={host} className="score-host" />
      </div>
    </figure>
  );
}
