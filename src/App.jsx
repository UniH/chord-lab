import { useEffect, useState } from 'react';
import { CHORD_LAB } from './data/chords.js';
import Home from './pages/Home.jsx';
import Unit from './pages/Unit.jsx';
import DronePage from './pages/DronePage.jsx';
import Backing from './pages/Backing.jsx';
import Quiz from './pages/Quiz.jsx';
import ChordBook from './pages/ChordBook.jsx';
import Dock from './components/Dock.jsx';

function useHashRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, '');
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const onChange = () => {
      setRoute(get());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

const NAV = [
  { to: '', label: '課表' },
  ...CHORD_LAB.units.map((u) => ({ to: `unit/${u.id}`, label: u.title, no: u.no })),
  { to: 'chords', label: '和弦表' },
  { to: 'backing', label: '配樂' },
  { to: 'drone', label: 'Drone' },
  { to: 'quiz', label: '測驗' },
];

export default function App() {
  const route = useHashRoute();
  const [head, ...restParts] = route.split('/');
  const arg = restParts.join('/');
  let page;
  if (head === 'unit') page = <Unit key={arg} id={arg} />;
  else if (head === 'drone') page = <DronePage />;
  else if (head === 'backing') page = <Backing id={arg} />;
  else if (head === 'quiz') page = <Quiz />;
  else if (head === 'chords') page = <ChordBook name={safeDecode(arg)} />;
  else page = <Home />;

  const activeTo = head === 'unit' ? `unit/${arg}` : head || '';

  return (
    <>
      <div className="haze" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#/">Chord Lab</a>
        <nav aria-label="主選單">
          {NAV.map((n) => (
            <a key={n.to} href={`#/${n.to}`} className={activeTo === n.to ? 'is-on' : ''} aria-current={activeTo === n.to ? 'page' : undefined}>
              {n.no && <small>{n.no}</small>}
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main>{page}</main>
      <Dock />
    </>
  );
}
