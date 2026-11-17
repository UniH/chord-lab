// 首頁:網站導覽、基本樂理、整套系統怎麼串起來、學習路徑與每天的練法
import { CHORD_LAB } from '../data/chords.js';
import ChordCard from '../components/ChordCard.jsx';
import Neck from '../components/Neck.jsx';
import { Segmented } from '../components/Explorer.jsx';
import { COLORS } from '../components/ChordDiagram.jsx';
import { useProgress, useStore, setState } from '../lib/store.js';
import { CHORD_BY_ID, TUNING_MIDI, midiAt } from '../lib/theory.js';
import { chordHref } from '../lib/chordbook.js';
import { playNote } from '../lib/audio.js';
import { IconArrow, IconPlay, IconMetronome, IconWave, IconSliders } from '../components/Icons.jsx';

const PLAN = CHORD_LAB.plan;
const TOTAL = PLAN.reduce((n, w) => n + w.items.length, 0);
const UNITS = CHORD_LAB.units;
const TRACKS = CHORD_LAB.progressions.length;

const TOC = [
  { id: 'map', label: '網站地圖' },
  { id: 'theory', label: '基本樂理' },
  { id: 'system', label: '四個單元怎麼串' },
  { id: 'paths', label: '學習路徑' },
  { id: 'routine', label: '每天怎麼練' },
  { id: 'dock', label: '底部工具列' },
];
const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ───── 樂理用的資料 ───── */
const NOTES = [
  { n: 'C' }, { n: 'C♯', alt: 'D♭' }, { n: 'D' }, { n: 'D♯', alt: 'E♭' }, { n: 'E' }, { n: 'F' },
  { n: 'F♯', alt: 'G♭' }, { n: 'G' }, { n: 'G♯', alt: 'A♭' }, { n: 'A' }, { n: 'A♯', alt: 'B♭' }, { n: 'B' },
];
// 級數:離根音幾個半音、以 C 為根音時是哪個音
const DEGREES = [
  ['R', 'C', '根音'], ['♭2', 'D♭', ''], ['2', 'D', '二度(九度)'], ['♭3', 'E♭', '小三度'], ['3', 'E', '大三度'], ['4', 'F', '四度'],
  ['♭5', 'G♭', '減五度'], ['5', 'G', '五度'], ['♯5', 'G♯', '增五度'], ['6', 'A', '六度'], ['♭7', 'B♭', '小七度'], ['7', 'B', '大七度'],
];
const KEY_DEGREES = ['R', '♭3', '3', '5', '♭7', '7']; // 表格裡標成粉紅色、最該先記的幾個
const CHORD_TYPES = [
  { name: 'C', type: '大三和弦', tones: 'R  3  5', notes: 'C E G', mood: '明亮、穩定', to: ['C', 'major'] },
  { name: 'Cm', type: '小三和弦', tones: 'R  ♭3  5', notes: 'C E♭ G', mood: '暗一點、內斂', to: ['C', 'minor'] },
  { name: 'Csus2', type: '掛二', tones: 'R  2  5', notes: 'C D G', mood: '開闊、懸浮,不分大小調', to: ['C', 'sus2'] },
  { name: 'Csus4', type: '掛四', tones: 'R  4  5', notes: 'C F G', mood: '懸著,想回到大三和弦', to: ['C', 'sus4'] },
  { name: 'Cadd9', type: '加九', tones: 'R  3  5  9', notes: 'C E G D', mood: '明亮之外多一層', to: ['C', 'add9'] },
  { name: 'Cmaj7', type: '大七', tones: 'R  3  5  7', notes: 'C E G B', mood: '柔軟、朦朧', to: ['C', 'maj7'] },
  { name: 'Cm7', type: '小七', tones: 'R  ♭3  5  ♭7', notes: 'C E♭ G B♭', mood: '比小三和弦溫和', to: ['C', 'm7'] },
  { name: 'C7', type: '屬七', tones: 'R  3  5  ♭7', notes: 'C E G B♭', mood: '有張力、想往下一個和弦走', to: ['C', '7'] },
  { name: 'Cdim', type: '減', tones: 'R  ♭3  ♭5', notes: 'C E♭ G♭', mood: '緊張、不穩', to: ['C', 'dim'] },
  { name: 'Caug', type: '增', tones: 'R  3  ♯5', notes: 'C E G♯', mood: '不安、往上飄', to: ['C', 'aug'] },
];
const DIATONIC = [
  ['I', 'C', '家。大部分的歌從這裡出發、回到這裡'], ['ii', 'Dm', '常接到 V'], ['iii', 'Em', '介於 I 和 vi 之間的過門'], ['IV', 'F', '離開家,往外走'],
  ['V', 'G', '最想回家的和弦'], ['vi', 'Am', '小調的家,悲傷版的 I'], ['vii°', 'Bdim', '很少單獨用'],
];
// 第 6、5 弦上的自然音(沒有升降記號的音):找根音用
const NATURAL = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };
const ROOT_DOTS = [6, 5].flatMap((string) =>
  Array.from({ length: 13 }, (_, fret) => ({ string, fret, text: NATURAL[midiAt(string, fret) % 12] })).filter((d) => d.text)
    .map((d) => ({ ...d, fill: d.fret === 0 || d.fret === 12 ? COLORS.root : COLORS.note })),
);
const OPEN_STRINGS = TUNING_MIDI.map((m, i) => ({ no: 6 - i, name: ['E', 'A', 'D', 'G', 'B', 'E'][i], midi: m }));

