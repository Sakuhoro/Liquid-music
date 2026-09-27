import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CollectionName } from '../types';

// Shown for the hero and for any collection without its own cut.
const HERO_VIDEO_LIGHT = '/videos/role-act-as-a-master-animato.mp4';
const HERO_VIDEO_DARK = '/videos/night-head.mp4';

// Per-collection cuts, keyed by the internal collection id rather than the
// public title, so "Bones of what you Believe" is the 'Permanent 1' key. A
// collection listed with the same file on both sides plays that cut in either
// theme, which is the case for Bones.
const COLLECTION_VIDEOS: Partial<Record<CollectionName, { light: string; dark: string }>> = {
  Summer: { light: '/videos/summer-lite.mp4', dark: '/videos/summer-dark.mp4' },
  Autumn: { light: '/videos/autumn-lite.mp4', dark: '/videos/autumn-dark.mp4' },
  'Permanent 1': { light: '/videos/bones.mp4', dark: '/videos/bones.mp4' },
};

// The clips carry a generation watermark along the right-hand margin, so each
// one is blown up and anchored left of centre to push that margin out of
// frame. Zooming further crops more of the right side; the source resolution
// leaves room for it before the image starts to soften.
const VIDEO_ZOOM = 1.45;
const VIDEO_ORIGIN = '22% 50%';

export const BackgroundVideo: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const activeCollection = useAppStore((state) => state.activeCollection);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isDark = theme === 'dark';

  const collectionCut =
    activeCollection === 'All' ? undefined : COLLECTION_VIDEOS[activeCollection];
  const currentVideoSrc = collectionCut
    ? isDark
      ? collectionCut.dark
      : collectionCut.light
    : isDark
      ? HERO_VIDEO_DARK
      : HERO_VIDEO_LIGHT;

  useEffect(() => {
    const playSafe = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = true;
          await videoRef.current.play();
        } catch (err) {
          // Autoplay handled safely
        }
      }
    };
    playSafe();
  }, [currentVideoSrc]);

  return (
    <div
      id="cinematic-video-stage"
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
    >
      {/* Strictly Clean Cinematic Looping Video - No Character Silhouettes or Floating Notes */}
      <video
        key={currentVideoSrc}
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
        style={{ transform: `scale(${VIDEO_ZOOM})`, transformOrigin: VIDEO_ORIGIN }}
        src={currentVideoSrc}
      />

      {/* Clean, Subtle Atmospheric Contrast Tint to preserve contrast for foreground typography */}
      <div
        className={`absolute inset-0 z-1 pointer-events-none transition-colors duration-1000 ${
          isDark
            ? 'bg-gradient-to-t from-[hsl(201,100%,13%)] via-[hsla(201,100%,13%,0.65)] to-[hsla(201,100%,10%,0.35)]'
            : 'bg-gradient-to-t from-[hsl(204,45%,96%)] via-[hsla(204,45%,96%,0.45)] to-[hsla(204,45%,96%,0.2)]'
        }`}
      />
    </div>
  );
};
