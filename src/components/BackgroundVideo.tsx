import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const BackgroundVideo: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const activeCollection = useAppStore((state) => state.activeCollection);
  const collectionVideos = useAppStore((state) => state.collectionVideos);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isDark = theme === 'dark';

  // Determine which video to play based on active collection and theme
  const currentVideoSrc =
    activeCollection !== 'All'
      ? collectionVideos[activeCollection]
      : isDark
      ? collectionVideos['Permanent 1']
      : collectionVideos['Spring'];

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
