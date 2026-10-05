import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VolumeType, NicotineType } from '../types';
import { calculatePrice, VOLUME_PRICING, NICOTINE_PRICING } from '../data/products';
import { sanitizeRussianText } from '../utils/sanitizeText';
import {
  X,
  Volume2,
  Pause,
  Play,
  Check,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useTrackPreview } from '../hooks/useTrackPreview';

/**
 * Module 3: Premium Grade Apple/Stripe Design Refactoring
 * - Commercial standard typography (`font-sans antialiased`), high contrast and clarity.
 * - `tracking-tight` for large headers, clean description text.
 * - Removed `Physical Release Edition` completely.
 * - Minimalist CTA button (`В плейлист` / `В плейлисте`) with STRICTLY NO plus icon and NO price inside.
 */

/**
 * Sanitizes product title string by forcibly stripping musical artifact prefixes/suffixes
 * such as "Spring op 4", "Spring Op.", "Op. 4", "Op 4", "Spring", etc.
 */
export function sanitizeTitle(title: string): string {
  if (!title) return '';
  return title
    // Strip leading "Spring op 4", "Spring Op. 4", "Spring", "Op. 4", "Op 4", etc.
    .replace(/^(?:Spring\s*(?:op\.?|opus)?\s*\d*|\bop\.?\s*\d+)\s*[-:]?\s*/gi, '')
    // Strip trailing "Op. 4", "Op 4", "Spring op 4", etc.
    .replace(/\s*[-:]?\s*(?:Spring\s*(?:op\.?|opus)?\s*\d*|\bop\.?\s*\d+)$/gi, '')
    .replace(/^[\s\-:]+/, '')
    .replace(/[\s\-:]+$/, '')
    .trim();
}

import { CollectionName } from '../types';

