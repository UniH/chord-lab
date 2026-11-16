// 整條指板:用 fretboard.js 畫,可以點擊
import { useEffect, useRef } from 'react';
import { Fretboard } from '@moonwave99/fretboard.js';

export default function Neck({ dots = [], fretCount = 15, onPick, height = 190 }) {
  const ref = useRef(null);
  const fb = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    const el = ref.current;
    el.innerHTML = '';
    const board = new Fretboard({
      el,
      fretCount,
      height,
      width: Math.max(640, fretCount * 62),
      dotSize: 26,
      dotTextSize: 12,
      dotStrokeColor: 'rgba(18,14,34,0.9)',
      dotStrokeWidth: 1.5,
      dotFill: (d) => d.fill || '#a9b8ff',
      dotText: (d) => d.text ?? '',
      disabledOpacity: 0.16,
      stringColor: 'rgba(236,232,248,0.55)',
      stringWidth: [1, 1, 1.4, 1.8, 2.2, 2.6],
      fretColor: 'rgba(236,232,248,0.22)',
      nutColor: 'rgba(236,232,248,0.8)',
      nutWidth: 6,
      middleFretColor: 'rgba(169,184,255,0.55)',
      middleFretWidth: 2,
      fretNumbersColor: '#a8a1c6',
      showFretNumbers: true,
      font: 'Accidentals, "Noto Sans TC", system-ui, sans-serif',
      topPadding: 22,
      bottomPadding: 12,
      leftPadding: 28,
      rightPadding: 16,
    });
    board.render();
    board.on('click', (position) => pickRef.current && pickRef.current(position));
    fb.current = board;
    return () => {
      board.removeEventListeners();
      el.innerHTML = '';
    };
  }, [fretCount, height]);

  useEffect(() => {
    if (!fb.current) return;
    fb.current.setDots(dots).render();
  }, [dots, fretCount, height]);

  return (
    <div className={`neck-scroll${onPick ? ' is-clickable' : ''}`}>
      <div className="neck" ref={ref} />
    </div>
  );
}
