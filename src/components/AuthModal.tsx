import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  UserCheck,
  Phone,
  Send,
  User,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAppStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useAppStore((state) => state.closeAuthModal);
  const authModalContext = useAppStore((state) => state.authModalContext);
  const authenticateUser = useAppStore((state) => state.authenticateUser);
  const existingUsers = useAppStore((state) => state.existingUsers);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const theme = useAppStore((state) => state.theme);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('@');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic format validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setError('Пожалуйста, введите полное ФИО (как минимум Фамилию и Имя).');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setError('Укажите корректный номер телефона (не менее 10 цифр).');
      return;
    }

    let cleanTg = telegram.trim();
    if (!cleanTg.startsWith('@')) {
      cleanTg = '@' + cleanTg;
    }
    if (cleanTg.length < 4) {
      setError('Укажите корректный Telegram ID (например, @username).');
      return;
    }

    // Call store authentication engine with duplicate validation
    const result = authenticateUser(trimmedName, phone.trim(), cleanTg);
    if (!result.success) {
      setError(result.error || 'Ошибка регистрации. Данные уже используются.');
      return;
    }

    // If context was checkout, continue placing order automatically!
    if (authModalContext === 'checkout') {
      setTimeout(() => {
        placeOrder();
      }, 250);
    }
  };

  const handleFillMock = (mockUser: { name: string; phone: string; telegram: string }) => {
    setName(mockUser.name);
    setPhone(mockUser.phone);
    setTelegram(mockUser.telegram);
    setError(null);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="auth-modal-card"
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-8 backdrop-blur-2xl ${
          isDark
            ? 'bg-[rgba(8,28,44,0.92)] border-white/20 text-stone-100'
            : 'bg-white/95 border-black/15 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Авторизация Клиента</span>
          </div>

          <h2 className="font-serif text-3xl font-normal tracking-tight">
            Идентификация Слушателя
          </h2>

          <p className="text-xs opacity-75 mt-1.5 leading-relaxed">
            {authModalContext === 'checkout'
              ? 'Перед подтверждением заказа укажите ваши данные для связи с администратором в Telegram.'
              : 'Введите ваши контактные данные для доступа к персональному профилю и архиву заказов.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Field 1: Full Name (ФИО) */}
          <div className="space-y-1.5">
            <label className="block font-mono uppercase tracking-wider text-[11px] opacity-75 font-semibold">
              ФИО (Полное имя):
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                required
                placeholder="Иванова Анна Сергеевна"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-xs ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Field 2: Phone Number */}
          <div className="space-y-1.5">
            <label className="block font-mono uppercase tracking-wider text-[11px] opacity-75 font-semibold">
              Номер Телефона:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="tel"
                required
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-xs ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Field 3: Telegram ID (@username) */}
          <div className="space-y-1.5">
            <label className="block font-mono uppercase tracking-wider text-[11px] opacity-75 font-semibold">
              Telegram ID:
            </label>
            <div className="relative">
              <Send className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                required
                placeholder="@username"
                value={telegram}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('@') && val.length > 0) {
                    val = '@' + val;
                  }
                  setTelegram(val);
                  setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-xs font-mono ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
            <p className="text-[10px] opacity-50 font-mono">
              * На этот аккаунт напишет администратор @White_blooming для согласования доставки.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="liquid-glass w-full py-3.5 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] text-stone-100"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>
                {authModalContext === 'checkout'
                  ? 'Подтвердить и Перейти к Заказу'
                  : 'Войти в Профиль'}
              </span>
            </button>
          </div>
        </form>

        {/* Quick Test / Mock Registry Preview */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-[10px] font-mono opacity-60 mb-2">
            <span>Существующие аккаунты (валидация дублей):</span>
            <span>{existingUsers.length} в базе</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {existingUsers.slice(0, 3).map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleFillMock(u)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono opacity-70 hover:opacity-100 transition-all cursor-pointer"
                title={`Попробовать ввести ${u.telegram} для теста проверки на дубликаты`}
              >
                {u.telegram}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
