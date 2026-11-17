import { useRef, useState } from 'react';
import { CHORD_LAB } from '../data/chords.js';
import { useProgress, toggleProgress, exportData, importData, resetData } from '../lib/store.js';
import { IconCheck, IconArrow } from '../components/Icons.jsx';

const PLAN = CHORD_LAB.plan;
const TOTAL = PLAN.reduce((n, w) => n + w.items.length, 0);

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Home() {
  const progress = useProgress();
  const done = PLAN.reduce((n, w) => n + w.items.filter((i) => progress[i.id]).length, 0);
  const currentWeek = (PLAN.find((w) => w.items.some((i) => !progress[i.id])) || PLAN[PLAN.length - 1]).week;
  const [openWeek, setOpenWeek] = useState(currentWeek);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  function download() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chord-lab-紀錄-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importData(await file.text());
      setMessage('已匯入紀錄。');
    } catch (err) {
      setMessage(`匯入失敗:${err.message}`);
    }
    e.target.value = '';
  }
  function reset() {
    if (window.confirm('確定要清除這台裝置上所有的練習紀錄與測驗統計嗎?這個動作無法復原。')) {
      resetData();
      setMessage('已清除紀錄。');
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Guitar Chord Practice</p>
        <h1 data-text="Chord Lab">Chord Lab</h1>
        <p className="lead">從封閉和弦出發,用八週把和弦語彙擴充到整條指板:CAGED、三和弦轉位、色彩和弦、空弦持續音。</p>
        <div className="hero-progress">
          <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={done} aria-label="總進度">
            <span style={{ width: `${(done / TOTAL) * 100}%` }} />
          </div>
          <span>已完成 {done} / {TOTAL} 項 · 目前在第 {currentWeek} 週</span>
        </div>
      </section>

      <section>
        <h2 className="section-title">四個單元</h2>
        <div className="unit-grid">
          {CHORD_LAB.units.map((u) => (
            <a key={u.id} className="unit-card" href={`#/unit/${u.id}`}>
              <span className="unit-no">{u.no}</span>
              <h3>{u.title}</h3>
              <p>{u.subtitle}</p>
              <span className="go"><IconArrow /></span>
            </a>
          ))}
        </div>
        <div className="tool-grid">
          <a className="tool-card" href="#/chords"><h3>和弦表</h3><p>常用和弦一覽,也能用名稱、類型或音名搜尋</p></a>
          <a className="tool-card" href="#/backing"><h3>配樂練習</h3><p>九十多段和弦進行,鼓、貝斯、鋪底各自調音量</p></a>
          <a className="tool-card" href="#/drone"><h3>Drone 持續音</h3><p>選一條空弦持續響著,在上面即興</p></a>
          <a className="tool-card" href="#/quiz"><h3>指板測驗</h3><p>隨機出音名,在指板上點出位置</p></a>
        </div>
      </section>

      <section>
        <h2 className="section-title">八週課表與練習紀錄</h2>
        <p className="section-text">每天 20 到 30 分鐘就夠。完成一項就打勾,紀錄存在這台裝置的瀏覽器裡。</p>
        <div className="weeks">
          {PLAN.map((w) => {
            const n = w.items.filter((i) => progress[i.id]).length;
            const open = openWeek === w.week;
            const complete = n === w.items.length;
            return (
              <article key={w.week} className={`week${open ? ' is-open' : ''}${complete ? ' is-complete' : ''}`}>
                <button className="week-head" onClick={() => setOpenWeek(open ? null : w.week)} aria-expanded={open}>
                  <span className="week-no">第 {w.week} 週</span>
                  <span className="week-title">{w.title}</span>
                  <span className="week-count">{complete ? <IconCheck /> : null}{n}/{w.items.length}</span>
                </button>
                {open && (
                  <div className="week-body">
                    <p className="week-goal"><b>目標</b>{w.goal}</p>
                    <ul>
                      {w.items.map((item) => (
                        <li key={item.id} className={progress[item.id] ? 'is-done' : ''}>
                          <label>
                            <input type="checkbox" checked={!!progress[item.id]} onChange={() => toggleProgress(item.id)} />
                            <span className="box"><IconCheck /></span>
                            <span className="item-text">{item.text}</span>
                          </label>
                          {progress[item.id] && <time>{fmtDate(progress[item.id])}</time>}
                          {item.to && <a href={`#/${item.to}`} aria-label="前往練習"><IconArrow /></a>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="data-row">
          <button className="btn btn-ghost" onClick={download}>匯出紀錄</button>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>匯入紀錄</button>
          <button className="btn btn-ghost btn-danger" onClick={reset}>清除紀錄</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={upload} />
          {message && <span className="hint" role="status">{message}</span>}
        </div>
        <p className="hint">紀錄不會在手機與電腦之間同步。要換裝置時,先匯出再到另一台匯入。</p>
      </section>
    </div>
  );
}
