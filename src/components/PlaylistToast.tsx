import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check } from 'lucide-react';

// Long enough to read and to move a thumb towards, short enough not to sit
// over the shelf if the listener goes straight back to browsing.
const VISIBLE_MS = 2800;

export const PlaylistToast: React.FC = () => {
  const toast = useAppStore((state) => state.playlistToast);
  const dismiss = useAppStore((state) => state.dismissPlaylistToast);

  // Keyed on the id, so adding a second flavour while the first notice is
  // still up restarts the timer for the newer one instead of cutting the
  // first short.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div
      id="playlist-toast"
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-5 sm:pb-8 pointer-events-none"
    >
      <div
        key={toast.id}
        className="hall-toast-in pointer-events-auto flex items-center gap-2.5 pl-3.5 pr-5 py-3 rounded-full border"
        style={{
          background: 'var(--hall-surface)',
          borderColor: 'var(--hall-border-strong)',
          color: 'var(--hall-text)',
          boxShadow: 'var(--hall-shadow)',
          backdropFilter: 'blur(20px)',
          // The hall scale of 1.5 is sized for the drawers, not for a notice
          // pinned to the bottom of a phone. At 1.5 this line renders around
          // 21px and runs past the edge of a 375px screen, so the notice
          // brings its own smaller scale down.
          '--hall-type-scale': 1.2,
        } as React.CSSProperties}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: 'oklch(0.696 0.17 162 / 18%)',
            color: 'oklch(0.79 0.17 162)',
          }}
        >
          <Check className="w-3.5 h-3.5" />
        </span>
        <span className="hall-text-sm font-medium text-balance">
          Композиция добавлена в плейлист
        </span>
      </div>
    </div>
  );
};
