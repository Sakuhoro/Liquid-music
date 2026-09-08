import React from 'react';
import { useProductStore } from '../../store/useProductStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const isCartOpen = useProductStore((s) => s.isCartOpen);
  const toggleCart = useProductStore((s) => s.toggleCart);
  const cart = useProductStore((s) => s.cart);
  const removeFromCart = useProductStore((s) => s.removeFromCart);
  const updateQuantity = useProductStore((s) => s.updateQuantity);
  const getCartTotal = useProductStore((s) => s.getCartTotal());

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 text-white border-l border-white/20 p-6 flex flex-col justify-between shadow-2xl overflow-hidden glass-panel">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Your Cart</h2>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <ShoppingBag className="w-12 h-12 stroke-1 text-slate-500" />
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="text-xs text-slate-500 text-center max-w-xs">
                Walk up to any magical collection terminal in the 3D sanctuary to add flavors!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartKey}
                className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{item.flavor.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-700 font-semibold text-amber-300">
                      {item.nicotine}
                    </span>
                    <span>${item.flavor.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-700/80 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.cartKey, -1)}
                      className="p-1 hover:bg-slate-600 rounded text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey, 1)}
                      className="p-1 hover:bg-slate-600 rounded text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between text-base font-bold">
              <span className="text-slate-300">Total</span>
              <span className="text-xl text-amber-400 font-extrabold">
                ${getCartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => alert('Proceeding to Checkout...')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
