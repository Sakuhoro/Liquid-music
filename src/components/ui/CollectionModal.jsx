import React, { useState } from 'react';
import { useProductStore } from '../../store/useProductStore';
import {
  X,
  Sparkles,
  Lock,
  ShoppingCart,
  CheckCircle2,
  Calendar,
  Volume2,
  Droplet,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function CollectionModal() {
  const activeCollectionModal = useProductStore((s) => s.activeCollectionModal);
  const closeCollectionModal = useProductStore((s) => s.closeCollectionModal);
  const isCollectionActive = useProductStore((s) => s.isCollectionActive);
  const addToCart = useProductStore((s) => s.addToCart);

  const [selectedNicotine, setSelectedNicotine] = useState('3mg');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFlavor, setSelectedFlavor] = useState(null);

  if (!activeCollectionModal) return null;

  const collection = activeCollectionModal;
  const isActive = isCollectionActive(collection.id);
  const flavors = collection.flavors || [];

  const handleAddToCart = (flavor, e) => {
    e.stopPropagation();
    if (!isActive) return;
    addToCart(flavor, selectedNicotine, 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Container Glass Modal */}
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl bg-slate-900/90 text-slate-100 border border-white/20 shadow-2xl overflow-hidden glass-panel">

        {/* Header Section */}
        <div
          className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 gap-4"
          style={{
            background: `linear-gradient(135deg, ${collection.themeColor}22 0%, rgba(15,23,42,0.8) 100%)`,
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 shadow-md"
                style={{ backgroundColor: collection.themeColor }}
              >
                {collection.type === 'seasonal' ? `${collection.season} Collection` : 'Permanent Edition'}
              </span>

              {isActive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available for Purchase
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  Archived / View Only
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {collection.name}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">{collection.description}</p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-2 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{collection.seasonMonths}</span>
            </div>

            <button
              onClick={closeCollectionModal}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Catalog Body Grid & Flavors List */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{flavors.length} Handcrafted Flavors</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-medium">Nicotine:</span>
              {['0mg', '3mg', '6mg'].map((nic) => (
                <button
                  key={nic}
                  onClick={() => setSelectedNicotine(nic)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedNicotine === nic
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {nic}
                </button>
              ))}
            </div>
          </div>

          {/* Flavors Grid (23 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flavors.map((flavor) => (
              <div
                key={flavor.id}
                onClick={() => setSelectedFlavor(flavor)}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  selectedFlavor?.id === flavor.id
                    ? 'bg-slate-800/90 border-amber-400 shadow-xl scale-[1.02]'
                    : 'bg-slate-800/40 border-white/10 hover:border-white/30 hover:bg-slate-800/60'
                }`}
              >
                {/* Badge if available */}
                {flavor.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {flavor.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-slate-400">{flavor.sku}</span>
                    <span className="text-xs font-bold text-amber-300">{flavor.vgPg} VG/PG</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {flavor.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{flavor.flavorNotes}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-white">${flavor.price.toFixed(2)}</span>

                  <button
                    disabled={!isActive}
                    onClick={(e) => handleAddToCart(flavor, e)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer'
                        : 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Archived</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-8 bg-slate-950/80 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>✨ Crafting harmony in every drop. 21+ only.</span>
          <span>Liquid Music Spatial E-Commerce Platform</span>
        </div>
      </div>
    </div>
  );
}