/* ───── 四個單元怎麼串 ───── */
const SYSTEM = [
  { no: '00', title: '起點:開放和弦與封閉和弦', text: '你已經會的 E 型、A 型封閉和弦,就是把開放和弦「整個往上搬」。接下來的四個單元,都是把這個想法推得更遠。', to: 'chords', link: '先複習常用和弦' },
  { no: '01', title: 'CAGED 系統', text: '不只 E 和 A,C、G、D 也能往上搬。五個指型首尾相接,同一個和弦在指板上就有五個位置。', gain: '知道任何和弦在整條指板的哪裡', to: 'unit/caged' },
  { no: '02', title: '三和弦與轉位', text: '把大指型拆小:只留上面三條弦的三個音。同一個和弦有三種排列(轉位),換和弦時手幾乎不用移動。', gain: '用最小的動作連接和弦', to: 'unit/triads' },
  { no: '03', title: '色彩和弦', text: '在三和弦上只動一個音:三度換成二度或四度(sus),或多加一個九度、七度。和弦的功能沒變,顏色變了。', gain: '同一個進行可以有很多種聲音', to: 'unit/colors' },
  { no: '04', title: '空弦持續音', text: '按著的指型往上移,空弦繼續響。兩者疊在一起,會得到很多用封閉和弦按不出來的聲音。', gain: '讓整把琴一起共鳴', to: 'unit/drones' },
];

/* ───── 學習路徑 ───── */
const PATHS = [
  {
    title: '剛開始學,會的和弦還不多',
    steps: [
      { text: '從和弦表的「開放和弦」開始,一次學兩三個,每個都按「試聽」對一下聲音。', to: 'chords', link: '和弦表' },
      { text: '開節拍器 60 BPM,兩個和弦來回換,每四拍換一次,換得過來再加速。' },
      { text: '到配樂選「流行經典」,把速度降下來,跟著 G – D – Em – C 刷。', to: 'backing/pop-1564-g', link: '配樂' },
      { text: '讀下面的基本樂理,知道大、小和弦差在哪一個音。' },
      { text: '開放和弦都順了之後,學 F 與 Bm 兩個封閉和弦,再走下一條路徑。', to: 'chords/F', link: 'F 和弦' },
    ],
  },
  {
    title: '已經會開放和弦與封閉和弦',
    note: '這個網站的主線,照八週課表走。',
    steps: [
      { text: '第 1–2 週:CAGED,把一個和弦搬到指板上的五個位置。', to: 'unit/caged', link: '單元 01' },
      { text: '第 3–4 週:上三弦的三和弦與轉位,用最近的位置連接和弦。', to: 'unit/triads', link: '單元 02' },
      { text: '第 5–6 週:sus2、sus4、add9、maj7、m7 等色彩和弦。', to: 'unit/colors', link: '單元 03' },
      { text: '第 7–8 週:空弦持續音,最後寫一段自己的進行。', to: 'unit/drones', link: '單元 04' },
      { text: '每完成一項就到課表打勾,進度存在這台裝置上。', to: 'plan', link: '八週課表' },
    ],
  },
  {
    title: '想寫歌、抓歌或練即興',
    steps: [
      { text: '在和弦表的「依調性」選一個調,那七個和弦就是這個調最常用的材料。', to: 'chords/key', link: '依調性' },
      { text: '到配樂挑不同風格的進行,注意它們用的是哪幾級(I、IV、V、vi…)。', to: 'backing', link: '配樂' },
      { text: '把進行裡的和弦換成色彩和弦:C 換成 Cadd9 或 Cmaj7,聽聽差別。', to: 'unit/colors', link: '單元 03' },
      { text: '開 Drone 選一個音,在上面試不同的音階,練耳朵分辨調式的氣氛。', to: 'drone', link: 'Drone' },
      { text: '知道幾個音卻不知道和弦名稱時,在和弦表輸入音名(例如 C E G)反查。', to: 'chords', link: '和弦表' },
    ],
  },
];

