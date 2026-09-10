import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VolumeType, NicotineType } from '../types';
import { calculatePrice, VOLUME_PRICING, NICOTINE_PRICING } from '../data/products';
import {
  X,
  Volume2,
  Check,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise cursor-pointer"
    >
      <div
        id="product-inspect-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl flex flex-col max-h-[92vh] cursor-default ${
          isDark
            ? 'bg-[rgba(8,28,44,0.95)] border-white/20 text-stone-100'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setInspectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Media & Art */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-stone-950">
          <img
            src={inspectedProduct.image}
            alt={inspectedProduct.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(201,100%,13%)] via-black/40 to-black/30" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold mb-1">
                <span>{inspectedProduct.opusNumber}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white drop-shadow-md">
                {inspectedProduct.name}
              </h2>
            </div>

            <button
              onClick={handlePlayChord}
              className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Harmonic Chords</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          <p className={`leading-relaxed ${isDark ? 'text-stone-300' : 'text-slate-700 font-medium'}`}>
            {inspectedProduct.description}
          </p>

          {/* Aromatic Architecture Chords */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isDark
                ? 'bg-white/[0.03] border-white/10 text-stone-200'
                : 'bg-slate-100/90 border-slate-300 text-slate-900'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Aromatic Pyramid Architecture</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <span className="block font-mono text-[10px] uppercase opacity-60">Top Note</span>
                <span className="font-semibold">{inspectedProduct.aromaticChords.top}</span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <span className="block font-mono text-[10px] uppercase opacity-60">Heart Note</span>
                <span className="font-semibold">{inspectedProduct.aromaticChords.heart}</span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <span className="block font-mono text-[10px] uppercase opacity-60">Base Chord</span>
                <span className="font-semibold">{inspectedProduct.aromaticChords.base}</span>
              </div>
            </div>
          </div>

          {/* Volume Selection Engine */}
          <div className="space-y-2">
            <div
              className={`flex justify-between items-center text-xs font-mono uppercase tracking-wider ${
                isDark ? 'text-stone-300' : 'text-slate-800 font-bold'
              }`}
            >
              <span>1. Choose Bottle Volume:</span>
              <span className={isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'}>
                {volPrice} ₽
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['30ml', '60ml', '120ml'] as VolumeType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVolume(v)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedVolume === v
                      ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-lg shadow-amber-400/25'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 font-semibold'
                  }`}
                >
                  <div className="text-sm font-bold">{v}</div>
                  <div className="text-[11px] opacity-80">{VOLUME_PRICING[v]} ₽</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nicotine Formulation Engine */}
          <div className="space-y-2">
            <div
              className={`flex justify-between items-center text-xs font-mono uppercase tracking-wider ${
                isDark ? 'text-stone-300' : 'text-slate-800 font-bold'
              }`}
            >
              <span>2. Choose Nicotine Strength:</span>
              <span className={isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'}>
                +{nicPrice} ₽
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {(['0mg', '1.5mg', '3mg', '6mg'] as NicotineType[]).map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNicotine(n)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedNicotine === n
                      ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-lg shadow-amber-400/25'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 font-semibold'
                  }`}
                >
                  <div className="text-sm font-bold">{n}</div>
                  <div className="text-[10px] opacity-80">
                    {n === '0mg' ? '+0₽' : `+${NICOTINE_PRICING[n]}₽`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer: Total Price & Add */}
        <div
          className={`p-6 border-t flex items-center justify-between gap-4 ${
            isDark ? 'border-white/10' : 'border-slate-300'
          }`}
        >
          <div>
            <div
              className={`text-2xl sm:text-3xl font-serif font-bold ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              {totalPrice} ₽
            </div>
            <div
              className={`text-xs font-mono ${
                isDark ? 'text-stone-400' : 'text-slate-600 font-medium'
              }`}
            >
              {volPrice} ₽ (объём) + {nicPrice} ₽ (никотин)
            </div>
          </div>

          <button
            onClick={handleAdd}
            className={`liquid-glass px-6 py-3.5 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-stone-100 ${
              isAdded ? 'bg-emerald-500 text-stone-950 font-bold' : ''
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Symphonies</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart ({totalPrice} ₽)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
