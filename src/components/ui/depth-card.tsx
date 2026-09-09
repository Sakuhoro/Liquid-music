import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface DepthCardLayer {
  image: string;
  depth: number;
}

export interface DepthCardProps {
  image?: string;
  title?: string;
  description?: string;
  width?: number | string;
  height?: number | string;
  maxRotation?: number;
  maxTranslation?: number;
  borderRadius?: string;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  imageAlt?: string;
  disableOnMobile?: boolean;
  ariaLabel?: string;
  layers?: DepthCardLayer[];
  staggerDelay?: number;
  revealAnimation?: 'slide' | 'fade' | 'scale' | 'none';
  respectReducedMotion?: boolean;
  spotlight?: boolean;
  spotlightColor?: string;
  children?: React.ReactNode;
}

export const DepthCard: React.FC<DepthCardProps> = ({
  image,
  title = '',
  description,
  width = '100%',
  height = '100%',
  maxRotation = 18,
  maxTranslation = 15,
  borderRadius = '24px',
  className = '',
  contentClassName = '',
  onClick,
  href,
  target = '_self',
  imageAlt = '',
  disableOnMobile = false,
  ariaLabel,
  layers,
  staggerDelay = 100,
  revealAnimation = 'slide',
  respectReducedMotion = true,
  spotlight = true,
  spotlightColor = 'rgba(255, 255, 255, 0.4)',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      if (disableOnMobile && isMobile) return;

      const rect = cardRef.current.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Mouse position normalized between -1 and 1
      const normX = (mouseX / cardWidth - 0.5) * 2;
      const normY = (mouseY / cardHeight - 0.5) * 2;

      // Calculate tilt rotation
      const rotX = -normY * maxRotation;
      const rotY = normX * maxRotation;

      // Calculate translation
      const transX = normX * maxTranslation;
      const transY = normY * maxTranslation;

      // Spotlight position percentage
      const spotX = (mouseX / cardWidth) * 100;
      const spotY = (mouseY / cardHeight) * 100;

      setRotateX(rotX);
      setRotateY(rotY);
      setTranslateX(transX);
      setTranslateY(transY);
      setSpotlightPos({ x: spotX, y: spotY });
    },
    [maxRotation, maxTranslation, disableOnMobile, isMobile]
  );

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setTranslateX(0);
    setTranslateY(0);
  };

  const Component = href ? 'a' : 'div';
  const componentProps = href
    ? { href, target, rel: target === '_blank' ? 'noopener noreferrer' : undefined }
    : {};

  return (
    <Component
      {...componentProps}
      onClick={onClick}
      aria-label={ariaLabel || title || 'Depth Card'}
      className={`block relative group focus:outline-none select-none cursor-pointer ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        perspective: '1000px',
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full transition-transform duration-200 ease-out overflow-hidden shadow-2xl"
        style={{
          borderRadius,
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Layer 1: Background Base Image or Layers */}
        {layers && layers.length > 0 ? (
          layers.map((layer, idx) => (
            <div
              key={idx}
              className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out"
              style={{
                backgroundImage: `url(${layer.image})`,
                transform: isHovered
                  ? `translate3d(${translateX * layer.depth}px, ${
                      translateY * layer.depth
                    }px, ${layer.depth * 20}px)`
                  : 'translate3d(0, 0, 0)',
              }}
            />
          ))
        ) : image ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-105"
            style={{
              backgroundImage: `url(${image})`,
              transform: isHovered
                ? `translate3d(${translateX * 0.5}px, ${translateY * 0.5}px, 0)`
                : 'translate3d(0, 0, 0)',
            }}
            role={imageAlt ? 'img' : undefined}
            aria-label={imageAlt}
          />
        ) : null}

        {/* Ambient Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* Interactive Spotlight Radial Gradient Effect */}
        {spotlight && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 220px at ${spotlightPos.x}% ${spotlightPos.y}%, ${spotlightColor}, transparent 80%)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Layer Content */}
        <div
          className={`relative z-10 w-full h-full p-6 flex flex-col justify-between transition-transform duration-200 ease-out ${contentClassName}`}
          style={{
            transform: isHovered
              ? `translate3d(${translateX}px, ${translateY}px, 30px)`
              : 'translate3d(0, 0, 0)',
          }}
        >
          {children ? (
            children
          ) : (
            <div className="mt-auto space-y-1.5">
              {title && (
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-stone-200 opacity-90 line-clamp-2 font-medium drop-shadow-sm">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Component>
  );
};
