import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const isCartOpen = useAppStore((state) => state.isCartOpen);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const cart = useAppStore((state) => state.cart);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const getCartSubtotal = useAppStore((state) => state.getCartSubtotal);
  const currentUser = useAppStore((state) => state.currentUser);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const theme = useAppStore((state) => state.theme);

  if (!isCartOpen) return null;

  const isDark = theme === 'dark';
  const subtotal = getCartSubtotal();

  const handleCheckoutClick = () => {
    placeOrder();
  };

  // Click outside (backdrop click) handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  return (
    <div
      id="cart-drawer-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-rise cursor-pointer"
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l backdrop-blur-2xl transition-transform duration-300 cursor-default ${
          isDark
            ? 'bg-[rgba(7,24,38,0.96)] border-white/15 text-stone-100'
            : 'bg-white/95 border-black/15 text-stone-900'
        }`}
      >
        {/* Cart Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-2xl font-normal tracking-tight">
              Aromatic Satchel
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 opacity-75">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto opacity-25" />
              <p className="text-sm font-medium opacity-75">
                Your satchel is empty
              </p>
              <p className="text-xs opacity-50 max-w-xs mx-auto">
                Explore our Opus collections and compose your symphony of flavors.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex gap-3.5 transition-all ${
                  isDark
                    ? 'bg-white/[0.03] border-white/10'
                    : 'bg-black/[0.02] border-black/10'
                }`}
              >
                {/* Product Thumbnail */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-lg font-bold leading-snug truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="opacity-40 hover:opacity-100 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Volume and Nicotine Badges */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-amber-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                      {item.volume} ({item.volumePrice}₽)
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                      {item.nicotine} (+{item.nicotinePrice}₽)
                    </span>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 p-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 active:scale-95 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-base font-bold text-amber-400">
                        {item.totalUnitPrice * item.quantity} ₽
                      </span>
                      {item.quantity > 1 && (
                        <div className="text-[10px] font-mono opacity-50">
                          {item.totalUnitPrice} ₽ / шт
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            {/* User Auth status badge */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="opacity-70">Клиент:</span>
              {currentUser ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser.telegram}
                </span>
              ) : (
                <span className="text-amber-400 opacity-80">
                  Требуется авторизация
                </span>
              )}
            </div>

            {/* Subtotal */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase tracking-wider opacity-75">
                Итого к оплате:
              </span>
              <span className="font-serif text-3xl font-bold text-amber-400">
                {subtotal} ₽
              </span>
            </div>

            {/* Place Order CTA */}
            <button
              id="place-order-checkout-btn"
              onClick={handleCheckoutClick}
              className="liquid-glass w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-stone-100 shadow-xl"
            >
              <span>Оформить заказ</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
