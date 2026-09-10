import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Disc } from 'lucide-react';

export interface DollyItem {
  id: string | number;
  name: string;
  subtitle?: string;
  image: string;
  [key: string]: any;
}

interface DollyGalleryProps {
  items: DollyItem[];
  onItemClick?: (item: DollyItem) => void;
  onIndexChange?: (index: number) => void;
  infinite?: boolean;
  itemWidth?: number;
  perspective?: number;
  spacing?: number;
  spread?: number;
  scatter?: number;
  revealRange?: number;
  passRange?: number;
  parallaxX?: number;
  parallaxY?: number;
  tilt?: number;
  pulse?: number;
  smooth?: number;
  wheelSpeed?: number;
  dragSpeed?: number;
  autoScroll?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export const DollyGallery: React.FC<DollyGalleryProps> = ({
  items,
  onItemClick,
  onIndexChange,
  infinite = true,
  itemWidth = 340,
  perspective = 1000,
  spacing = 700,
  spread = 0.65,
  scatter = 0.08,
  revealRange = 2.2,
  passRange = 0.8,
  parallaxX = 0.12,
  parallaxY = 0.06,
  tilt = 4.0,
  pulse = 0.03,
  smooth = 0.85,
  wheelSpeed = 1.0,
  dragSpeed = 1.5,
  autoScroll = 0,
  pauseOnHover = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Current scroll position in "index step" units (float)
  const targetPosRef = useRef(0);
  const currentPosRef = useRef(0);
  const velocityRef = useRef(0);

  // Parallax pointer tracking
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartPosRef = useRef(0);

  const [renderPos, setRenderPos] = useState(0);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [scrollVelocity, setScrollVelocity] = useState(0);

  const itemCount = items.length;

  // Helper to wrap index safely for infinite mode
  const getWrappedIndex = useCallback(
    (val: number) => {
      if (itemCount === 0) return 0;
      if (!infinite) return Math.max(0, Math.min(itemCount - 1, val));
      return ((val % itemCount) + itemCount) % itemCount;
    },
    [itemCount, infinite]
  );

  const activeIndex = Math.round(getWrappedIndex(renderPos));

  // Notify active index change
  const prevActiveIndexRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveIndexRef.current !== activeIndex) {
      prevActiveIndexRef.current = activeIndex;
      onIndexChange?.(activeIndex);
    }
  }, [activeIndex, onIndexChange]);

  // Main animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Auto scroll if enabled
      if (autoScroll !== 0 && (!pauseOnHover || !isHoveredRef.current)) {
        targetPosRef.current += (autoScroll / spacing) * dt;
      }

      // Smooth pos damping towards targetPos
      const diff = targetPosRef.current - currentPosRef.current;
      const easing = 1 - Math.pow(1 - Math.min(1, 1 - smooth), dt * 60);
      currentPosRef.current += diff * easing;

      // Track scroll velocity for tilt and pulse
      const vel = (targetPosRef.current - currentPosRef.current) * 10;
      velocityRef.current = velocityRef.current * 0.8 + vel * 0.2;

      // Smooth pointer parallax damping
      const p = pointerRef.current;
      p.x += (p.targetX - p.x) * 0.1;
      p.y += (p.targetY - p.y) * 0.1;

      setRenderPos(currentPosRef.current);
      setPointerOffset({ x: p.x, y: p.y });
      setScrollVelocity(velocityRef.current);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [spacing, smooth, autoScroll, pauseOnHover]);

  // Event handlers for mouse wheel & drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = (e.deltaY * 0.0025 * wheelSpeed);
      let next = targetPosRef.current + delta;
      if (!infinite) {
        next = Math.max(-0.2, Math.min(itemCount - 0.8, next));
      }
      targetPosRef.current = next;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerRef.current.targetX = nx;
      pointerRef.current.targetY = ny;

      if (isDraggingRef.current) {
        const dy = dragStartYRef.current - e.clientY;
        const posDelta = (dy / (itemWidth * 0.8)) * dragSpeed;
        let next = dragStartPosRef.current + posDelta;
        if (!infinite) {
          next = Math.max(-0.2, Math.min(itemCount - 0.8, next));
        }
        targetPosRef.current = next;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragStartYRef.current = e.clientY;
      dragStartPosRef.current = targetPosRef.current;
      el.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [infinite, itemCount, itemWidth, wheelSpeed, dragSpeed]);

  const goToNext = () => {
    targetPosRef.current = Math.round(targetPosRef.current) + 1;
  };

  const goToPrev = () => {
    targetPosRef.current = Math.round(targetPosRef.current) - 1;
  };

  if (itemCount === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[580px] h-[75vh] flex flex-col items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ perspective: `${perspective}px` }}
    >
      {/* 3D Dolly Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((item, idx) => {
          // Calculate relative distance from camera (float)
          let stepOffset = idx - renderPos;

          if (infinite) {
            // Continuous loop offset wrapping
            const half = itemCount / 2;
            while (stepOffset > half) stepOffset -= itemCount;
            while (stepOffset < -half) stepOffset += itemCount;
          }

          // Beyond visibility ranges, don't render
          if (stepOffset > revealRange || stepOffset < -passRange) {
            return null;
          }

          const isFocused = Math.abs(stepOffset) < 0.4;
          const zDistance = -stepOffset * spacing;

          // Alternate X spread left/right and Y scatter
          const sideSign = (idx % 2 === 0 ? 1 : -1);
          const xPos = sideSign * spread * itemWidth + (isFocused ? pointerOffset.x * parallaxX * itemWidth : 0);
          const yPos = Math.sin(idx * 2.5) * scatter * itemWidth + (isFocused ? pointerOffset.y * parallaxY * itemWidth : 0);

          // Fast scroll dynamics: dynamic tilt and swell pulse
          const dynamicTilt = isFocused ? scrollVelocity * tilt : 0;
          const dynamicPulse = isFocused ? 1 + Math.abs(scrollVelocity) * pulse : 1;

          // Fade out as it moves into deep background or passes behind the camera
          let opacity = 1;
          if (stepOffset > 0) {
            opacity = 1 - Math.min(1, Math.max(0, (stepOffset - (revealRange - 1)) / 1));
          } else {
            opacity = 1 - Math.min(1, Math.max(0, -stepOffset / passRange));
          }

          const scale = dynamicPulse;

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                if (isFocused) {
                  onItemClick?.(item);
                } else {
                  targetPosRef.current = renderPos + stepOffset;
                }
              }}
              style={{
                position: 'absolute',
                width: `${itemWidth}px`,
                height: `${itemWidth}px`,
                transform: `translate3d(${xPos}px, ${yPos}px, ${zDistance}px) rotateX(${-pointerOffset.y * 5}deg) rotateY(${pointerOffset.x * 5}deg) rotateZ(${dynamicTilt}deg) scale(${scale})`,
                opacity: Math.max(0, Math.min(1, opacity)),
                zIndex: Math.round(1000 - Math.abs(stepOffset) * 100),
                transformStyle: 'preserve-3d',
                transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out',
              }}
              className="group flex items-center justify-center cursor-pointer"
            >
              {/* Custom Vinyl Record Styling for product items */}
              <div
                className={`vinyl-spin-wrapper relative w-full h-full rounded-full flex items-center justify-center transition-transform duration-700 ease-out ${
                  isFocused ? 'group-hover:rotate-180 shadow-[0_0_40px_rgba(251,191,36,0.3)]' : ''
                }`}
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(#111, #111 4px, #252525 5px, #111 6px)',
                  boxShadow:
                    'inset 0 0 20px rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.85)',
                }}
              >
                {/* Vinyl Central Label "Яблоко" (42% circle) */}
                <div className="vinyl-label relative w-[42%] h-[42%] rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-amber-400/30">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Spindle hole */}
                  <div className="vinyl-hole absolute w-[12%] h-[12%] rounded-full bg-stone-950 border border-black/50 shadow-inner z-10"></div>
                </div>

                {/* Floating Title Tooltip when hovered or focused */}
                <div
                  className={`absolute -bottom-12 bg-black/90 backdrop-blur-md text-amber-300 border border-amber-400/30 px-5 py-2 rounded-full text-sm font-bold shadow-2xl transition-all duration-300 flex items-center gap-2 pointer-events-none ${
                    isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <Disc
                    className="w-4 h-4 text-amber-400 animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                  <span>{item.name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50 bg-black/70 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-2xl">
        <button
          onClick={goToPrev}
          aria-label="Previous Vinyl"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-stone-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                let diff = idx - getWrappedIndex(targetPosRef.current);
                if (infinite) {
                  const half = itemCount / 2;
                  while (diff > half) diff -= itemCount;
                  while (diff < -half) diff += itemCount;
                }
                targetPosRef.current += diff;
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          aria-label="Next Vinyl"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-stone-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DollyGallery;
