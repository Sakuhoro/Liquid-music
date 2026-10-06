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
  const [windowHeight, setWindowHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 900
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
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute adaptive card width and height dynamically based on viewport width
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 1024;

  const count = items.length;
  const angleStep = count > 0 ? 360 / count : 0;

  // The stage's perspective magnifies whichever card is at the front: a card
  // pushed `radius` toward the viewer is drawn 1200/(1200-radius) times its
  // real size. That factor is what actually has to fit the screen, so the card
  // is sized against the magnified height rather than its own -- sizing it
  // against its own is what put a 954px card inside a 720px stage on a 13-inch
  // laptop, where it was clipped at the top and bottom.
  const PERSPECTIVE = 1200;

  const effectiveCardWidth = useMemo(() => {
    if (isMobile) return Math.min(Math.round(windowWidth * 0.72), 260);
    if (isTablet) return 360;
    // Capped rather than left to grow: a 50-inch panel is not a reason for a
    // card to become a billboard, and past this the type inside it stops
    // keeping its proportion to the image.
    return Math.min(cardWidth, 440);
  }, [isMobile, isTablet, windowWidth, cardWidth]);

  // Calculate 3D Cylinder Radius based on card width and item count
  const radius = useMemo(() => {
    if (count <= 1) return 0;
    const computedRadius = Math.round((effectiveCardWidth / 2) / Math.tan(Math.PI / count));
    const minRadius = isMobile ? 180 : isTablet ? 300 : 420;
    return Math.max(computedRadius, minRadius);
  }, [effectiveCardWidth, count, isMobile, isTablet]);

  const effectiveCardHeight = useMemo(() => {
    if (isMobile) return Math.min(Math.round(windowWidth * 1.0), 380);
    if (isTablet) return 500;

    // The room the wrapper leaves for the stage, with the stage's own padding
    // taken off, and a little left over so the card is not touching the edge.
    const available = windowHeight * 0.9 - 48;
    const magnification = radius > 0 ? PERSPECTIVE / Math.max(1, PERSPECTIVE - radius) : 1;
    const fitting = Math.floor(available / magnification);
    return Math.max(360, Math.min(620, fitting));
  }, [isMobile, isTablet, windowWidth, windowHeight, radius]);

  // The card's internal scale, off its height rather than off the screen: the
  // full-size card's own numbers, so a fitted-down card is the same picture
  // smaller instead of a different layout. A phone keeps its own sizes, which
  // were chosen against a phone.
  const cardMetrics = useMemo(() => {
    const ratio = effectiveCardHeight / 620;
    const fit = (value: number, floor: number) =>
      Math.round(value * Math.min(1, Math.max(floor, ratio)));
    return {
      padding: `${fit(40, 0.55)}px`,
      titleSize: `${fit(36, 0.62)}px`,
      bodySize: `${fit(12, 0.8)}px`,
      gapPx: fit(20, 0.55),
    };
  }, [effectiveCardHeight]);

  const { padding: cardPadding, titleSize: cardTitleSize, bodySize: cardBodySize } = cardMetrics;
  const cardGap = cardMetrics.gapPx;
  // Vertical padding on the button, kept in step with the gap above it so the
  // space between the copy and the button matches the space the button's own
  // text sits from its edges. Shortened by 10px each side (20px off the button's
  // height) against the earlier padding; the floor keeps the tap target sane on
  // a phone.
  const cardButtonPad = `${Math.max(10, Math.round(cardMetrics.gapPx * 1.4) - 10)}px`;

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
      {/* Deliberately no overlay of its own here. This wrapper fills the screen
          below the header, so a full-bleed tint stops dead at the header's lower
          edge and reads as a seam between two darkening levels. The video and
          its tint already cover header and carousel in one pass; the cards keep
          their own gradients, which is all the contrast they need. */}

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
                  <span
                    className="font-mono uppercase tracking-wider font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/30"
                    style={{ fontSize: cardBodySize }}
                  >
                    {badge}
                  </span>
                  <Disc
                    className={`shrink-0 text-amber-400 ${isActive ? 'animate-spin' : ''}`}
                    style={{
                      width: Math.round(24 * Math.min(1, effectiveCardHeight / 620)),
                      height: Math.round(24 * Math.min(1, effectiveCardHeight / 620)),
                      animationDuration: '8s',
                    }}
                  />
                </div>

                {/* Bottom Card Information. Padding and type ride the card's own
                    size rather than the viewport's, so a card scaled down to fit
                    a 13-inch screen keeps the same proportion between its
                    padding, its title and its image as one left at full size on
                    a 32-inch screen. */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent"
                  style={{ padding: cardPadding }}
                >
                  <h3
                    className="font-serif font-extrabold text-white tracking-tight leading-tight drop-shadow-md"
                    style={{ fontSize: cardTitleSize }}
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p
                      className="text-amber-300/90 font-mono mt-1 font-semibold line-clamp-1"
                      style={{ fontSize: cardBodySize }}
                    >
                      {subtitle}
                    </p>
                  )}
                  {description && (
                    <p
                      className="text-stone-300/90 font-sans mt-2 line-clamp-2 leading-relaxed font-normal"
                      style={{ fontSize: cardBodySize }}
                    >
                      {description}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectItem) onSelectItem(item.id, item);
                    }}
                    style={{ marginTop: cardGap, padding: `${cardButtonPad} 0`, fontSize: cardBodySize, width: 'calc(100% - 60px)' }}
                    className={`mx-auto rounded-xl font-mono uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer min-h-[36px] ${
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
