import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VolumeType, NicotineType } from '../types';
import { calculatePrice, VOLUME_PRICING, NICOTINE_PRICING } from '../data/products';
import {
  X,
  Volume2,
  Check,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

/**
 * Module 3: Premium Grade Apple/Stripe Design Refactoring
 * - Commercial standard typography (`font-sans antialiased`), high contrast and clarity.
 * - `tracking-tight` for large headers, clean description text.
 * - Removed `Physical Release Edition` completely.
 * - Minimalist CTA button (`В плейлист` / `В плейлисте`) with STRICTLY NO plus icon and NO price inside.
 */

export const ProductDetailModal: React.FC = () => {
  const inspectedProduct = useAppStore((state) => state.inspectedProduct);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const addToCart = useAppStore((state) => state.addToCart);
  const theme = useAppStore((state) => state.theme);

  const [selectedVolume, setSelectedVolume] = useState<VolumeType>('30ml');
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('0mg');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setSelectedVolume('30ml');
    setSelectedNicotine('0mg');
    setIsAdded(false);
  }, [inspectedProduct]);

  if (!inspectedProduct) return null;

  const isDark = theme === 'dark';

  const volPrice = VOLUME_PRICING[selectedVolume];
  const nicPrice = NICOTINE_PRICING[selectedNicotine];
  const totalPrice = calculatePrice(selectedVolume, selectedNicotine);

  const handleAdd = () => {
    addToCart(inspectedProduct, selectedVolume, selectedNicotine);
    soundEngine.playSuccessTone();
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setInspectedProduct(null);
    }, 1000);
  };

  const handlePlayChord = () => {
    soundEngine.playChime([523.25, 659.25, 783.99, 1046.50]);
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
        className={`relative w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl cursor-default transition-all duration-300 ${
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">

          {/* LEFT COLUMN: Clean Album Cover Image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/20 group">
              <img
                src={inspectedProduct.image}
                alt={inspectedProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Album Sheen Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-70" />

              {/* Harmonic Chords Button Badge */}
              <button
                onClick={handlePlayChord}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white text-xs font-sans font-semibold flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all duration-300 shadow-lg cursor-pointer group/btn"
              >
                <Volume2 className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                <span>Аккорды</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Premium Typography & Minimalist Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">

            {/* Header with High-Contrast Typography & tracking-tight */}
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2">
                {inspectedProduct.category} • {inspectedProduct.opusNumber}
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans drop-shadow-md leading-tight mb-3">
                {inspectedProduct.name}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-stone-200 font-sans font-normal opacity-95">
                {inspectedProduct.description}
              </p>
            </div>

            {/* Option Controls Section */}
            <div className="space-y-5 pt-3 border-t border-white/10">

              {/* Volume Segmented Control */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-sans tracking-wide uppercase text-stone-300">
                  <span className="font-semibold text-stone-200">Выберите объём:</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">{volPrice} ₽</span>
                </div>

                {/* Segmented Control Pills */}
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  {(['30ml', '60ml', '120ml'] as VolumeType[]).map((v) => {
                    const isSelected = selectedVolume === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelectedVolume(v)}
                        className={`relative py-3 px-3 rounded-xl text-center font-sans transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                            : 'text-stone-300 hover:text-white hover:bg-white/10 font-medium'
                        }`}
                      >
                        <div className="text-sm font-bold tracking-tight">{v}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-900/80' : 'opacity-60'}`}>
                          {VOLUME_PRICING[v]} ₽
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nicotine Segmented Control */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-sans tracking-wide uppercase text-stone-300">
                  <span className="font-semibold text-stone-200">Концентрация никотина:</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {nicPrice > 0 ? `+${nicPrice} ₽` : '0 ₽'}
                  </span>
                </div>

                {/* Segmented Control Pills */}
                <div className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  {(['0mg', '1.5mg', '3mg', '6mg'] as NicotineType[]).map((n) => {
                    const isSelected = selectedNicotine === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setSelectedNicotine(n)}
                        className={`relative py-3 px-2 rounded-xl text-center font-sans transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                            : 'text-stone-300 hover:text-white hover:bg-white/10 font-medium'
                        }`}
                      >
                        <div className="text-sm font-bold tracking-tight">{n}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-900/80' : 'opacity-60'}`}>
                          {n === '0mg' ? '0₽' : `+${NICOTINE_PRICING[n]}₽`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CTA Footer Row: Price Display & Clean Minimalist Order Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-stone-400 mb-0.5 font-semibold">
                  Итоговая стоимость
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-tight">
                  {totalPrice} ₽
                </div>
              </div>

              {/* Clean Order Button: strictly NO plus icon (+) and NO price display inside button */}
              <button
                onClick={handleAdd}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-xl ${
                  isAdded
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 scale-[1.02]'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:shadow-2xl hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isAdded ? (
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
