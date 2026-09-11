import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Disc, Sparkles } from 'lucide-react';

export interface DollyItem {
  id: string | number;
  name: string;
  subtitle?: string;
  description?: string;
  basePrice?: number;
  opusNumber?: string;
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
  itemWidth = 680,
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
  const isPointerDownRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStartClientRef = useRef({ x: 0, y: 0 });
  const dragStartPosRef = useRef(0);

  const [renderPos, setRenderPos] = useState(0);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState<string | number | null>(null);

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
  const activeItem = items[activeIndex];

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

      if (isPointerDownRef.current) {
        const dx = e.clientX - dragStartClientRef.current.x;
        const dy = e.clientY - dragStartClientRef.current.y;

        // Threshold check to distinguish tap/click from drag gesture
        if (!didDragRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          didDragRef.current = true;
          isDraggingRef.current = true;
          try {
            el.setPointerCapture(e.pointerId);
          } catch (_) {}
        }

        if (isDraggingRef.current) {
          const moveDeltaY = dragStartClientRef.current.y - e.clientY;
          const posDelta = (moveDeltaY / (itemWidth * 0.8)) * dragSpeed;
          let next = dragStartPosRef.current + posDelta;
          if (!infinite) {
            next = Math.max(-0.2, Math.min(itemCount - 0.8, next));
          }
          targetPosRef.current = next;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      didDragRef.current = false;
      dragStartClientRef.current = { x: e.clientX, y: e.clientY };
      dragStartPosRef.current = targetPosRef.current;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isPointerDownRef.current = false;
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
      setHoveredItemId(null);
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
      className={`relative w-full flex-1 h-full min-h-[70vh] sm:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
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

          // Dynamic positioning logic for Module 4:
          // xPos >= 0 means vinyl is on the right side -> Popup card floats to the LEFT (-translate-x-full)
          // xPos < 0 means vinyl is on the left side -> Popup card floats to the RIGHT
          const isRightSide = xPos >= 0;

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
          const isMouseHovered = hoveredItemId === item.id;
          const showPopup = isFocused || isMouseHovered;

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!didDragRef.current) {
                  onItemClick?.(item);
                }
              }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
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
              className="group flex items-center justify-center cursor-pointer relative"
            >
              {/* Custom Vinyl Record Styling for product items */}
              <div
                className={`vinyl-spin-wrapper relative w-full h-full rounded-full flex items-center justify-center transition-all duration-700 ease-out group-hover:animate-[spin_10s_linear_infinite] ${
                  isFocused ? 'shadow-[0_0_40px_rgba(251,191,36,0.35)]' : ''
                }`}
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(#111, #111 4px, #252525 5px, #111 6px)',
                  boxShadow:
                    'inset 0 0 20px rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.85)',
                }}
              >
                {/* Vinyl Central Label "Яблоко" (80% circle) */}
                <div className="vinyl-label relative w-[80%] h-[80%] rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-amber-400/30">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Spindle hole */}
                  <div className="vinyl-hole absolute w-[12%] h-[12%] rounded-full bg-stone-950 border border-black/50 shadow-inner z-10"></div>
                </div>
              </div>

              {/* Module 4: DESKTOP Smart Hover Popup Card (Hidden on Mobile md:hidden) */}
              <AnimatePresence>
                {showPopup && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: isRightSide ? 20 : -20,
                      scale: 0.92,
                    }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      x: isRightSide ? 20 : -20,
                      scale: 0.92,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`hidden md:flex flex-col gap-2 absolute top-1/2 -translate-y-1/2 w-80 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl z-50 pointer-events-none ${
                      isRightSide
                        ? 'right-full mr-8 text-right items-end'
                        : 'left-full ml-8 text-left items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.opusNumber || 'Opus Masterwork'}</span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
                      {item.name}
                    </h3>

                    {item.subtitle && (
                      <p className="text-xs font-sans text-amber-300 font-semibold leading-tight">
                        {item.subtitle}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs font-sans text-stone-200/90 leading-relaxed line-clamp-3 mt-1">
                        {item.description}
                      </p>
                    )}

                    {item.basePrice && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono text-stone-400">Стоимость</span>
                        <span className="text-sm font-mono font-bold text-amber-400">
                          {item.basePrice} ₽
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Module 4: MOBILE FIXED BOTTOM SHEET (md:hidden) when a record is focused */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            onClick={() => onItemClick?.(activeItem)}
            className="md:hidden fixed bottom-20 left-4 right-4 z-50 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-400/40 text-white shadow-2xl flex flex-col gap-1.5 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                {activeItem.opusNumber || 'Liquid Music'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {activeItem.basePrice ? `${activeItem.basePrice} ₽` : ''}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white tracking-tight leading-snug">
              {activeItem.name}
            </h3>
            {activeItem.subtitle && (
              <p className="text-xs font-sans text-amber-300/90 line-clamp-1">
                {activeItem.subtitle}
              </p>
            )}
            <p className="text-[11px] font-sans text-stone-300 line-clamp-2 mt-0.5">
              {activeItem.description}
            </p>
            <div className="mt-1 text-[10px] font-mono text-amber-400 underline font-bold">
              Нажмите, чтобы просмотреть подробнее →
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
