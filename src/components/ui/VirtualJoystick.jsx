import React, { useRef, useState, useEffect } from 'react';
import { useProductStore } from '../../store/useProductStore';

export function VirtualJoystick() {
  const setJoystickVector = useProductStore((s) => s.setJoystickVector);
  const [active, setActive] = useState(false);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const maxRadius = 45;

  const handleStart = (clientX, clientY) => {
    if (!containerRef.current) return;
    setActive(true);
    updatePosition(clientX, clientY);
  };

  const handleMove = (clientX, clientY) => {
    if (!active || !containerRef.current) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    setActive(false);
    setTouchPos({ x: 0, y: 0 });
    setJoystickVector({ x: 0, y: 0 });
  };

  const updatePosition = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    let limitedX = dx;
    let limitedY = dy;

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      limitedX = Math.cos(angle) * maxRadius;
      limitedY = Math.sin(angle) * maxRadius;
    }

    setTouchPos({ x: limitedX, y: limitedY });

    // Normalized vector -1.0 to 1.0
    const normX = limitedX / maxRadius;
    const normY = limitedY / maxRadius;

    setJoystickVector({ x: normX, y: normY });
  };

  // Global touch listeners when active
  useEffect(() => {
    const onTouchMove = (e) => {
      if (active && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    if (active) {
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [active]);

  return (
    <div className="absolute bottom-8 left-8 z-30 pointer-events-auto touch-none select-none md:hidden">
      <div
        ref={containerRef}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleMove(e.clientX, e.clientY);
        }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        className="relative w-32 h-32 rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center shadow-2xl"
      >
        {/* Center Ring Indicator */}
        <div className="w-12 h-12 rounded-full border border-white/20" />

        {/* Joystick Thumb Stick */}
        <div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 shadow-lg border-2 border-white/80 transition-transform duration-75"
          style={{
            transform: `translate3d(${touchPos.x}px, ${touchPos.y}px, 0)`,
          }}
        >
          <div className="w-full h-full rounded-full bg-white/20 animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] text-white/60 font-semibold text-center mt-2 uppercase tracking-widest">
        Move Character
      </p>
    </div>
  );
}
