import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, Disc } from 'lucide-react';

export interface SkewedCarouselItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  color: string;
}

interface SkewedCarouselProps {
  items: SkewedCarouselItem[];
  onSelectItem: (id: string) => void;
  className?: string;
}

export const SkewedCarousel: React.FC<SkewedCarouselProps> = ({
  items,
  onSelectItem,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef(0);
  const currentPosRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchPosStartRef = useRef(0);

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
    };
    touchPosStartRef.current = targetPosRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = touchStartRef.current.x - e.touches[0].clientX;
    const dy = touchStartRef.current.y - e.touches[0].clientY;

    if (Math.abs(dx) > Math.abs(dy)) {
      const sensitivity = windowWidth < 640 ? 250 : 400;
      const stepDelta = dx / sensitivity;
      const maxIndex = Math.max(0, items.length - 1);
      targetPosRef.current = Math.max(0, Math.min(maxIndex, touchPosStartRef.current + stepDelta));
    }
  };

  // Main physics loop (Lerp damping)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth pos damping towards targetPosRef
      const diff = targetPosRef.current - currentPosRef.current;
      const easing = 1 - Math.pow(1 - 0.85, dt * 60);
      currentPosRef.current += diff * easing;

      setRenderPos(currentPosRef.current);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Wheel event hijacking with e.preventDefault() & smooth position targeting
  useEffect(() => {
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
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
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
  }, [items.length]);

  // Calculate scaled offset step based on viewport width (1.5x proportional spacing)
  const offsetStep = windowWidth < 640 ? 270 : windowWidth < 1024 ? 350 : 410;
  const activeIndex = Math.max(0, Math.min(items.length - 1, Math.round(renderPos)));

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden bg-transparent text-white select-none z-10 flex flex-col justify-between touch-pan-y ${className}`}
      style={{ margin: 0, padding: 0 }}
    >
      {/* Subtle translucent ambient contrast overlays (keeps background video crystal clear) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none z-0" />

      {/* Skewed Carousel Header */}
      <div className="relative z-30 pt-8 px-8 sm:px-12 flex items-center justify-between border-b border-white/10 pb-6 backdrop-blur-md bg-black/25">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Skewed Carousel</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Коллекции Liquid Music
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-stone-300">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Прокрутите колесиком или выберите коллекцию</span>
        </div>
      </div>

      {/* Main Skewed Stage - Unskewed container for strict horizontal scroll axis */}
      <div className="relative z-30 flex-1 w-full flex items-center justify-center overflow-hidden py-4">
        <div className="w-full max-w-7xl px-4 flex items-center justify-center relative">

          {/* Card Container: 1.5x Height Scaling (68vh / 75vh / 80vh max-h-[820px]) and 0-y container skew */}
          <div className="relative w-full h-[68vh] sm:h-[75vh] lg:h-[80vh] max-h-[820px] flex items-center justify-center transform-gpu transition-transform duration-500">
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
                      onSelectItem(item.id);
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
                  // 1.5x Card Width scaling: w-[360px] sm:w-[570px] lg:w-[630px] max-w-[88vw]
                  // -skew-y-3 is applied to card visuals directly to preserve 3D tilt without slanting movement trajectory
                  className={`absolute w-[280px] xs:w-[320px] sm:w-[520px] lg:w-[630px] max-w-[85vw] h-full rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-2xl border -skew-y-2 sm:-skew-y-3 transition-colors duration-300 ${
                    isActive
                      ? 'border-amber-400/80 shadow-amber-500/20 shadow-2xl ring-2 ring-amber-400/50'
                      : 'border-white/15 hover:border-white/40'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Card Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                    <Disc className={`w-6 h-6 text-amber-400 ${isActive ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                  </div>

                  {/* Bottom Content - Scaled padding and typography for 1.5x cards */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 lg:p-12 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent">
                    <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-base text-amber-300/90 font-mono mt-1 font-semibold">
                      {item.subtitle}
                    </p>
                    <p className="text-[11px] sm:text-sm text-stone-300/90 font-sans mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                      }}
                      className={`mt-4 sm:mt-6 w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                        isActive
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/30'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      <span>Открыть коллекцию</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Footer Navigation Controls */}
      <div className="relative z-30 pb-8 px-8 flex items-center justify-between border-t border-white/10 pt-4 backdrop-blur-md bg-black/30">
        <div className="text-xs font-mono text-stone-300">
          Коллекция <span className="text-amber-400 font-bold">{activeIndex + 1}</span> из{' '}
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
    </div>
  );
};

export default SkewedCarousel;
