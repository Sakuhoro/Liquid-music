import React, { useEffect, useMemo, useRef } from 'react';
import './InfiniteSpiral.css';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};
// How far the finger or the cursor may travel between press and release before
// the gesture counts as a drag rather than a tap. Above it the root swallows the
// click that ends the gesture (so a fling does not open a story); below it the
// click goes through to the card. The gap is a real wrist's jitter (~2-4px) but
// nowhere near the start of a deliberate drag.
const TAP_DRAG_THRESHOLD = 8;

export interface SpiralItem {
  src: string;
  alt?: string;
  href?: string;
  target?: string;
  label?: string;
  id?: string;
}

export type SpiralAnimationMode = 'auto' | 'drag' | 'scroll' | 'all';

export interface InfiniteSpiralProps {
  items: (string | SpiralItem)[];
  speed?: number;
  direction?: 'up' | 'down';
  animationMode?: SpiralAnimationMode;
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  perspective?: number;
  cardsPerTurn?: number;
  rotation?: number;
  cardTilt?: number;
  cardRadius?: number;
  centerScale?: number;
  edgeFade?: number;
  edgeBlur?: number;
  pauseOnHover?: boolean;
  imageFit?: 'cover' | 'contain';
  grayscale?: number;
  className?: string;
  /**
   * Called with the index of the tapped card. Left out, the cards are plain
   * pictures: the root already swallows a click that ended a drag, so a handler
   * here fires on a tap and not on the pointer-up of a fling.
   */
  onSelectItem?: (index: number) => void;
}