export const ProductDetailModal: React.FC = () => {
  const inspectedProduct = useAppStore((state) => state.inspectedProduct);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const addToCart = useAppStore((state) => state.addToCart);
  const isCollectionArchived = useAppStore((state) => state.isCollectionArchived);
  const theme = useAppStore((state) => state.theme);

  const [selectedVolume, setSelectedVolume] = useState<VolumeType>('30ml');
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('0mg');
  const [isAdded, setIsAdded] = useState(false);

  const audioFile = inspectedProduct?.audioFile ?? null;
  const { audioRef, status, isPlaying, hasTrack, toggle, handlers } = useTrackPreview(audioFile);
  const setIsTrackPreviewPlaying = useAppStore((state) => state.setIsTrackPreviewPlaying);

  useEffect(() => {
    setSelectedVolume('30ml');
    setSelectedNicotine('0mg');
    setIsAdded(false);
  }, [inspectedProduct]);

  // Keep the ambient music ducked for exactly as long as the preview is audible.
  useEffect(() => {
    setIsTrackPreviewPlaying(isPlaying);
    return () => setIsTrackPreviewPlaying(false);
  }, [isPlaying, setIsTrackPreviewPlaying]);

  if (!inspectedProduct) return null;

  const isDark = theme === 'dark';

  const volPrice = VOLUME_PRICING[selectedVolume];
  const nicPrice = NICOTINE_PRICING[selectedNicotine];
  const totalPrice = calculatePrice(selectedVolume, selectedNicotine);
  const isArchived = isCollectionArchived(inspectedProduct.category as CollectionName);

  const handleAdd = () => {
    if (isArchived) return;
    addToCart(inspectedProduct, selectedVolume, selectedNicotine);
    // No confirmation tone here: adding to the satchel is a quiet, frequent
    // action and a beep on each one got irritating. The button already flips
    // to its added state, and the chord preview still has its own sound.
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setInspectedProduct(null);
    }, 1000);
  };

  const handlePlayChord = () => {
    const playGeneratedChord = () => {
      soundEngine.playChime([523.25, 659.25, 783.99, 1046.50]);
    };

    // No file for this flavour: the button keeps its original chord behaviour.
    if (!hasTrack) {
      playGeneratedChord();
      return;
    }

    // The file is missing or the browser refused to play it, so fall back to
    // the chord instead of leaving the button silently dead.
    if (status === 'error') {
      playGeneratedChord();
      return;
    }

    toggle();
  };

  return (
    <div
      id="product-inspect-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setInspectedProduct(null);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-2xl animate-fade-rise cursor-pointer overflow-y-auto font-sans antialiased"
    >
      <div
        id="product-inspect-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`hall-product-card hall-modal-fit relative w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl cursor-default transition-all duration-300 ${
          isDark
            ? 'bg-slate-950/90 border-white/15 text-stone-100 shadow-black/90'
            : 'bg-stone-900/95 border-white/20 text-stone-100 shadow-black/80'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setInspectedProduct(null)}
          className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Main Content Grid - Apple/Stripe Editorial Layout */}
        <div className="hall-product-body grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-12 items-center max-h-[85dvh] overflow-y-auto">

          {/* LEFT COLUMN: Clean Album Cover Image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[320px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/20 group">
              <img
                src={inspectedProduct.image}
                alt={inspectedProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Album Sheen Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-70" />

              {/* Harmonic Chords Button Badge — plays the flavour's own track,
                  or the generated chord when the flavour has no audio file. */}
              <button
                onClick={handlePlayChord}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Поставить музыку на паузу' : 'Включить музыку'}
                className={`absolute bottom-3 right-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-sans font-semibold flex items-center gap-1.5 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-pointer group/btn min-h-[44px] ${
                  isPlaying
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white border-white/20'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-slate-950" />
                ) : hasTrack ? (
                  <Play
                    className={`w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors ${
                      status === 'loading' ? 'animate-pulse' : ''
                    }`}
                  />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                )}
                <span>{isPlaying ? 'Пауза' : 'Аккорды'}</span>
              </button>
            </div>

            {/* Backing audio for the button above. preload="none" keeps the 24
                catalogue files from downloading until a flavour is actually
                opened; unmounting this element stops the track. */}
            {hasTrack && (
              <audio ref={audioRef} src={audioFile ?? undefined} preload="none" {...handlers} />
            )}
          </div>

          {/* RIGHT COLUMN: Premium Typography & Minimalist Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">

            {/* Header with High-Contrast Typography & tracking-tight */}
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2">
                {inspectedProduct.category}
                {inspectedProduct.opusNumber && sanitizeTitle(inspectedProduct.opusNumber)
                  ? ` • ${sanitizeTitle(inspectedProduct.opusNumber)}`
                  : ''}
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans drop-shadow-md leading-tight mb-3">
                {sanitizeTitle(inspectedProduct.name)}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-stone-200 font-sans font-normal opacity-95">
                {sanitizeRussianText(inspectedProduct.description)}
              </p>
            </div>

            {/* Option Controls Section */}
            <div className="space-y-2.5 sm:space-y-5 pt-3 border-t border-white/10">

              {/* Volume Segmented Control */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center text-sm sm:text-base font-sans tracking-wider uppercase text-stone-300 antialiased">
                  <span className="font-extrabold text-white">Объём флакона (ml):</span>
                  <span className="text-amber-400 font-extrabold font-sans text-sm sm:text-lg tracking-tight">{volPrice} ₽</span>
                </div>

                {/* Segmented Control Pills */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 p-0.5 sm:p-1.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md">
                  {(['30ml', '60ml', '120ml'] as VolumeType[]).map((v) => {
                    const isSelected = selectedVolume === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelectedVolume(v)}
                        className={`relative py-1.5 sm:py-3 px-1 sm:px-2 rounded-xl text-center font-sans antialiased transition-all duration-300 cursor-pointer min-h-[24px] sm:min-h-[48px] flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/30 scale-[1.02]'
                            : 'text-stone-200 hover:text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        <div className="text-sm sm:text-lg font-extrabold tracking-tight">{v}</div>
                        <div className={`text-[10px] sm:text-sm font-semibold mt-0.5 ${isSelected ? 'text-slate-950/90' : 'text-stone-400'}`}>
                          {VOLUME_PRICING[v]} ₽
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nicotine Segmented Control */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center text-sm sm:text-base font-sans tracking-wider uppercase text-stone-300 antialiased">
                  <span className="font-extrabold text-white">Крепость никотина:</span>
                  <span className="text-amber-400 font-extrabold font-sans text-sm sm:text-lg tracking-tight">
                    {nicPrice > 0 ? `+${nicPrice} ₽` : '0 ₽'}
                  </span>
                </div>

                {/* Segmented Control Pills */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 p-0.5 sm:p-1.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md">
                  {(['0mg', '1.5mg', '3mg', '6mg'] as NicotineType[]).map((n) => {
                    const isSelected = selectedNicotine === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setSelectedNicotine(n)}
                        className={`relative py-1.5 sm:py-3 px-0.5 sm:px-1.5 rounded-xl text-center font-sans antialiased transition-all duration-300 cursor-pointer min-h-[24px] sm:min-h-[48px] flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/30 scale-[1.02]'
                            : 'text-stone-200 hover:text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        <div className="text-sm sm:text-lg font-extrabold tracking-tight">{n}</div>
                        <div className={`text-[10px] sm:text-sm font-semibold mt-0.5 ${isSelected ? 'text-slate-950/90' : 'text-stone-400'}`}>
                          {n === '0mg' ? '0₽' : `+${NICOTINE_PRICING[n]}₽`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CTA Footer Row: Premium Typography Price Display & Clean Minimalist Order Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm sm:text-base font-sans uppercase tracking-widest text-stone-300 mb-0.5 font-extrabold antialiased">
                  Итоговая стоимость
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold font-sans text-amber-400 tracking-tight antialiased">
                  {totalPrice} ₽
                </div>
              </div>

              {/* Clean Order Button: strictly NO plus icon (+) and NO price display inside button */}
              <button
                onClick={handleAdd}
                disabled={isArchived}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base tracking-wide font-sans antialiased flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-xl min-h-[52px] ${
                  isArchived
                    ? 'bg-stone-700/60 text-stone-400 cursor-not-allowed border border-white/10 shadow-none'
                    : isAdded
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 scale-[1.02]'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:shadow-2xl hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isArchived ? (
                  <span>Коллекция в архиве</span>
                ) : isAdded ? (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>В плейлисте</span>
                  </>
                ) : (
                  <span>В плейлист</span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
