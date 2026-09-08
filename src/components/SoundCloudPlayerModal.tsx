import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Radio, ExternalLink, Play } from 'lucide-react';

export const SoundCloudPlayerModal: React.FC = () => {
  const isSoundCloudOpen = useAppStore((state) => state.isSoundCloudOpen);
  const setIsSoundCloudOpen = useAppStore((state) => state.setIsSoundCloudOpen);
  const soundCloudUrl = useAppStore((state) => state.soundCloudUrl);
  const theme = useAppStore((state) => state.theme);

  if (!isSoundCloudOpen) return null;

  const isDark = theme === 'dark';

  // Construct SoundCloud standard embed URL
  const encodedUrl = encodeURIComponent(soundCloudUrl);
  const embedSrc = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;

  return (
    <div
      id="soundcloud-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSoundCloudOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise cursor-pointer"
    >
      <div
        id="soundcloud-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-7 backdrop-blur-2xl cursor-default ${
          isDark
            ? 'bg-[rgba(7,24,38,0.96)] border-white/20 text-stone-100'
            : 'bg-white/95 border-slate-300 text-slate-900'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsSoundCloudOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-normal leading-tight">
              SoundCloud Melodic Stream
            </h3>
            <p className="text-xs opacity-60 flex items-center gap-1.5 font-mono">
              <span>Synchronized Studio Audio</span>
              <span>•</span>
              <a
                href={soundCloudUrl}
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* SoundCloud Player Embed */}
        <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-inner my-2">
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedSrc}
            title="SoundCloud Player"
            className="w-full"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] font-mono opacity-60 pt-2 border-t border-white/10">
          <span>Configured via Studio Director Admin Console</span>
          <button
            onClick={() => setIsSoundCloudOpen(false)}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
