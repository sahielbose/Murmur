"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 56;

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + radius, y);
  c.arcTo(x + w, y, x + w, y + h, radius);
  c.arcTo(x + w, y + h, x, y + h, radius);
  c.arcTo(x, y + h, x, y, radius);
  c.arcTo(x, y, x + w, y, radius);
  c.closePath();
}

/**
 * Real-time monochrome waveform driven by a Web Audio AnalyserNode
 * (MURMUR_UI.md §10.2, §12). Bars ease toward the analyser values so motion is
 * smooth; idle shows a flat resting line.
 */
export function LiveWaveform({
  stream,
  active,
}: {
  stream: MediaStream | null;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0.03));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let raf = 0;

    if (active && stream) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctor) {
        audioCtx = new Ctor();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
      }
    }

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--fg")
      .trim();
    const freq = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const draw = () => {
      const c = canvas.getContext("2d");
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, cssW, cssH);

      if (analyser && freq) analyser.getByteFrequencyData(freq);
      const step = freq ? Math.max(1, Math.floor(freq.length / BAR_COUNT)) : 1;
      const barW = cssW / BAR_COUNT;
      const bars = barsRef.current;

      for (let i = 0; i < BAR_COUNT; i++) {
        const raw = freq ? (freq[i * step] ?? 0) / 255 : 0;
        const target = active && freq ? Math.max(0.03, raw) : 0.03;
        bars[i] = (bars[i] ?? 0) + (target - (bars[i] ?? 0)) * 0.3;
        const h = Math.max(2, bars[i]! * cssH);
        const x = i * barW + barW * 0.22;
        const w = barW * 0.56;
        const y = (cssH - h) / 2;
        c.fillStyle = color || "#0A0A0A";
        roundRect(c, x, y, w, h, w / 2);
        c.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      void audioCtx?.close();
    };
  }, [stream, active]);

  return (
    <canvas ref={canvasRef} aria-hidden className="h-20 w-full max-w-md" />
  );
}
