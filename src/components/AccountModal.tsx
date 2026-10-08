import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  User,
  Phone,
  Send,
  Calendar,
  LogOut,
  Disc3,
  Sparkles,
  ChevronDown,
  Loader2,
  Check,
  ArrowLeft,
} from 'lucide-react';

const formatRub = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

const TIER_LABEL: Record<string, string> = {
  BASE: 'Первое слушание',
  SILVER: 'Серебряный слушатель',
  GOLD: 'Золотой слушатель',
};

const LOYALTY_RULES = [
  { threshold: 20000, pct: 5, tier: 'silver' },
  { threshold: 30000, pct: 10, tier: 'gold' },
];

const STATUS_LABEL: Record<string, string> = {
  'Pending Verification': 'Ожидает подтверждения',
  Confirmed: 'Подтверждён',
};

const STATUS_TONE: Record<string, string> = {
  'Pending Verification': '#f59e0b',
  Confirmed: '#10b981',
};

function loyaltyProgress(spend: number, nextThreshold: number | null) {
  if (!nextThreshold) return 100;
  const previous = nextThreshold === 20000 ? 0 : 20000;
  const span = nextThreshold - previous;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, ((spend - previous) / span) * 100));
}

export const AccountModal: React.FC = () => {
  const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);
  const setIsAccountModalOpen = useAppStore((state) => state.setIsAccountModalOpen);
  const currentUser = useAppStore((state) => state.currentUser);
  const logoutWithApi = useAppStore((state) => state.logoutWithApi);
  const logout = useAppStore((state) => state.logout);
  const ordersHistory = useAppStore((state) => state.ordersHistory);
  const loyalty = useAppStore((state) => state.loyalty);
  const fetchOrders = useAppStore((state) => state.fetchOrders);
  const isLoading = useAppStore((state) => state.isLoadingOrders);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isOrderHistorySubModalOpen, setIsOrderHistorySubModalOpen] = useState(false);

  useEffect(() => {
    if (isAccountModalOpen) {
      fetchOrders();
    } else {
      setIsOrderHistorySubModalOpen(false);
    }
  }, [isAccountModalOpen, fetchOrders]);

  if (!isAccountModalOpen || !currentUser) return null;

  const spend = loyalty?.spend ?? 0;
  const nextThreshold = loyalty?.nextThreshold ?? null;
  const progress = loyaltyProgress(spend, nextThreshold);
  const remaining = nextThreshold ? Math.max(0, nextThreshold - spend) : 0;

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl overflow-y-auto overscroll-contain animate-fade-rise"
    >
      <div
        className="min-h-full flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsAccountModalOpen(false);
        }}
      >
        {/* AAA Luxury Modal Card Container */}
        <div
          id="account-modal-card"
          role="dialog"
          aria-modal="true"
          aria-label="Личный кабинет"
          className="relative w-full max-w-2xl rounded-3xl overflow-hidden border my-auto text-stone-100 transition-all duration-300"
          style={{
            background: '#0a0a0a',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            letterSpacing: '0.05em',
          }}
        >
          {/* Main User Profile Modal View */}
          {!isOrderHistorySubModalOpen ? (
            <div className="flex flex-col">
              {/* Header Section */}
              <div className="relative p-6 sm:p-8 border-b border-white/[0.08]">
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  aria-label="Закрыть кабинет"
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer z-10 text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-amber-400/20 bg-amber-400/10 text-amber-400 shadow-inner"
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Balanced, refined ФИО header without oversized footprint and NO "Авторизованный слушатель" badge */}
                    <h2
                      className="font-serif font-semibold leading-snug break-words text-white tracking-wide"
                      style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
                    >
                      {currentUser.name}
                    </h2>
                  </div>
                </div>

                {/* Loyalty Program Section */}
                {loyalty && (
                  <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                          Постоянный слушатель
                        </div>
                        {loyalty.tier !== 'BASE' && (
                          <div className="font-serif text-lg text-amber-300 mt-0.5">
                            {TIER_LABEL[loyalty.tier] ?? loyalty.tier}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-3xl font-extrabold text-amber-400">
                          {loyalty.discountPct}%
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">
                          на следующий заказ
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="h-1.5 rounded-full overflow-hidden bg-white/10"
                      role="progressbar"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-amber-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="text-[11px] font-mono text-stone-400">
                      {nextThreshold ? (
                        <>
                          <span className="text-stone-200 font-bold">{formatRub(spend)} ₽</span>
                          {' из '}
                          {formatRub(nextThreshold)} ₽ — ещё {formatRub(remaining)} ₽
                        </>
                      ) : (
                        <>
                          <span className="text-stone-200 font-bold">{formatRub(spend)} ₽</span>
                          {' — максимальная скидка'}
                        </>
                      )}
                    </div>

                    {/* Loyalty Rules Thresholds */}
                    <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {LOYALTY_RULES.map((rule) => {
                        const unlocked = spend > rule.threshold;
                        return (
                          <div
                            key={rule.threshold}
                            className={`flex items-center gap-1.5 ${
                              unlocked ? 'text-amber-300 font-bold' : 'text-stone-500'
                            }`}
                          >
                            {unlocked ? (
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-stone-600 shrink-0" />
                            )}
                            <span>{rule.pct}% после {formatRub(rule.threshold)} ₽</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Contact Info Details */}
              <div className="p-6 sm:p-8 space-y-3 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  {[
                    { Icon: Send, label: 'Telegram', value: currentUser.telegram, tone: '#38bdf8' },
                    { Icon: Phone, label: 'Телефон', value: currentUser.phone, tone: '#a855f7' },
                    { Icon: Calendar, label: 'В студии с', value: currentUser.registeredAt, tone: '#fb923c' },
                  ].map(({ Icon, label, value, tone }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-stone-400 shrink-0">
                        <Icon className="w-3.5 h-3.5" style={{ color: tone }} />
                        {label}
                      </span>
                      <span className="min-w-0 text-right break-words font-semibold text-stone-200">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Refined Order History Sub-Modal Action Trigger Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsOrderHistorySubModalOpen(true)}
                    className="w-full py-4 px-5 rounded-2xl border border-white/10 hover:border-amber-400/40 bg-white/[0.04] hover:bg-white/[0.08] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-between cursor-pointer group shadow-lg"
                  >
                    <span className="flex items-center gap-3">
                      <Disc3 className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                      <span>История заказов</span>
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 text-[11px]">
                      {ordersHistory.length} {ordersHistory.length === 1 ? 'заказ' : 'заказов'} →
                    </span>
                  </button>
                </div>
              </div>

              {/* Account Modal Footer Actions */}
              <div className="px-6 sm:px-8 pb-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    logoutWithApi();
                    logout();
                  }}
                  className="px-4 py-2.5 rounded-xl font-mono text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>

                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs border border-white/15 hover:border-white/30 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            /* Dedicated Nested Order History Sub-Modal View */
            <div className="flex flex-col max-h-[85vh] animate-fade-rise">
              {/* Sub-Modal Header */}
              <div className="p-6 sm:p-8 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsOrderHistorySubModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-mono text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2 ml-2">
                    <Disc3 className="w-5 h-5 text-amber-400" />
                    <span>История заказов</span>
                  </h3>
                </div>

                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  aria-label="Закрыть"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Order List */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-3 max-h-[60vh] overscroll-contain">
                {isLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="font-mono text-xs text-stone-400">Загрузка истории заказов…</p>
                  </div>
                ) : ordersHistory.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Disc3 className="w-10 h-10 text-stone-600 mx-auto" />
                    <p className="font-serif text-lg text-stone-300">Записей пока нет</p>
                    <p className="font-mono text-xs text-stone-500">
                      Ваш первый оформленный заказ появится здесь.
                    </p>
                  </div>
                ) : (
                  ordersHistory.map((order) => {
                    const isOpen = expandedOrder === order.orderId;
                    return (
                      <div
                        key={order.orderId}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedOrder(isOpen ? null : order.orderId)}
                          className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-sm text-amber-400">
                              {order.orderId}
                            </div>
                            <div className="text-[11px] font-mono text-stone-400 mt-1 flex items-center gap-2">
                              <span>{order.createdAt}</span>
                              <span>·</span>
                              <span
                                className="font-semibold"
                                style={{ color: STATUS_TONE[order.status] ?? '#f59e0b' }}
                              >
                                {STATUS_LABEL[order.status] ?? order.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-sm text-white">
                              {formatRub(order.subtotal)} ₽
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${
                                isOpen ? 'rotate-180 text-amber-400' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Expanded Items */}
                        {isOpen && (
                          <div className="px-4 pb-4 pt-2 border-t border-white/[0.08] space-y-2 bg-black/40">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-xs text-stone-200 truncate">
                                    {item.product.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-stone-400">
                                    {item.volume} · {item.nicotine} · {item.quantity} шт
                                  </div>
                                </div>
                                <div className="font-mono text-xs font-bold text-stone-300 shrink-0">
                                  {formatRub(item.totalUnitPrice * item.quantity)} ₽
                                </div>
                              </div>
                            ))}

                            {order.discountAmount ? (
                              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 pt-2 border-t border-white/[0.08]">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  Скидка {order.discountPct}%
                                </span>
                                <span>−{formatRub(order.discountAmount)} ₽</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sub-Modal Footer */}
              <div className="p-6 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => setIsOrderHistorySubModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs border border-white/15 hover:border-white/30 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Назад в кабинет</span>
                </button>

                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