const ROUTINE = [
  { min: '5 分鐘', title: '暖手與認指板', text: '做幾題指板測驗,或在第 6、5 弦上邊彈邊唸出音名。', to: 'quiz', link: '測驗' },
  { min: '10 分鐘', title: '新的內容', text: '這一週單元裡的和弦或譜例。開節拍器,用彈得乾淨的速度練,不要求快。', to: 'plan', link: '這週的項目' },
  { min: '10 分鐘', title: '放進音樂裡', text: '挑一段配樂,把剛練的和弦用上。第一輪刷弦,第二輪分解,第三輪只彈上三弦。', to: 'backing', link: '配樂' },
  { min: '5 分鐘', title: '自由彈', text: '開 Drone 或單和弦的配樂,不看譜,隨便彈,把今天的東西變成自己的。', to: 'drone', link: 'Drone' },
];

const Go = ({ to, children }) => (<a className="go-link" href={`#/${to}`}>{children} <IconArrow /></a>);

export default function Home() {
  const progress = useProgress();
  const labelMode = useStore((s) => s.labelMode);
  const done = PLAN.reduce((n, w) => n + w.items.filter((i) => progress[i.id]).length, 0);
  const currentWeek = (PLAN.find((w) => w.items.some((i) => !progress[i.id])) || PLAN[PLAN.length - 1]).week;

  return (
    <div className="page home">
      <section className="hero">
        <p className="eyebrow">Guitar Chord Practice</p>
        <h1 data-text="Chord Lab">Chord Lab</h1>
        <p className="lead">吉他和弦的練習站:查得到每個和弦怎麼按,看得懂它為什麼這樣按,然後跟著配樂把它練進手裡。</p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg" href="#/plan">{done > 0 ? `繼續第 ${currentWeek} 週的練習` : '從八週課表開始'}</a>
          <a className="btn btn-ghost btn-lg" href="#/chords">查和弦</a>
          <a className="btn btn-ghost btn-lg" href="#/backing">開配樂</a>
        </div>
        {done > 0 && (
          <div className="hero-progress">
            <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={done} aria-label="課表進度">
              <span style={{ width: `${(done / TOTAL) * 100}%` }} />
            </div>
            <span>課表已完成 {done} / {TOTAL} 項</span>
          </div>
        )}
        <nav className="chip-row home-toc" aria-label="這一頁的內容">
          {TOC.map((t) => (<button key={t.id} className="chip" onClick={() => jump(t.id)}>{t.label}</button>))}
        </nav>
      </section>

      {/* ───────── 網站地圖 ───────── */}
      <section id="map" className="lesson">
        <h2>網站地圖:學、查、練</h2>
        <p className="prose">整個網站只做三件事。<b>學</b>:四個單元把和弦的系統講清楚。<b>查</b>:和弦表隨時找得到指法。<b>練</b>:配樂、節拍器、Drone 與測驗,讓學到的東西真的彈得出來。</p>

        <h3 className="group-title"><span>學</span>四個單元,照順序看</h3>
        <div className="unit-grid">
          {UNITS.map((u) => (
            <a key={u.id} className="unit-card" href={`#/unit/${u.id}`}>
              <span className="unit-no">{u.no}</span>
              <h3>{u.title}</h3>
              <p>{u.subtitle}</p>
              <span className="go"><IconArrow /></span>
            </a>
          ))}
        </div>

        <h3 className="group-title"><span>查</span>忘了怎麼按的時候</h3>
        <div className="tool-grid">
          <a className="tool-card" href="#/chords"><h3>和弦表</h3><p>打開就是最常用的和弦。可以輸入名稱(F#m7)、類型(sus4)、中文(大七),或用幾個音名反查。</p></a>
          <a className="tool-card" href="#/chords/key"><h3>依調性找和弦</h3><p>選一個調,列出這個調的七個順階和弦與級數。寫歌、抓歌時從這裡找。</p></a>
        </div>

        <h3 className="group-title"><span>練</span>把和弦放進音樂裡</h3>
        <div className="tool-grid">
          <a className="tool-card" href="#/backing"><h3>配樂</h3><p>{TRACKS} 段和弦進行,依風格分類。鼓、貝斯、鋪底循環播放,畫面顯示現在與下一個和弦。</p></a>
          <a className="tool-card" href="#/drone"><h3>Drone 持續音</h3><p>一個音一直響著,在上面試音階與和弦,練耳朵。</p></a>
          <a className="tool-card" href="#/quiz"><h3>指板測驗</h3><p>隨機出音名或和弦內音,在指板上點出位置。</p></a>
          <a className="tool-card" href="#/plan"><h3>八週課表</h3><p>每週五個練習項目,完成就打勾。不知道今天要練什麼時看這裡。</p></a>
        </div>
      </section>

      {/* ───────── 基本樂理 ───────── */}
      <section id="theory" className="lesson">
        <h2>基本樂理:看懂這個網站需要的六件事</h2>
        <p className="prose">不需要先讀完才能開始彈。遇到看不懂的標示再回來查,每一段都只講用得到的部分。</p>

        <article className="panel theory">
          <h3><small>1</small>十二個音,一格是一個半音</h3>
          <p className="prose">音樂裡只有十二個音,繞一圈之後回到同名、但高八度的音。吉他上<b>每往上一格就高一個半音</b>,所以第 12 格和空弦是同一個音名。</p>
          <div className="note-strip" role="list" aria-label="十二個音">
            {NOTES.map((x) => (<span key={x.n} role="listitem" className={x.alt ? 'is-sharp' : ''}><b>{x.n}</b>{x.alt && <small>{x.alt}</small>}</span>))}
          </div>
          <p className="hint">有兩個名字的是同一個音:C♯(升 C)和 D♭(降 D)按在同一格。注意 E–F、B–C 之間沒有升降音,它們本來就只差一格。</p>
        </article>

        <article className="panel theory">
          <h3><small>2</small>六條弦與指板</h3>
          <p className="prose">弦從最粗到最細是第 6 弦到第 1 弦,空弦的音是 <b>E A D G B E</b>。先記熟第 6 弦與第 5 弦上的音:幾乎所有和弦的根音都從這兩條弦找。</p>
          <div className="open-strings">
            {OPEN_STRINGS.map((o) => (
              <button key={o.no} className="chip" onClick={() => playNote(o.midi)} aria-label={`試聽第 ${o.no} 弦空弦 ${o.name}`}><b>{o.name}</b><small>第 {o.no} 弦</small></button>
            ))}
          </div>
          <Neck dots={ROOT_DOTS} fretCount={12} height={170} onPick={(p) => playNote(midiAt(p.string, p.fret))} />
          <p className="hint">第 6、5 弦上沒有升降記號的音,點一下可以聽。中間空著的格子就是升降音;粉紅色的空弦與第 12 格是同一個音名。熟了之後到 <a href="#/quiz">指板測驗</a> 考自己。</p>
        </article>

        <article className="panel theory">
          <h3><small>3</small>級數:每個音在和弦裡扮演的角色</h3>
          <p className="prose">和弦最重要的音叫<b>根音(R)</b>,和弦就用它命名。其他的音用「離根音多遠」來稱呼,這個距離就是級數。級數不會因為換調而改變,所以學一次、十二個調都能用。</p>
          <div className="table-scroll">
            <table className="theory-table degrees">
              <thead><tr><th>離根音的格數</th>{DEGREES.map((_, i) => (<td key={i}>{i}</td>))}</tr></thead>
              <tbody>
                <tr><th>級數</th>{DEGREES.map((d) => (<td key={d[0]} className={KEY_DEGREES.includes(d[0]) ? 'is-key' : ''}><b>{d[0]}</b></td>))}</tr>
                <tr><th>根音是 C 時</th>{DEGREES.map((d) => (<td key={d[0]}>{d[1]}</td>))}</tr>
              </tbody>
            </table>
          </div>
          <p className="hint">先記粉紅色的這幾個:<b>3</b> 與 <b>♭3</b> 決定和弦是大還是小;<b>5</b> 讓和弦站得穩;<b>7</b> 與 <b>♭7</b> 是七和弦多出來的那個音。9 就是高八度的 2。</p>
        </article>

        <article className="panel theory">
          <h3><small>4</small>和弦是怎麼組成的</h3>
          <p className="prose">三個音疊起來是<b>三和弦</b>:根音、三度、五度。其他的和弦都是從這裡改一個音或加一個音。下面全部以 C 為例,點和弦名稱可以看指法。</p>
          <div className="table-scroll">
            <table className="theory-table">
              <thead><tr><th>和弦</th><th>類型</th><th>組成</th><th>音</th><th>聽起來</th></tr></thead>
              <tbody>
                {CHORD_TYPES.map((c) => (
                  <tr key={c.name}>
                    <th><a href={chordHref(...c.to)}>{c.name}</a></th><td>{c.type}</td><td className="tones">{c.tones}</td><td>{c.notes}</td><td>{c.mood}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">和弦名稱的讀法:大寫字母是根音;後面什麼都沒有是大三和弦,m 是小三和弦;再後面的數字或字是多加或更動的音。F♯m7 就是「根音 F♯、小三和弦、加小七度」。</p>
        </article>

        <article className="panel theory">
          <h3><small>5</small>調與順階和弦:哪些和弦會一起出現</h3>
          <p className="prose">一首歌通常只用同一個音階裡的音。用 C 大調音階的七個音各疊出一個和弦,會得到七個<b>順階和弦</b>,用羅馬數字標示它是第幾級(大寫是大和弦,小寫是小和弦)。</p>
          <div className="table-scroll">
            <table className="theory-table">
              <thead><tr><th>級數</th><th>C 大調</th><th>角色</th></tr></thead>
              <tbody>
                {DIATONIC.map((d) => (<tr key={d[0]}><th>{d[0]}</th><td><b>{d[1]}</b></td><td>{d[2]}</td></tr>))}
              </tbody>
            </table>
          </div>
          <p className="hint">配樂裡常看到的「I–V–vi–IV」就是這個意思:在 C 調是 C–G–Am–F,在 G 調是 G–D–Em–C,聽起來是同一種進行。想看其他調,到和弦表的 <a href="#/chords/key">依調性</a>。</p>
        </article>

        <article className="panel theory">
          <h3><small>6</small>怎麼看和弦圖</h3>
          <div className="diagram-guide">
            <div className="diagram-demo">
              <ChordCard chord={CHORD_BY_ID.C} />
              <ChordCard chord={CHORD_BY_ID.F} />
            </div>
            <div>
              <ul className="guide-list">
                <li><b>直線是弦</b>,最左邊是第 6 弦(最粗),最右邊是第 1 弦;<b>橫線是琴格</b>,上面那條粗線是上弦枕。</li>
                <li><b>圓點</b>是要按的位置。<i className="dot" style={{ background: COLORS.root }} /> 粉紅色是根音,<i className="dot" style={{ background: COLORS.note }} /> 藍色是其他的音。</li>
                <li>弦的上方:<b>○</b> 是空弦要彈,<b>✕</b> 是這條弦不彈。</li>
                <li>橫跨幾條弦的長條是<b>封閉</b>:一根手指橫按。左邊出現「3fr」表示圖是從第 3 格開始畫的。</li>
                <li>圖的下方是每條弦的另一種標示,和圓點裡的字互相對照。</li>
              </ul>
              <p className="field-label">圓點裡要顯示什麼,每一頁上方都能切換,試試看:</p>
              <Segmented
                label="和弦圖標示"
                value={labelMode}
                onChange={(v) => setState({ labelMode: v })}
                options={[{ value: 'note', label: '音名' }, { value: 'finger', label: '指法' }, { value: 'degree', label: '級數' }]}
              />
              <p className="hint"><b>音名</b>:按出來是什麼音。<b>指法</b>:1 食指、2 中指、3 無名指、4 小指。<b>級數</b>:這個音在和弦裡的角色,要理解和弦時切到這個。</p>
            </div>
          </div>
        </article>
      </section>

      {/* ───────── 系統 ───────── */}
      <section id="system" className="lesson">
        <h2>四個單元怎麼串起來</h2>
        <p className="prose">四個單元不是四套各自獨立的東西,而是同一個想法一步一步推出來的:<b>從你已經會的指型出發,先搬動它,再拆小它,再改一個音,最後讓空弦加進來。</b></p>
        <ol className="system-flow">
          {SYSTEM.map((x) => (
            <li key={x.no}>
              <span className="unit-no">{x.no}</span>
              <div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
                {x.gain && <p className="gain"><b>學完之後</b>{x.gain}</p>}
                <Go to={x.to}>{x.link || '進入這個單元'}</Go>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── 學習路徑 ───────── */}
      <section id="paths" className="lesson">
        <h2>學習路徑:從哪裡開始</h2>
        <p className="prose">依你現在的程度挑一條。三條路徑用的是同一批工具,只是順序不同。</p>
        <div className="path-grid">
          {PATHS.map((p) => (
            <article key={p.title} className="panel path">
              <h3>{p.title}</h3>
              {p.note && <p className="hint">{p.note}</p>}
              <ol>
                {p.steps.map((st, i) => (
                  <li key={i}>{st.text}{st.to && <> <a href={`#/${st.to}`}>{st.link}</a></>}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── 每天怎麼練 ───────── */}
      <section id="routine" className="lesson">
        <h2>每天怎麼練:30 分鐘的安排</h2>
        <p className="prose">每天短短地練,比一週一次練很久有效。時間不夠就各砍一半,順序不要變。</p>
        <ol className="routine">
          {ROUTINE.map((r) => (
            <li key={r.title}>
              <span className="routine-min">{r.min}</span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.text} <a href={`#/${r.to}`}>{r.link}</a></p>
              </div>
            </li>
          ))}
        </ol>
        <ul className="guide-list">
          <li><b>先慢。</b>把速度降到彈得乾淨為止,連續三次沒有失誤再加 4 BPM。</li>
          <li><b>永遠跟著拍子。</b>節拍器或配樂二選一,換和弦要在第一拍到位。</li>
          <li><b>邊彈邊說。</b>說出根音在哪條弦、這個音是幾級。手記得住的東西,腦袋也要知道。</li>
          <li><b>用耳朵對答案。</b>不確定按得對不對,按和弦圖下方的「試聽」,或打開配樂的「吉他示範」。</li>
        </ul>
      </section>

      {/* ───────── 工具列 ───────── */}
      <section id="dock" className="lesson">
        <h2>底部工具列:每一頁都在</h2>
        <p className="prose">畫面最下面那一排在每一頁都看得到,所以可以一邊看和弦圖、一邊開著配樂或節拍器。</p>
        <ul className="dock-guide">
          <li><span className="dock-icon"><IconPlay /></span><div><b>播放/暫停配樂</b><p>播放目前選的那一段配樂。換頁不會停,暫停後再按會從同一個地方接下去。要換一段,到「配樂」頁選。</p></div></li>
          <li><span className="dock-icon"><IconMetronome /></span><div><b>節拍器與速度</b><p>旁邊的 − 和 + 調整 BPM,配樂也用同一個速度。</p></div></li>
          <li><span className="dock-icon"><IconWave /></span><div><b>Drone 持續音</b><p>讓一條空弦的音一直響著。詳細的設定在「Drone」頁。</p></div></li>
          <li><span className="dock-icon"><IconSliders /></span><div><b>混音器</b><p>鼓、貝斯、鋪底、吉他示範、節拍器各自的開關與音量,還有吉他音色、殘響與總音量。</p></div></li>
        </ul>
        <p className="hint">練習紀錄與設定都存在這台裝置的瀏覽器裡,不會跨裝置同步;換裝置時到 <a href="#/plan">課表</a> 頁匯出再匯入。</p>
      </section>
    </div>
  );
}