export function InfiniteSpiral({
  items = [],
  speed = 0.55,
  direction = 'up',
  animationMode = 'auto',
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  imageFit = 'cover',
  grayscale = 0,
  className = '',
  onSelectItem
}: InfiniteSpiralProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | HTMLAnchorElement | null>>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  // Where the pointer was when the press started, so a drag is measured from the
  // press rather than between two moves: an absolute root means the threshold is
  // cumulative, and a tap with a few stray pixels never crosses it.
  const pressStartYRef = useRef(0);
  const dragMovedRef = useRef(false);

  const normalizedItems = useMemo(
    () =>
      items.map((item, index) =>
        typeof item === 'string'
          ? { src: item, alt: `Spiral image ${index + 1}` }
          : { alt: `Spiral image ${index + 1}`, ...item }
      ),
    [items]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || normalizedItems.length === 0) return undefined;

    let frameId = 0;
    let previousTime = performance.now();
    let bounds = root.getBoundingClientRect();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrollEnabled = animationMode === 'scroll' || animationMode === 'all';
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    let lastScrollY = window.scrollY;

    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect();
    });
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(root);

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visibleRef.current || scrollDelta === 0) return;
      targetProgressRef.current += clamp(
        (scrollDelta * scrollSpeedMultiplier) / Math.max(verticalSpacing * 2, 1),
        -1.5,
        1.5
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const autoEnabled = animationMode === 'auto' || animationMode === 'all';
      const motionPaused = draggingRef.current || (pauseOnHover && hoveredRef.current);
      const directionMultiplier = direction === 'down' ? -1 : 1;
      const desiredAutoSpeed =
        autoEnabled && visibleRef.current && !reducedMotion.matches && !motionPaused
          ? speed * directionMultiplier
          : 0;
      const speedBlend = 1 - Math.exp(-delta * 7);
      autoSpeedRef.current += (desiredAutoSpeed - autoSpeedRef.current) * speedBlend;
      targetProgressRef.current += autoSpeedRef.current * delta;

      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 22 : 11));
      progressRef.current += (targetProgressRef.current - progressRef.current) * followBlend;

      const count = normalizedItems.length;
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const baseFit = Math.min(1, width / (cardWidth * 2.8), height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, width * 0.36)) * baseFit;
      // Layout width is not the drawn width: a frame near the front of the
      // helix is scaled up by centerScale and by perspective, so it can be well
      // over cardWidth across. Fitting on the layout box alone let those frames
      // spill past the stage on a narrow viewport, so the shrink is taken
      // against the widest frame that can reach the edge.
      const drawnHalfWidth = (cardWidth * centerScale * 1.3) / 2;
      const fit = Math.min(baseFit, width / Math.max((responsiveRadius + drawnHalfWidth) * 2, 1));
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        let offset = index - progressRef.current;
        offset = modulo(offset + half, count) - half;

        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + rotation;
        const angleRadians = (angle * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const visualScale = scale * depthScale;
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(0.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${visualScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    normalizedItems,
    speed,
    direction,
    animationMode,
    radius,
    perspective,
    cardWidth,
    cardHeight,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    cardTilt,
    centerScale,
    edgeFade,
    edgeBlur,
    pauseOnHover
  ]);

  const dragEnabled = animationMode === 'drag' || animationMode === 'all';

  // The drag axis here is vertical, so claiming 'pan-x' (as the upstream copy
  // does) would let the browser own vertical pans and leave a tall page
  // unscrollable wherever the finger lands on the spiral. 'pan-y' hands the
  // vertical pan back to the page; dragging the spiral on a touch screen is
  // therefore not possible, and scroll-driven travel covers it instead.
  const touchAction = 'pan-y';

  const rootStyle: React.CSSProperties = {
    perspective: `${perspective}px`,
    '--infinite-spiral-card-width': `${cardWidth}px`,
    '--infinite-spiral-card-height': `${cardHeight}px`,
    '--infinite-spiral-card-radius': `${cardRadius}px`,
    cursor: dragEnabled ? 'grab' : 'default',
    touchAction,
    userSelect: dragEnabled ? 'none' : 'auto'
  } as React.CSSProperties;

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default';
  };

  return (
    <div
      ref={rootRef}
      className={`infinite-spiral ${className}`.trim()}
      style={rootStyle}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={(event) => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerYRef.current = event.clientY;
        pressStartYRef.current = event.clientY;
        targetProgressRef.current = progressRef.current;
        event.currentTarget.style.cursor = 'grabbing';
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const pointerDelta = event.clientY - lastPointerYRef.current;
        lastPointerYRef.current = event.clientY;
        if (Math.abs(event.clientY - pressStartYRef.current) > TAP_DRAG_THRESHOLD) {
          dragMovedRef.current = true;
          // The gesture is a drag, not a tap: take the pointer now so it keeps
          // scrubbing even when it leaves the helix, and so the click that ends
          // the gesture is aimed at this root and swallowed. A tap never captures,
          // which is what lets its click reach the card -- pointer capture at
          // press time retargets the whole gesture's click to the captured
          // element, which is how a resting hand used to lose every story.
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* capture is best effort */
            }
          }
        }
        targetProgressRef.current -= pointerDelta / Math.max(verticalSpacing, 1);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={(event) => {
        // A cancel (a touch scroll taking the gesture, say) is never followed by
        // a click, so the click that would have reset the drag mark is not
        // coming: clear it here rather than let the next tap be swallowed by
        // somebody else's abandoned gesture.
        stopDragging(event);
        dragMovedRef.current = false;
      }}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <div className="infinite-spiral__stage" role="list" aria-label="Infinite spiral gallery">
        {normalizedItems.map((item, index) => {
          const Card = item.href ? 'a' : 'div';
          // A card that opens something stops being a picture and starts being a
          // control, so it takes the role, the tab stop and the pointer with it.
          // A card that is still decoration is left exactly as it was.
          const isSelectable = typeof onSelectItem === 'function' && !item.href;
          return (
            <Card
              key={item.id ?? `${item.src}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={`infinite-spiral__item${isSelectable ? ' infinite-spiral__item--selectable' : ''}`}
              style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }}
              href={item.href}
              target={item.target}
              rel={item.target === '_blank' ? 'noreferrer' : undefined}
              role={isSelectable ? 'button' : 'listitem'}
              tabIndex={isSelectable ? 0 : undefined}
              data-spiral-index={isSelectable ? index : undefined}
              onClick={
                isSelectable
                  ? (event: React.MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      onSelectItem(index);
                    }
                  : undefined
              }
              onKeyDown={
                isSelectable
                  ? (event: React.KeyboardEvent<HTMLElement>) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onSelectItem(index);
                    }
                  : undefined
              }
              aria-label={item.label ?? item.alt}
            >
              <img
                className="infinite-spiral__image"
                src={item.src}
                alt={item.alt}
                loading={index < 6 ? 'eager' : 'lazy'}
                draggable={false}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: imageFit,
                  filter: `grayscale(${Math.min(1, Math.max(0, grayscale))})`
                }}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default InfiniteSpiral;
