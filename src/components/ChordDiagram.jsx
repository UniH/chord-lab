// 和弦圖:用 svguitar 畫,圓點文字可切換 音名 / 指法 / 級數(預設音名),根音用粉紅色
import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { analyzeChord, pretty } from '../lib/theory.js';

export const COLORS = {
  root: '#ff8ec6',
  note: '#a9b8ff',
  line: 'rgba(236,232,248,0.5)',
  text: '#ece8f8',
  muted: '#a8a1c6',
  ink: '#120e22',
};

export default function ChordDiagram({ chord, labelMode = 'note' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const a = analyzeChord(chord);
    const dotText = (s) => (labelMode === 'finger' ? (s.finger ? String(s.finger) : '') : labelMode === 'note' ? pretty(s.note) : s.degree);
    const underText = (s) => (s.fret === null ? '' : labelMode === 'note' ? s.degree : pretty(s.note));

    const fingers = a.strings.map((s) => {
      if (s.fret === null) return [s.stringNo, 'x'];
      if (s.fret === 0) return [s.stringNo, 0];
      return [
        s.stringNo,
        s.fret - a.position + 1,
        { text: dotText(s), color: s.isRoot ? COLORS.root : COLORS.note, textColor: COLORS.ink },
      ];
    });
    const barres = a.barres.map((b) => ({
      fromString: b.fromString,
      toString: b.toString,
      fret: b.fret - a.position + 1,
      color: 'rgba(169,184,255,0.32)',
    }));

    new SVGuitarChord(el)
      .configure({
        strings: 6,
        frets: a.span,
        position: a.position,
        tuning: a.strings.map(underText),
        fretLabelPosition: 'left',
        fretLabelFontSize: 40,
        tuningsFontSize: 30,
        fingerSize: 0.8,
        fingerTextSize: 26,
        fingerColor: COLORS.note,
        fingerTextColor: COLORS.ink,
        color: COLORS.line,
        tuningsColor: COLORS.muted,
        fretLabelColor: COLORS.text,
        backgroundColor: 'none',
        strokeWidth: 2,
        nutWidth: 10,
        barreChordRadius: 0.5,
        emptyStringIndicatorSize: 0.55,
        sidePadding: 0.22,
        titleBottomMargin: 0,
        fixedDiagramPosition: true,
        fontFamily: 'Accidentals, "Noto Sans TC", system-ui, sans-serif',
      })
      .chord({ fingers, barres })
      .draw();

    // 弦下方的標籤與空弦記號:根音改成粉紅色
    const labels = el.querySelectorAll('.tuning');
    const sounding = a.strings.filter((s) => s.fret !== null);
    if (labels.length === 6) {
      a.strings.forEach((s, i) => {
        if (s.isRoot) labels[i].setAttribute('fill', COLORS.root);
        else if (s.fret !== null) labels[i].setAttribute('fill', '#cfc9e6');
      });
    }
    const opens = el.querySelectorAll('.open-string');
    const openStrings = sounding.filter((s) => s.fret === 0);
    if (opens.length === openStrings.length) {
      openStrings.forEach((s, i) => {
        if (s.isRoot) opens[i].setAttribute('stroke', COLORS.root);
      });
    }
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `${chord.name} 和弦圖`);
    }
  }, [chord, labelMode]);

  return <div className="chord-diagram" ref={ref} />;
}
