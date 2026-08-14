import { useEffect, useRef } from 'react';

/**
 * CasaConnect's one signature moment: a slow-drifting survey grid behind the
 * hero, warming toward the accent under the cursor.
 *
 * Rewritten from the original, which put the hovered cell in React state and
 * listed it as a useEffect dependency, so every mouse move tore down and
 * rebuilt the whole requestAnimationFrame loop. Pointer position now lives in
 * a ref and never re-renders React.
 */
export default function Squares({
  speed = 0.22,
  squareSize = 56,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offset = { x: 0, y: 0 };
    const pointer = { x: -9999, y: -9999 };
    let frame = 0;
    let dpr = 1;

    const token = (name) => {
      const raw = getComputedStyle(canvas).getPropertyValue(name).trim();
      return raw || '0 0 0';
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const line = token('--line');
      const accent = token('--accent');

      ctx.clearRect(0, 0, w, h);

      const startX = -(offset.x % squareSize);
      const startY = -(offset.y % squareSize);

      // Accent wash under the cursor, drawn beneath the grid so the lines
      // stay crisp on top of it.
      if (pointer.x > -9999) {
        const glow = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          squareSize * 3.2
        );
        glow.addColorStop(0, `rgba(${accent.replace(/\s+/g, ',')}, 0.10)`);
        glow.addColorStop(1, `rgba(${accent.replace(/\s+/g, ',')}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.strokeStyle = `rgb(${line.replace(/\s+/g, ',')})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startX; x <= w + squareSize; x += squareSize) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = startY; y <= h + squareSize; y += squareSize) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
      }
      ctx.stroke();

      // Fade the grid out toward the edges so it reads as texture, not a table.
      const vignette = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.15,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75
      );
      const canvasRgb = token('--canvas').replace(/\s+/g, ',');
      vignette.addColorStop(0, `rgba(${canvasRgb}, 0)`);
      vignette.addColorStop(1, `rgb(${canvasRgb})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const tick = () => {
      offset.x = (offset.x + speed) % squareSize;
      offset.y = (offset.y + speed * 0.6) % squareSize;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const start = () => {
      cancelAnimationFrame(frame);
      resize();
      if (reduceQuery.matches) draw();
      else frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceQuery.matches) draw();
    });
    observer.observe(canvas);

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    reduceQuery.addEventListener('change', start);
    themeQuery.addEventListener('change', draw);

    start();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      reduceQuery.removeEventListener('change', start);
      themeQuery.removeEventListener('change', draw);
    };
  }, [speed, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      className={`block h-full w-full ${className}`}
    />
  );
}
