import React, { useCallback, useEffect, useRef } from 'react';
import './Shredder.css';

/** Direction the row left the sheet in. `down` is the vertical slice a mouse
 *  drag makes; the two horizontal ones are the touch and mouse swipes. */
export type ShredDirection = 'left' | 'right' | 'down';

export interface ShredderProps<T> {
  items: T[];
  renderItem: (item: T, index: number, list: T[]) => React.ReactNode;
  /** Called once per committed tear, once the row has finished leaving. */
  onShred: (item: T, direction: ShredDirection) => void;
  /** Stable identity for a row. Removing an item must unmount that row and
   *  not hand its node, mid-animation, to whatever slides up the list. */
  getKey?: (item: T, index: number) => React.Key;
  /** While true the rows ignore pointers. */
  paused?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
}

type Axis = 'undecided' | 'x' | 'y';

interface DragState<T> {
  pointerId: number;
  item: T;
  row: HTMLElement;
  startX: number;
  startY: number;
  axis: Axis;
  pointerType: string;
}

// A gesture has to clear this before it may become a tear, so a tap or a
// stray nudge cannot take a row with it.
const AXIS_LOCK_PX = 12;
// How far a horizontal drag travels before it counts as "let go".
const SWIPE_COMMIT_PX = 90;
// The vertical slice a mouse makes is a short one.
const SLICE_COMMIT_PX = 28;
const EXIT_MS = 420;
const TAU = Math.PI * 2;

interface Texture {
  w: number;
  h: number;
  fibres: number[];
  blotches: number[];
}

/** Deterministic noise, so the paper looks the same on every redraw instead of
 *  reshuffling under the reader. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTexture(w: number, h: number): Texture {
  const rand = mulberry(7);
  const fibres: number[] = [];
  for (let i = 0; i < 1700; i++) {
    fibres.push(rand() * h, 14 + rand() * 150, 0.018 + rand() * 0.05, rand());
  }
  const blotches: number[] = [];
  for (let i = 0; i < 44; i++) {
    blotches.push(rand() * w, rand() * h, 24 + rand() * 150, 0.012 + rand() * 0.05, rand() > 0.5 ? 1 : 0);
  }
  return { w, h, fibres, blotches };
}

/**
 * Rows of content on a sheet that tears.
 *
 * The paper is a canvas behind the rows and only ever a backdrop: the rows
 * stay DOM, so buttons inside them keep working and text stays selectable. The
 * canvas is sized from the row list rather than the other way round, which is
 * why no row height is hard-coded here.
 *
 * Touch and mouse tear in different directions on purpose. A phone has to
 * scroll this list, so a row claims `pan-y` and can only be swiped sideways; a
 * mouse has nothing to scroll with, so it can drag a row down through the sheet.
 */
