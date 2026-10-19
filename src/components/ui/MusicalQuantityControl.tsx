import React from 'react';
import { Minus, Plus } from 'lucide-react';
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

  // One row on a phone and the same row a touch larger on a desktop. The pill
  // fills the width it is given, and the two steppers keep a 44px target at
  // every size, so a thumb and a mouse land on the same shape.
  const sizeClasses =
    size === 'sm'
      ? 'min-h-[44px] gap-1 px-1.5 py-1'
      : size === 'lg'
      ? 'min-h-[56px] gap-2 px-2 py-1.5'
      : 'min-h-[48px] gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1';

  const buttonSize =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-12 h-12'
      : 'w-11 h-11 sm:w-10 sm:h-10';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className={`inline-flex items-center justify-between rounded-2xl bg-white/5 backdrop-blur-md border border-amber-400/40 text-amber-300 transition-all duration-300 hover:border-amber-400/80 pointer-events-auto ${sizeClasses} ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={totalQuantity === 0}
        aria-label="Уменьшить количество"
        className={`flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 cursor-pointer ${
          totalQuantity === 0
            ? 'opacity-30 cursor-not-allowed text-stone-500'
            : 'hover:bg-amber-400/25 active:scale-90 text-amber-400 hover:text-amber-300'
        }`}
      >
        <Minus className={`${iconSize} stroke-[2.5]`} />
      </button>

      <span
        className={`flex-1 text-center font-mono font-extrabold tracking-tight select-none tabular-nums text-amber-400 ${
          size === 'sm' ? 'text-sm min-w-[1.5rem]' : 'text-lg sm:text-xl min-w-[2rem]'
        }`}
      >
        {totalQuantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        aria-label="Увеличить количество"
        className={`flex items-center justify-center ${buttonSize} rounded-xl hover:bg-amber-400/25 active:scale-90 text-amber-400 hover:text-amber-300 transition-all duration-200 cursor-pointer`}
      >
        <Plus className={`${iconSize} stroke-[2.5]`} />
      </button>
    </div>
  );
};

export default MusicalQuantityControl;
