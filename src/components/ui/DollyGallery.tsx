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
  className?: string;
}

export const DollyGallery: React.FC<DollyGalleryProps> = ({
  items,
  onItemClick,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const itemCount = items.length;

  const handleNext = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const handlePrev = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  // Handle wheel scrolling for 3D Dolly feel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;

      isScrolling.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else if (e.deltaY < 0) {
        handlePrev();
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleNext, handlePrev]);

  // Touch swipe support
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) handleNext();
      else handlePrev();
    }
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full min-h-[520px] h-[70vh] flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Depth Canvas */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((item, index) => {
          // Calculate relative position from active item
          let offset = index - activeIndex;

          // Wrap around for continuous loop feel
          if (offset > itemCount / 2) offset -= itemCount;
          if (offset < -itemCount / 2) offset += itemCount;

          const isCurrent = offset === 0;
          const absOffset = Math.abs(offset);

          // Render items within visible range
          if (absOffset > 3) return null;

          const zIndex = 100 - absOffset * 10;
          const translateZ = -absOffset * 280 + (isCurrent ? 50 : 0);
          const translateY = offset * 35;
          const rotateY = offset * -15;
          const rotateX = offset * 8;
          const scale = isCurrent ? 1 : Math.max(0.4, 1 - absOffset * 0.22);
          const opacity = isCurrent ? 1 : Math.max(0.15, 1 - absOffset * 0.35);

          return (
            <motion.div
              key={item.id}
              onClick={() => {
                if (isCurrent) {
                  onItemClick?.(item);
                } else {
                  setActiveIndex(index);
                }
              }}
              animate={{
                y: translateY,
                z: translateZ,
                rotateY,
                rotateX,
                scale,
                opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 28,
                mass: 0.8,
              }}
              style={{
                position: 'absolute',
                zIndex,
                width: '360px',
                height: '360px',
                transformStyle: 'preserve-3d',
              }}
              className="cursor-pointer group flex items-center justify-center"
            >
              {/* Vinyl Record Layout as specified in prompt */}
              <div
                className={`vinyl-spin-wrapper relative w-full h-full rounded-full flex items-center justify-center transition-transform duration-500 ease-out ${
                  isCurrent ? 'group-hover:rotate-180' : ''
                }`}
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(#111, #111 4px, #252525 5px, #111 6px)',
                  boxShadow: isCurrent
                    ? 'inset 0 0 20px rgba(255,255,255,0.25), 0 20px 40px rgba(0,0,0,0.85), 0 0 30px rgba(251,191,36,0.2)'
                    : 'inset 0 0 15px rgba(255,255,255,0.15), 0 10px 20px rgba(0,0,0,0.7)',
                }}
              >
                {/* Vinyl Label ("Яблоко") ~42% */}
                <div className="vinyl-label relative w-[42%] h-[42%] rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-amber-400/30">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Center Hole for Spindle */}
                  <div className="vinyl-hole absolute w-[12%] h-[12%] rounded-full bg-stone-950 border border-black/50 shadow-inner z-10"></div>
                </div>

                {/* Floating Title Tooltip */}
                <div
                  className={`absolute -bottom-12 bg-black/90 backdrop-blur-md text-amber-300 border border-amber-400/30 px-5 py-2 rounded-full text-sm font-bold shadow-xl transition-all duration-300 flex items-center gap-2 pointer-events-none ${
                    isCurrent
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  <Disc
                    className="w-4 h-4 text-amber-400 animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                  <span>{item.name}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls & Scroll Helper */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-2xl">
        <button
          onClick={handlePrev}
          aria-label="Previous Vinyl"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-stone-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
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
          onClick={handleNext}
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
