import React from 'react';
import { Minus, Plus, Disc } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ProductItem } from '../../types';

interface MusicalQuantityControlProps {
  product: ProductItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MusicalQuantityControl: React.FC<MusicalQuantityControlProps> = ({
  product,
  className = '',
  size = 'md',
}) => {
  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);

  // Total quantity of this product currently in the cart
  const productCartItems = cart.filter((item) => item.product.id === product.id);
  const totalQuantity = productCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (productCartItems.length > 0) {
      const lastItem = productCartItems[productCartItems.length - 1];
      updateCartQuantity(lastItem.id, 1);
    } else {
      addToCart(product, '30ml', '0mg');
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (productCartItems.length > 0) {
      const lastItem = productCartItems[productCartItems.length - 1];
      updateCartQuantity(lastItem.id, -1);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-xs min-h-[32px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-base min-h-[44px]'
      : 'px-2 py-1 text-xs sm:text-sm min-h-[38px]';

  const buttonSize =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-9 h-9'
      : 'w-8 h-8';

  const iconSize =
    size === 'sm'
      ? 'w-3 h-3'
      : size === 'lg'
      ? 'w-4 h-4'
      : 'w-3.5 h-3.5 sm:w-4 sm:h-4';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-950/90 backdrop-blur-xl border border-amber-400/40 text-amber-300 shadow-xl shadow-black/80 transition-all duration-300 hover:border-amber-400/80 pointer-events-auto ${sizeClasses} ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={totalQuantity === 0}
        aria-label="Уменьшить количество"
        className={`flex items-center justify-center ${buttonSize} rounded-full transition-all duration-200 cursor-pointer ${
          totalQuantity === 0
            ? 'opacity-30 cursor-not-allowed text-stone-500'
            : 'hover:bg-amber-400/25 active:scale-90 text-amber-400 hover:text-amber-300'
        }`}
      >
        <Minus className={`${iconSize} stroke-[2.5]`} />
      </button>

      <div className="flex items-center gap-1 px-1 sm:px-1.5 font-mono font-bold tracking-tight select-none">
        <Disc
          className={`${iconSize} text-amber-400 transition-transform ${
            totalQuantity > 0 ? 'animate-spin' : 'opacity-60'
          }`}
          style={{ animationDuration: '6s' }}
        />
        <span
          className={`font-mono font-extrabold text-amber-400 min-w-[1.1rem] text-center ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-xs sm:text-sm'
          }`}
        >
          {totalQuantity}
        </span>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        aria-label="Увеличить количество"
        className={`flex items-center justify-center ${buttonSize} rounded-full hover:bg-amber-400/25 active:scale-90 text-amber-400 hover:text-amber-300 transition-all duration-200 cursor-pointer`}
      >
        <Plus className={`${iconSize} stroke-[2.5]`} />
      </button>
    </div>
  );
};

export default MusicalQuantityControl;
