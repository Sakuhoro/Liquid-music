import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Send,
  Lock,
  UserCheck,
  UserPlus,
  Sliders,
  AlertCircle,
  CheckSquare,
  Square,
  BadgeCheck,
} from 'lucide-react';
import type { TelegramWidgetUser } from '../../src/types';

export type { TelegramWidgetUser };

export interface StudioAccessGateProps {
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onSubmitLogin?: (data: { telegramId: string; password: string; rememberMe: boolean }) => void;
  onSubmitRegister?: (data: {
    fullName: string;
    phone: string;
    telegramId: string;
    password: string;
    rememberMe: boolean;
  }) => void;
  onSubmitTelegram?: (data: {
    telegram: TelegramWidgetUser;
    phone?: string;
    rememberMe: boolean;
  }) => void;
  onFetchTelegramConfig?: () => Promise<{ enabled: boolean; username: string | null }>;
  error?: string | null;
  loading?: boolean;
}

export const Contact10: React.FC<StudioAccessGateProps> = ({
  mode: externalMode,
  onModeChange,
  onSubmitLogin,
  onSubmitRegister,
  onSubmitTelegram,
  onFetchTelegramConfig,
  error,
  loading = false,
}) => {
  const [internalMode, setInternalMode] = useState<'login' | 'register'>('login');
  const mode = externalMode ?? internalMode;

  const handleSetMode = (m: 'login' | 'register') => {
    if (onModeChange) {
      onModeChange(m);
    } else {
      setInternalMode(m);
    }
  };

  // Registering asks for three fields where signing in asks for two, which on
  // a phone made this the taller of the two cards by enough to push the submit
  // button past the fold. So the register view gives up about a quarter of
  // its padding, gaps and field heights, and only on a phone; sign-in and
  // anything from md up keep the roomier metrics.
  const isRegister = mode === 'register';
  const cardPad = isRegister ? 'p-4 md:p-10' : 'p-6 sm:p-8 md:p-10';
  const formGap = isRegister ? 'space-y-2.5 md:space-y-4' : 'space-y-4';
  const labelGap = isRegister ? 'space-y-1 md:space-y-1.5' : 'space-y-1.5';
  const fieldPad = isRegister ? 'py-2.5 md:py-3.5' : 'py-3.5';
  const fieldInset = isRegister ? 'pl-10 md:pl-12' : 'pl-12';
  const iconInset = isRegister ? 'left-3.5 md:left-4' : 'left-4';
  const submitPad = isRegister ? 'py-3 md:py-4' : 'py-4';

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('@');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  // --- Telegram sign-in ---
  // The widget is a script hosted by Telegram that calls a function by a global
  // name, so a bridge has to sit on window before the script is injected. The
  // bot's token never reaches the browser: only its username does, and that
  // alone tells the widget which bot to render.
  const [tgUser, setTgUser] = useState<TelegramWidgetUser | null>(null);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [tgEnabled, setTgEnabled] = useState(false);

  useEffect(() => {
    (window as unknown as { onTelegramAuth?: (u: TelegramWidgetUser) => void }).onTelegramAuth = (user) => {
      setTgUser(user);
      setClientError(null);
    };
    return () => {
      delete (window as unknown as { onTelegramAuth?: (u: TelegramWidgetUser) => void }).onTelegramAuth;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!onFetchTelegramConfig) return;
      const cfg = await onFetchTelegramConfig();
      if (cancelled) return;
      // Telegram usernames are 5-32 chars of [A-Za-z0-9_]. The value comes from
      // our own config rather than the browser, but it is interpolated into
      // markup below, so it is not taken on trust.
      if (cfg.enabled && cfg.username && /^[A-Za-z0-9_]{5,32}$/.test(cfg.username)) {
        setTgUsername(cfg.username);
        setTgEnabled(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [onFetchTelegramConfig]);

  const activeError = error || clientError;
  // Once Telegram has vouched for the member, the name and the handle come from
  // the signature and must not be editable, and a password would be a second
  // way in that this account deliberately does not have.
  const viaTelegram = Boolean(tgUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    // A signed Telegram identity replaces the whole name/handle/password trio.
    if (viaTelegram && tgUser) {
      if (onSubmitTelegram) {
        onSubmitTelegram({
          telegram: tgUser,
          phone: phone.trim() || undefined,
          rememberMe,
        });
      }
      return;
    }

    let cleanTg = telegramId.trim();
    if (!cleanTg.startsWith('@')) {
      cleanTg = '@' + cleanTg;
    }

    if (password.trim().length < 9) {
      setClientError('Пароль должен содержать минимум 9 символов.');
      return;
    }

    if (mode === 'login') {
      if (cleanTg.length < 2) {
        setClientError('Укажите корректный Telegram ID.');
        return;
      }
      if (onSubmitLogin) {
        onSubmitLogin({
          telegramId: cleanTg,
          password: password.trim(),
          rememberMe,
        });
      }
    } else {
      const cleanName = fullName.trim();
      if (!cleanName || cleanName.split(/\s+/).length < 2) {
        setClientError('Пожалуйста, введите полное ФИО (не менее 2 слов).');
        return;
      }

      const cleanPhoneDigits = phone.replace(/[^\d]/g, '');
      if (cleanPhoneDigits.length < 10) {
        setClientError('Укажите корректный номер телефона (не менее 10 цифр).');
        return;
      }

      if (cleanTg.length < 2) {
        setClientError('Укажите корректный Telegram ID.');
        return;
      }

      if (onSubmitRegister) {
        onSubmitRegister({
          fullName: cleanName,
          phone: phone.trim(),
          telegramId: cleanTg,
          password: password.trim(),
          rememberMe,
        });
      }
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl border border-white/20 bg-stone-950/90 ${cardPad} text-stone-100 shadow-2xl backdrop-blur-2xl relative overflow-hidden font-sans`}>
      {/* Studio Background Accents & Waveform Grid */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white mb-6">
        Вход для звукорежиссеров
      </h2>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-white/[0.06] border border-white/10 font-mono text-sm">
        <button
          type="button"
          onClick={() => handleSetMode('login')}
          className={`py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'login'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Вход</span>
        </button>
        <button
          type="button"
          onClick={() => handleSetMode('register')}
          className={`py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'register'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Регистрация</span>
        </button>
      </div>

      {/* Active Error Alert */}
      {activeError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug font-medium">{activeError}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={`${formGap} font-sans`}>
        {/* Telegram first, because for a new member it replaces three of the
            four fields below. Rendered in register only: signing in is by
            handle and password, and this path creates the account. */}
        {mode === 'register' && tgEnabled && !viaTelegram && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 font-mono uppercase tracking-wider text-xs text-stone-400">
              <span className="h-px flex-1 bg-white/10" />
              или
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex justify-center">
              <div
                className="[&_script]:!m-0"
                dangerouslySetInnerHTML={{
                  __html:
                    `<script async src="https://telegram.org/js/telegram-widget.js?22"` +
                    ` data-telegram-login="${tgUsername}" data-size="large" data-radius="16"` +
                    ` data-userpic="true" data-onauth="onTelegramAuth(user)"><\/script>`,
                }}
              />
            </div>
          </div>
        )}

        {/* What Telegram vouched for. Read-only on purpose: the server derives
            the handle and the name from the signature, so editing them here
            would only be discarded. */}
        {mode === 'register' && viaTelegram && (
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center gap-3">
            <BadgeCheck className="w-6 h-6 text-cyan-300 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white truncate">
                {[tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ')}
              </div>
              <div className="font-mono text-xs text-cyan-200/80 truncate">
                {tgUser?.username ? `@${tgUser.username}` : `id ${tgUser?.id}`}
                <span className="text-stone-400"> · подтверждено Telegram</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTgUser(null);
                setClientError(null);
              }}
              className="text-xs font-mono text-stone-400 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer"
            >
              Сменить
            </button>
          </div>
        )}

        {mode === 'register' && (
          <>
            {/* Field: Full Name / ФИО */}
            {!viaTelegram && (
            <div className={labelGap}>
              <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
                ФИО (Полное имя):
              </label>
              <div className="relative">
                <User className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
                <input
                  type="text"
                  required
                  placeholder="Иванова Анна Сергеевна"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setClientError(null);
                  }}
                  className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base transition-colors`}
                />
              </div>
            </div>
            )}

            {/* Field: Phone Number */}
            <div className={labelGap}>
              <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
                {viaTelegram ? 'Номер телефона (для связи по заказу):' : 'Номер Телефона:'}
              </label>
              <div className="relative">
                <Phone className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
                <input
                  type="tel"
                  // Not required on the Telegram path: a member who already has
                  // an account is let straight in, and the server only demands
                  // the number when it is about to create the account.
                  required={!viaTelegram}
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setClientError(null);
                  }}
                  className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base transition-colors`}
                />
              </div>
            </div>
          </>
        )}

        {/* Field: Telegram ID */}
        {!viaTelegram && (
        <div className={labelGap}>
          <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
            Telegram ID:
          </label>
          <div className="relative">
            <Send className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
            <input
              type="text"
              required
              placeholder="@username"
              value={telegramId}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith('@') && val.length > 0) {
                  val = '@' + val;
                }
                setTelegramId(val);
                setClientError(null);
              }}
              className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base font-mono transition-colors`}
            />
          </div>
        </div>
        )}

        {/* Field: Password. Hidden on the Telegram path: the account stores a
            random secret nobody chose, so asking for one here would only
            produce a password that could never be used. */}
        {!viaTelegram && (
        <div className={labelGap}>
          <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
            Пароль (мин. 9 символов):
          </label>
          <div className="relative">
            <Lock className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
            <input
              type="password"
              required
              minLength={9}
              placeholder="•••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClientError(null);
              }}
              className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base font-mono transition-colors`}
            />
          </div>
        </div>
        )}

        {/* Remember Me Checkbox */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-3 text-sm text-stone-300 hover:text-white cursor-pointer select-none transition-colors"
          >
            {rememberMe ? (
              <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-500 shrink-0" />
            )}
            <span className="font-medium">Запомнить меня</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`liquid-glass w-full ${submitPad} rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40`}
          >
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>
              {loading
                ? 'Обработка доступа...'
                : mode === 'login'
                ? 'Войти в студию'
                : viaTelegram
                ? 'Войти через Telegram'
                : 'Зарегистрироваться как звукорежиссер'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
