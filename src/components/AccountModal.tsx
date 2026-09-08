import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  User,
  Phone,
  Send,
  Calendar,
  LogOut,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AccountModal: React.FC = () => {
  const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);
  const setIsAccountModalOpen = useAppStore((state) => state.setIsAccountModalOpen);
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const ordersHistory = useAppStore((state) => state.ordersHistory);
  const theme = useAppStore((state) => state.theme);

  if (!isAccountModalOpen || !currentUser) return null;

  const isDark = theme === 'dark';

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="account-modal-card"
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-8 backdrop-blur-2xl ${
          isDark
            ? 'bg-[rgba(8,28,44,0.95)] border-white/20 text-stone-100'
            : 'bg-white/95 border-black/15 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAccountModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Авторизованный Слушатель</span>
            </div>
            <h2 className="font-serif text-2xl font-normal leading-tight">
              {currentUser.name}
            </h2>
          </div>
        </div>

        {/* Details Card */}
        <div
          className={`p-4 rounded-2xl border space-y-3 mb-6 text-xs font-mono ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="opacity-60 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              Telegram ID:
            </span>
            <span className="text-amber-400 font-bold">{currentUser.telegram}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="opacity-60 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Номер Телефона:
            </span>
            <span>{currentUser.phone}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="opacity-60 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Дата Регистрации:
            </span>
            <span>{currentUser.registeredAt}</span>
          </div>
        </div>

        {/* Order History */}
        <div className="mb-6">
          <h3 className="font-serif text-lg mb-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 opacity-70" />
            <span>История Заказов ({ordersHistory.length})</span>
          </h3>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {ordersHistory.length === 0 ? (
              <p className="text-xs opacity-50 py-3 text-center">
                У вас пока нет оформленных заказов.
              </p>
            ) : (
              ordersHistory.map((order) => (
                <div
                  key={order.orderId}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-amber-400">
                      {order.orderId}
                    </div>
                    <div className="text-[10px] opacity-60">
                      {order.createdAt} • {order.items.length} симфоний
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold">
                    {order.subtotal} ₽
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти из аккаунта</span>
          </button>

          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="px-5 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-xs font-mono transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
