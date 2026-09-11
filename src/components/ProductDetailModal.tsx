import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VolumeType, NicotineType } from '../types';
import { calculatePrice, VOLUME_PRICING, NICOTINE_PRICING } from '../data/products';
import {
  X,
  Volume2,
  Check,
  Disc,
  Plus,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

/**
 * Visual Layer Architecture (Album Design System):
 * Композиция модального окна выполнена в формате премиального винилового конверта (Editorial Album Layout):
 * левая колонка выделена под квадратный арт вкуса с глубокими объёмными тенями `shadow-black/70 shadow-2xl`
 * и интерактивной кнопкой прослушивания гармонических аккордов, а правая колонка содержит платиновую типографику вкуса,
 * описание и сегментированные "кнопки-таблетки" управления (Segmented Pill Controls). Вся конструкция
 * помещена в полупрозрачный стеклянный контейнер с эффектом `backdrop-blur-xl` и тонким бордером `border-white/10`,
 * создающим эксклюзивную атмосферу физического музыкального релиза.
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-xl animate-fade-rise cursor-pointer overflow-y-auto"
    >
      <div
        id="product-inspect-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl cursor-default transition-all duration-300 ${
          isDark
            ? 'bg-slate-950/85 border-white/10 text-stone-100 shadow-black/80'
            : 'bg-stone-900/90 border-white/15 text-stone-100 shadow-black/70'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setInspectedProduct(null)}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Main Content Grid - Editorial Album Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10 items-center">

          {/* LEFT COLUMN: Physical Vinyl/CD Album Cover Art */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border border-white/15 group">
              <img
                src={inspectedProduct.image}
                alt={inspectedProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Album Vinyl Sheen Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 opacity-70" />

              {/* Harmonic Chords Button Badge */}
              <button
                onClick={handlePlayChord}
                className="absolute bottom-3 right-3 px-3.5 py-2 rounded-full bg-black/60 hover:bg-amber-400 hover:text-slate-950 text-white text-xs font-mono font-medium flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all duration-300 shadow-lg cursor-pointer group/btn"
              >
                <Volume2 className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                <span>Аккорды</span>
              </button>
            </div>

            {/* Sub-label showing Physical Release style badge */}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono tracking-widest text-amber-400/80 uppercase">
              <Disc className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Physical Release Edition</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Platinum Album Typography & Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">

            {/* Header / Clean Title without Opus */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-serif drop-shadow-md leading-none mb-3">
                {inspectedProduct.name}
              </h2>
              <p className="text-sm leading-relaxed text-stone-300/90 font-sans line-clamp-3">
                {inspectedProduct.description}
              </p>
            </div>

            {/* Option Controls Section */}
            <div className="space-y-5 pt-2 border-t border-white/10">

              {/* Volume Segmented Control */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono tracking-wider uppercase text-stone-300">
                  <span className="font-semibold text-amber-300/90">Выбрать нужный объём:</span>
                  <span className="text-amber-400 font-bold font-mono">{volPrice} ₽</span>
                </div>

                {/* Segmented Pill Control */}
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  {(['30ml', '60ml', '120ml'] as VolumeType[]).map((v) => {
                    const isSelected = selectedVolume === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelectedVolume(v)}
                        className={`relative py-2.5 px-3 rounded-xl text-center text-xs font-mono transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                            : 'text-stone-300 hover:text-white hover:bg-white/10 font-medium'
                        }`}
                      >
                        <div className="text-sm font-bold tracking-tight">{v}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-900/80' : 'opacity-60'}`}>
                          {VOLUME_PRICING[v]} ₽
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nicotine Segmented Control */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono tracking-wider uppercase text-stone-300">
                  <span className="font-semibold text-amber-300/90">Выбрать нужную концентрацию никотина:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {nicPrice > 0 ? `+${nicPrice} ₽` : '0 ₽'}
                  </span>
                </div>

                {/* Segmented Pill Control */}
                <div className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  {(['0mg', '1.5mg', '3mg', '6mg'] as NicotineType[]).map((n) => {
                    const isSelected = selectedNicotine === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setSelectedNicotine(n)}
                        className={`relative py-2.5 px-2 rounded-xl text-center text-xs font-mono transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                            : 'text-stone-300 hover:text-white hover:bg-white/10 font-medium'
                        }`}
                      >
                        <div className="text-sm font-bold tracking-tight">{n}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-900/80' : 'opacity-60'}`}>
                          {n === '0mg' ? '+0₽' : `+${NICOTINE_PRICING[n]}₽`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CTA Footer Row: Total Price & Massive Playlist Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-0.5">
                  Итоговая стоимость
                </div>
                <div className="text-3xl font-extrabold font-serif text-amber-400 tracking-tight">
                  {totalPrice} ₽
                </div>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 shadow-xl ${
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
                  <>
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>Добавить в плейлист • {totalPrice} ₽</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
