import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Disc } from 'lucide-react';
import './CollectionCarousel.css';

export interface CollectionCarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  src?: string;
  alt?: string;
  badge?: string;
  color?: string;
  [key: string]: any;
}

export interface CollectionCarouselProps {
  items: CollectionCarouselItem[];
  preset?: 'cylinder' | string;
  cardWidth?: number;
  containerHeight?: string;
  onSelectItem?: (id: string, item: CollectionCarouselItem) => void;
  className?: string;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
  items = [],
  preset = 'cylinder',
  cardWidth = 440,
  containerHeight = 'min-h-[90vh]',
  onSelectItem,
  className = '',
  autoplay = false,
  autoplaySpeed = 4000,
}) => {
  const [rotation, setRotation] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const rotationStartRef = useRef<number>(0);
  const dragDistanceXRef = useRef<number>(0);

  // Memoize sources key to prevent image re-fetching and flickering loops
  const sourcesKey = useMemo(
    () => items.map((item) => item.src || item.image || '').join('|'),
    [items]
  );

  // Preload images safely without race conditions or resetting state during re-renders
  useEffect(() => {
    const sources = items.map((item) => item.src || item.image || '').filter(Boolean);

    if (sources.length === 0) {
      return;
    }

    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [sourcesKey]);

  // Handle window resize for adaptive responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute adaptive card width and height dynamically based on viewport width
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 1024;

  const effectiveCardWidth = useMemo(() => {
    if (isMobile) return Math.min(Math.round(windowWidth * 0.72), 260);
    if (isTablet) return 360;
    return cardWidth; // 440px for desktop (2x scaled)
  }, [isMobile, isTablet, windowWidth, cardWidth]);

  const effectiveCardHeight = useMemo(() => {
    if (isMobile) return Math.min(Math.round(windowWidth * 1.0), 380);
    if (isTablet) return 500;
    return 620; // Scaled height for 2x desktop cards
  }, [isMobile, isTablet, windowWidth]);

  const count = items.length;
  const angleStep = count > 0 ? 360 / count : 0;

  // Calculate 3D Cylinder Radius based on card width and item count
  const radius = useMemo(() => {
    if (count <= 1) return 0;
    const computedRadius = Math.round((effectiveCardWidth / 2) / Math.tan(Math.PI / count));
    const minRadius = isMobile ? 180 : isTablet ? 300 : 420;
    return Math.max(computedRadius, minRadius);
  }, [effectiveCardWidth, count, isMobile, isTablet]);

  // Autoplay handler
  useEffect(() => {
    if (!autoplay || count <= 1 || isDraggingRef.current) return;
    const interval = setInterval(() => {
      setRotation((prev) => prev - angleStep);
    }, autoplaySpeed);
    return () => clearInterval(interval);
  }, [autoplay, count, angleStep, autoplaySpeed]);

  // Dragging event handlers (Mouse + Touch)
  const handleDragStart = useCallback(
    (clientX: number) => {
      isDraggingRef.current = true;
      dragStartXRef.current = clientX;
      rotationStartRef.current = rotation;
      dragDistanceXRef.current = 0;
    },
    [rotation]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - dragStartXRef.current;
      dragDistanceXRef.current = dx;
      const dragSensitivity = isMobile ? 0.35 : 0.25;
      setRotation(rotationStartRef.current + dx * dragSensitivity);
    },
    [isMobile]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    // Snap to nearest item index
    if (angleStep > 0) {
      const nearestIndex = Math.round(-rotation / angleStep);
      setRotation(-nearestIndex * angleStep);
    }
  }, [rotation, angleStep]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Active item index calculation
  const normalizedRotation = ((-rotation % 360) + 360) % 360;
  const activeIndex =
    count > 0 ? Math.round(normalizedRotation / angleStep) % count : 0;

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`collection-carousel-wrapper ${containerHeight} ${className}`}
    >
      {/* Translucent background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none z-0" />

      {/* Main 3D Cylinder Stage */}
      <div className="collection-carousel-stage z-10 my-auto">
        <div className="collection-carousel-cylinder">
          {items.map((item, index) => {
            const itemAngle = index * angleStep + rotation;
            const rad = (itemAngle * Math.PI) / 180;

            // Cosine of angle gives z-depth relative to center
            const cosVal = Math.cos(rad);
            const isActive = index === activeIndex;

            // Normalize angle for opacity & visibility
            const angleFromFront = Math.abs((((itemAngle % 360) + 540) % 360) - 180);
            const opacity = Math.max(0.2, Math.min(1, 1 - angleFromFront / 120));
            const imgSrc = item.src || item.image || '';
            const title = item.title || item.name || '';
            const subtitle = item.subtitle || '';
            const description = item.description || '';
            const badge = item.badge || 'Коллекция';

            return (
              <div
                key={item.id || index}
                onClick={(e) => {
                  // Prevent click when dragging
                  if (Math.abs(dragDistanceXRef.current) > 10) return;
                  if (isActive) {
                    if (onSelectItem) onSelectItem(item.id, item);
                  } else {
                    setRotation(-index * angleStep);
                  }
                }}
                className={`collection-carousel-card border ${
                  isActive
                    ? 'border-amber-400/90 shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/50'
                    : 'border-white/15 hover:border-white/40'
                }`}
                style={{
                  width: `${effectiveCardWidth}px`,
                  height: `${effectiveCardHeight}px`,
                  transform: `translate(-50%, -50%) rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  opacity: opacity,
                  zIndex: Math.round((cosVal + 1) * 100),
                }}
              >
                {/* Background Image */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={item.alt || title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 pointer-events-none"
                  />
                )}

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3 sm:top-5 left-3 sm:left-5 right-3 sm:right-5 flex justify-between items-center gap-2 z-10 pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/30">
                    {badge}
                  </span>
                  <Disc
                    className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-amber-400 ${
                      isActive ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '8s' }}
                  />
                </div>

                {/* Bottom Card Information */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-10 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent">
                  <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[10px] sm:text-xs text-amber-300/90 font-mono mt-1 font-semibold line-clamp-1">
                      {subtitle}
                    </p>
                  )}
                  {description && (
                    <p className="text-[10px] sm:text-xs text-stone-300/90 font-sans mt-2 line-clamp-2 leading-relaxed font-normal">
                      {description}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectItem) onSelectItem(item.id, item);
                    }}
                    className={`mt-3 sm:mt-5 w-full py-2.5 sm:py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer min-h-[40px] sm:min-h-[44px] ${
                      isActive
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <span>Открыть коллекцию</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionCarousel;
