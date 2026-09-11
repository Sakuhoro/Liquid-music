import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Layers, Disc } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  // Calculate scaled offset step based on viewport width (1.5x proportional spacing)
  const offsetStep = windowWidth < 640 ? 270 : windowWidth < 1024 ? 350 : 410;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden bg-transparent text-white select-none z-10 flex flex-col justify-between ${className}`}
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
          <span>Прокрутите или выберите коллекцию</span>
        </div>
      </div>

      {/* Main Skewed Stage - Unskewed container for strict horizontal scroll axis */}
      <div className="relative z-30 flex-1 w-full flex items-center justify-center overflow-hidden py-4">
        <div className="w-full max-w-7xl px-4 flex items-center justify-center relative">

          {/* Card Container: 1.5x Height Scaling (68vh / 75vh / 80vh max-h-[820px]) and 0-y container skew */}
          <div className="relative w-full h-[68vh] sm:h-[75vh] lg:h-[80vh] max-h-[820px] flex items-center justify-center transform-gpu transition-transform duration-500">
            {items.map((item, index) => {
              const diff = index - activeIndex;
              const isActive = index === activeIndex;

              // Compute offset translation along pure X axis (y: 0) with 1.5x scaled step
              const xOffset = diff * offsetStep;
              const scale = isActive ? 1 : 0.82;
              const opacity = isActive ? 1 : Math.max(0.25, 0.65 - Math.abs(diff) * 0.2);
              const zIndex = 30 - Math.abs(diff) * 5;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (isActive) {
                      onSelectItem(item.id);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  animate={{
                    x: xOffset,
                    y: 0, // Flattened Y-displacement (strictly horizontal movement)
                    scale: scale,
                    opacity: opacity,
                    rotateY: diff * -12,
                    zIndex: zIndex,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  // 1.5x Card Width scaling: w-[360px] sm:w-[570px] lg:w-[630px] max-w-[88vw]
                  // -skew-y-3 is applied to card visuals directly to preserve 3D tilt without slanting movement trajectory
                  className={`absolute w-[360px] sm:w-[570px] lg:w-[630px] max-w-[88vw] h-full rounded-3xl overflow-hidden cursor-pointer shadow-2xl border -skew-y-3 transition-colors duration-300 ${
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
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent">
                    <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-amber-300/90 font-mono mt-1.5 font-semibold">
                      {item.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-300/90 font-sans mt-2.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                      }}
                      className={`mt-6 w-full py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
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
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkewedCarousel;
