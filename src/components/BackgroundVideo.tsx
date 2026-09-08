import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const BackgroundVideo: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const activeCollection = useAppStore((state) => state.activeCollection);
  const collectionVideos = useAppStore((state) => state.collectionVideos);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isDark = theme === 'dark';

  // Landing page hero videos (local assets), zoomed to hide generation watermark on the right
  const HERO_VIDEO_LIGHT = '/videos/role-act-as-a-master-animato.mp4';
  const HERO_VIDEO_DARK = '/videos/night-head.mp4';

  // Determine which video to play based on active collection and theme
  const onHero = activeCollection === 'All';
  const heroVideoSrc = isDark ? HERO_VIDEO_DARK : HERO_VIDEO_LIGHT;
  const currentVideoSrc = onHero
    ? heroVideoSrc
    : collectionVideos[activeCollection];

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
        style={
          onHero
            ? { transform: 'scale(1.32)', transformOrigin: '22% 50%' }
            : undefined
        }
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
