import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Contact10, type TelegramWidgetUser } from '../../components/ui/contact-10';
import { X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAppStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useAppStore((state) => state.closeAuthModal);
  const authModalContext = useAppStore((state) => state.authModalContext);
  const loginWithApi = useAppStore((state) => state.loginWithApi);
  const registerWithApi = useAppStore((state) => state.registerWithApi);
  const loginWithTelegram = useAppStore((state) => state.loginWithTelegram);
  const fetchTelegramConfig = useAppStore((state) => state.fetchTelegramConfig);
  const placeOrder = useAppStore((state) => state.placeOrder);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (data: { telegramId: string; password: string; rememberMe: boolean }) => {
    setError(null);
    setLoading(true);
    const result = await loginWithApi(data);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Ошибка входа в студию.');
      return;
    }

    if (authModalContext === 'checkout') {
      setTimeout(() => {
        placeOrder();
      }, 250);
    }
  };

  const handleRegister = async (data: {
    fullName: string;
    phone: string;
    telegramId: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setError(null);
    setLoading(true);
    const result = await registerWithApi(data);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Ошибка регистрации.');
      return;
    }

    if (authModalContext === 'checkout') {
      setTimeout(() => {
        placeOrder();
      }, 250);
    }
  };

  // fetchTelegramConfig is a zustand action, so its reference survives renders
  // and the form fetches the bot username once.

  const handleTelegram = async (data: {
    telegram: TelegramWidgetUser;
    phone?: string;
    rememberMe: boolean;
  }) => {
    setError(null);
    setLoading(true);
    const result = await loginWithTelegram(data);
    setLoading(false);

    if (!result.success) {
      // The server asks for a number only when it is about to create the
      // account, and the field for it lives on the registration tab. Moving
      // there keeps the confirmed Telegram identity, which stays in the form,
      // so only the number is left to type.
      if (result.needsPhone) {
        setMode('register');
        return;
      }
      setError(result.error || 'Ошибка входа через Telegram.');
      return;
    }

    if (authModalContext === 'checkout') {
      setTimeout(() => {
        placeOrder();
      }, 250);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise"
    >
      <div className="relative w-full max-w-xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contact 10 Block */}
        <Contact10
          mode={mode}
          onModeChange={(m) => {
            setMode(m);
            setError(null);
          }}
          onSubmitLogin={handleLogin}
          onSubmitRegister={handleRegister}
          onSubmitTelegram={handleTelegram}
          onFetchTelegramConfig={fetchTelegramConfig}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  );
};
