import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Disc } from 'lucide-react';

export interface SkewedCarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  color: string;
  alt?: string;
}

interface SkewedCarouselProps {
  items: SkewedCarouselItem[];
  onSelectItem?: (id: string) => void;
  className?: string;
  /**
   * 'overlay' pins the carousel to the viewport and gives it a stage of its
   * own, the way the collection overview uses it. 'inline' makes it fill the
   * space it is handed inside a page instead.
   */
  layout?: 'overlay' | 'inline';
  /**
   * 'hijack' turns the wheel into carousel navigation, which is right for a
   * fullscreen sheet but would trap scrolling on a page. 'pass' leaves the
   * wheel alone and drags only.
   */
  scrollMode?: 'hijack' | 'pass';
  /** Arrow keys are listened for on window; turn off when something else owns the keys. */
  keyboardNav?: boolean;
  /** Overview art is tall, gallery artwork is square. */
  cardAspect?: 'portrait' | 'square';
  showHeader?: boolean;
  showFooter?: boolean;
  showCta?: boolean;
  /** Noun for the footer counter. */
  itemNoun?: string;
}

export const SkewedCarousel: React.FC<SkewedCarouselProps> = ({
  items,
  onSelectItem,
  className = '',
  layout = 'overlay',
  scrollMode = 'hijack',
  keyboardNav = true,
  cardAspect = 'portrait',
  showHeader = true,
  showFooter = true,
  showCta = true,
  itemNoun = 'Коллекция',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef(0);
  const currentPosRef = useRef(0);
  const velocityRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const touchPosStartRef = useRef(0);
  const isSwipingRef = useRef(false);

  const [renderPos, setRenderPos] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: performance.now(),
    };
    touchPosStartRef.current = targetPosRef.current;
    isSwipingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    const dx = touchStartRef.current.x - e.touches[0].clientX;
    const dy = touchStartRef.current.y - e.touches[0].clientY;

    // Prevent high friction during drag preview while keeping movement smooth
    if (Math.abs(dx) > Math.abs(dy)) {
      const dragSensitivity = windowWidth < 640 ? 300 : 450;
      const stepDelta = dx / dragSensitivity;
      const maxIndex = Math.max(0, items.length - 1);
      targetPosRef.current = Math.max(0, Math.min(maxIndex, touchPosStartRef.current + stepDelta));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;

    const touchEnd = e.changedTouches[0];
    const dx = touchStartRef.current.x - touchEnd.clientX;
    const dy = touchStartRef.current.y - touchEnd.clientY;
    const dt = Math.max(1, performance.now() - touchStartRef.current.time);
    const velocity = Math.abs(dx) / dt; // px / ms

    const maxIndex = Math.max(0, items.length - 1);
    const startIndex = Math.round(touchPosStartRef.current);

    // One-Swipe = One-Card Snapping Logic:
    // If swipe distance > 40px or flick velocity > 0.35 px/ms, move strictly 1 card forward or backward
    if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 40 || velocity > 0.35)) {
      if (dx > 0) {
        // Swipe left -> Next card (+1)
        targetPosRef.current = Math.min(maxIndex, startIndex + 1);
      } else {
        // Swipe right -> Previous card (-1)
        targetPosRef.current = Math.max(0, startIndex - 1);
      }
    } else {
      // Snap back to nearest single card center
      targetPosRef.current = Math.max(0, Math.min(maxIndex, Math.round(targetPosRef.current)));
    }
  };

  // Main physics loop (Spring dynamics for natural stopping effect)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Spring physics simulation (stiffness: 180, damping: 22)
      const stiffness = 180;
      const damping = 22;

      const displacement = currentPosRef.current - targetPosRef.current;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * velocityRef.current;
      const acceleration = springForce + dampingForce;

      velocityRef.current += acceleration * dt;
      currentPosRef.current += velocityRef.current * dt;

      // Snap to exact target when velocity and displacement are negligible
      if (Math.abs(velocityRef.current) < 0.001 && Math.abs(displacement) < 0.001) {
        currentPosRef.current = targetPosRef.current;
        velocityRef.current = 0;
      }

      setRenderPos(currentPosRef.current);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Wheel event hijacking with e.preventDefault() & smooth position targeting
  useEffect(() => {
    if (scrollMode !== 'hijack') return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scroll down (deltaY > 0) moves forward (increases target index step)
      // Scroll up (deltaY < 0) moves backward (decreases target index step)
      const speed = 0.0025;
      const delta = e.deltaY * speed;
      const maxIndex = Math.max(0, items.length - 1);
      targetPosRef.current = Math.max(0, Math.min(maxIndex, targetPosRef.current + delta));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [items.length, scrollMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNav) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const maxIndex = Math.max(0, items.length - 1);
      if (e.key === 'ArrowLeft') {
        targetPosRef.current = Math.max(0, Math.round(targetPosRef.current) - 1);
      }
      if (e.key === 'ArrowRight') {
        targetPosRef.current = Math.min(maxIndex, Math.round(targetPosRef.current) + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, keyboardNav]);

  const isSquare = cardAspect === 'square';

  // A square card is sized from its own width so the artwork is never cropped.
  const squareSize = Math.min(
    windowWidth < 640 ? 260 : windowWidth < 1024 ? 400 : 520,
    Math.round(windowWidth * 0.82)
  );

  // Calculate scaled offset step based on viewport width (minimal gap on mobile viewports)
  const offsetStep = isSquare
    ? Math.round(squareSize * 0.58)
    : windowWidth < 640
      ? Math.min(windowWidth * 0.42, 160)
      : windowWidth < 1024
        ? 350
        : 410;
  const activeIndex = Math.max(0, Math.min(items.length - 1, Math.round(renderPos)));

  const stageClasses = isSquare
    ? 'relative w-full flex items-center justify-center'
    : 'relative w-full h-[68vh] sm:h-[75vh] lg:h-[80vh] max-h-[820px] flex items-center justify-center transform-gpu transition-transform duration-500';

  const cardSizeClasses = isSquare
    ? 'w-full'
    : 'w-[250px] xs:w-[280px] sm:w-[520px] lg:w-[630px] max-w-[80vw]';

  return (
    <div
      ref={containerRef}
      data-carousel="skewed"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={
        layout === 'overlay'
          ? `fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden bg-transparent text-white select-none z-10 flex flex-col justify-between touch-pan-y ${className}`
          : `relative w-full m-0 p-0 overflow-hidden bg-transparent text-white select-none flex flex-col touch-pan-y ${className}`
      }
      style={{ margin: 0, padding: 0 }}
    >
      {/* Subtle translucent ambient contrast overlays (keeps background video crystal clear) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none z-0" />

      {/* Skewed Carousel Header */}
      {showHeader && (
        <div className="relative z-30 pt-8 px-8 sm:px-12 flex items-center justify-between border-b border-white/10 pb-6 backdrop-blur-md bg-black/25">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              Коллекции Liquid Music
            </h1>
          </div>
        </div>
      )}

      {/* Main Skewed Stage - Unskewed container for strict horizontal scroll axis */}
      <div className="relative z-30 flex-1 w-full flex items-center justify-center overflow-hidden py-4">
        <div className="w-full max-w-7xl px-4 flex items-center justify-center relative">

          {/* Card Container: 1.5x Height Scaling (68vh / 75vh / 80vh max-h-[820px]) and 0-y container skew */}
          <div className={stageClasses} style={isSquare ? { height: squareSize } : undefined}>
            {items.map((item, index) => {
              const diff = index - renderPos;
              const absDiff = Math.abs(diff);
              const isActive = index === activeIndex;

              // Compute offset translation along pure X axis (y: 0) with 1.5x scaled step
              const xOffset = diff * offsetStep;
              const scale = Math.max(0.75, 1 - absDiff * 0.18);
              const opacity = Math.max(0.2, 1 - absDiff * 0.35);
              const zIndex = Math.round(30 - absDiff * 5);
              const rotateY = diff * -12;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (isActive) {
                      onSelectItem?.(item.id);
                    } else {
                      targetPosRef.current = index;
                    }
                  }}
                  animate={{
                    x: xOffset,
                    y: 0, // Flattened Y-displacement (strictly horizontal movement)
                    scale: scale,
                    opacity: opacity,
                    rotateY: rotateY,
                    zIndex: zIndex,
                  }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                  // -skew-y-3 is applied to card visuals directly to preserve 3D tilt without slanting movement trajectory
                  className={`absolute ${cardSizeClasses} ${
                    isSquare ? '' : 'h-full'
                  } rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-2xl border -skew-y-2 sm:-skew-y-3 transition-colors duration-300 ${
                    isActive
                      ? 'border-amber-400/80 shadow-amber-500/20 shadow-2xl ring-2 ring-amber-400/50'
                      : 'border-white/15 hover:border-white/40'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    ...(isSquare ? { width: squareSize, height: squareSize } : {}),
                  }}
                >
                  {/* Card Background Image */}
                  <img
                    src={item.image}
                    alt={item.alt ?? item.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center gap-3 z-10">
                    <span className="text-[0.8125rem] sm:text-[1.125rem] font-mono uppercase tracking-wide sm:tracking-widest font-bold px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                    <Disc className={`w-6 h-6 shrink-0 text-amber-400 ${isActive ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                  </div>

                  {/* Bottom Content - Scaled padding and typography for 1.5x cards */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 lg:p-12 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent">
                    <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-amber-300/90 font-mono mt-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {showCta && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem?.(item.id);
                        }}
                        className={`mt-4 sm:mt-6 w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                          isActive
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/30'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        <span>Открыть коллекцию</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Footer Navigation Controls */}
      {showFooter && (
        <div className="relative z-30 pb-8 px-8 flex items-center justify-between border-t border-white/10 pt-4 backdrop-blur-md bg-black/30">
          <div className="text-xs font-mono text-stone-300">
            {itemNoun} <span className="text-amber-400 font-bold">{activeIndex + 1}</span> из{' '}
            <span className="text-stone-200">{items.length}</span>
          </div>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  targetPosRef.current = idx;
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/50'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkewedCarousel;