export function Shredder<T>({
  items,
  renderItem,
  onShred,
  getKey,
  paused = false,
  tone = 'dark',
  className = '',
}: ShredderProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState<T> | null>(null);
  const pausedRef = useRef(paused);
  const sliceRef = useRef<{ y0: number; y1: number; start: number } | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const frameRef = useRef(0);
  const loopingRef = useRef(false);

  pausedRef.current = paused;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      textureRef.current = null;
    }
    if (!textureRef.current || textureRef.current.w !== w || textureRef.current.h !== h) {
      textureRef.current = buildTexture(w, h);
    }
    const texture = textureRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = tone === 'dark' ? '#191817' : '#efe7d8';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < texture.blotches.length; i += 5) {
      const [x, y, r, alpha, dark] = texture.blotches.slice(i, i + 5);
      const tint = dark ? '0, 0, 0' : '255, 255, 255';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${tint}, ${alpha})`);
      g.addColorStop(1, `rgba(${tint}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }

    ctx.lineCap = 'round';
    for (let i = 0; i < texture.fibres.length; i += 4) {
      const [y, len, alpha, tint] = texture.fibres.slice(i, i + 4);
      ctx.strokeStyle = `rgba(${tint > 0.5 ? '255, 252, 244' : '86, 68, 44'}, ${alpha})`;
      ctx.lineWidth = 0.5 + tint * 1.3;
      ctx.beginPath();
      ctx.moveTo(-6, y);
      ctx.lineTo(len, y + (tint - 0.5) * 5);
      ctx.stroke();
    }

    // The cut itself, for as long as a slice is still travelling.
    const slice = sliceRef.current;
    if (slice) {
      const progress = Math.min((performance.now() - slice.start) / EXIT_MS, 1);
      const band = ctx.createLinearGradient(0, slice.y0, 0, slice.y1);
      band.addColorStop(0, `rgba(0, 0, 0, ${0.5 * progress})`);
      band.addColorStop(0.5, `rgba(255, 236, 196, ${0.16 * progress})`);
      band.addColorStop(1, `rgba(0, 0, 0, ${0.5 * progress})`);
      ctx.fillStyle = band;
      ctx.fillRect(0, slice.y0, w, slice.y1 - slice.y0);
      ctx.strokeStyle = `rgba(255, 240, 205, ${0.55 * progress})`;
      ctx.lineWidth = 1.4;
      for (let x = 0; x < w; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, slice.y0);
        ctx.lineTo(x + ((x % 5) - 2), slice.y0 + 5 + (x % 9));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, slice.y1);
      ctx.lineTo(w, slice.y1);
      ctx.stroke();
      if (progress >= 1) sliceRef.current = null;
    }
  }, [tone]);

  // The loop only runs while something is moving; a still sheet costs nothing.
  const pump = useCallback(() => {
    if (loopingRef.current) return;
    loopingRef.current = true;
    const tick = () => {
      draw();
      if (dragRef.current || sliceRef.current) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        loopingRef.current = false;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw, items.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => draw());
    observer.observe(list);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  const resetRow = (row: HTMLElement) => {
    row.style.transition = '';
    row.style.transform = '';
    delete row.dataset.dragging;
    delete row.dataset.axis;
    delete row.dataset.tearing;
  };

  const release = (drag: DragState<T>, pointerId: number) => {
    if (drag.row.hasPointerCapture(pointerId)) {
      try {
        drag.row.releasePointerCapture(pointerId);
      } catch {
        /* capture is best effort */
      }
    }
  };

  const abandon = (drag: DragState<T>, pointerId: number) => {
    dragRef.current = null;
    release(drag, pointerId);
    resetRow(drag.row);
    pump();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, item: T) => {
    if (pausedRef.current || dragRef.current) return;
    const row = event.currentTarget;
    // A row on its way out, and the controls inside a row, are left alone.
    if (row.dataset.tearing === 'true') return;
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    dragRef.current = {
      pointerId: event.pointerId,
      item,
      row,
      startX: event.clientX,
      startY: event.clientY,
      axis: 'undecided',
      pointerType: event.pointerType,
    };
    try {
      row.setPointerCapture(event.pointerId);
    } catch {
      /* capture is best effort */
    }
    pump();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.axis === 'undecided') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) < AXIS_LOCK_PX) return;
      if (absX >= absY) {
        drag.axis = 'x';
      } else if (drag.pointerType === 'mouse') {
        drag.axis = 'y';
      } else {
        // Touch has already been claimed by the page scroller by this point;
        // hand it straight back rather than fighting it for the row.
        abandon(drag, event.pointerId);
        return;
      }
      drag.row.dataset.axis = drag.axis;
      drag.row.dataset.dragging = 'true';
    }

    if (drag.axis === 'x') {
      drag.row.style.transform = `translate3d(${dx}px, 0, 0)`;
    } else {
      drag.row.style.transform = `translate3d(0, ${Math.max(dy, 0)}px, 0)`;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = Math.max(event.clientY - drag.startY, 0);
    const row = drag.row;
    dragRef.current = null;
    release(drag, event.pointerId);

    const tear = (to: string, direction: ShredDirection) => {
      row.dataset.tearing = 'true';
      row.style.transition = `transform ${EXIT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      row.style.transform = to;
      // The item leaves the list only once the row has finished leaving, so the
      // tear is something you watch rather than a blink.
      window.setTimeout(() => onShred(drag.item, direction), EXIT_MS);
      pump();
    };

    if (drag.axis === 'x' && Math.abs(dx) >= SWIPE_COMMIT_PX) {
      tear(`translate3d(${dx > 0 ? 120 : -120}%, 0, 0)`, dx > 0 ? 'right' : 'left');
      return;
    }

    if (drag.axis === 'y' && dy >= SLICE_COMMIT_PX) {
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasBox = canvas.getBoundingClientRect();
        const rowBox = row.getBoundingClientRect();
        sliceRef.current = {
          y0: Math.max(0, rowBox.top - canvasBox.top),
          y1: Math.min(canvasBox.height, rowBox.bottom - canvasBox.top),
          start: performance.now(),
        };
      }
      tear('translate3d(0, 110%, 0)', 'down');
      return;
    }

    // Not far enough: settle back where it started.
    row.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
    row.style.transform = 'translate3d(0, 0, 0)';
    window.setTimeout(() => resetRow(row), 300);
    pump();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId) abandon(drag, event.pointerId);
  };

  return (
    <div
      className={`shredder ${className}`.trim()}
      data-tone={tone}
      data-paused={paused ? 'true' : undefined}
    >
      <canvas ref={canvasRef} className="shredder__paper" aria-hidden="true" />
      <div ref={listRef} className="shredder__list" role="list">
        {items.map((item, index) => (
          <div
            key={getKey ? getKey(item, index) : index}
            className="shredder__item"
            role="listitem"
            onPointerDown={(event) => handlePointerDown(event, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {renderItem(item, index, items)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shredder;
