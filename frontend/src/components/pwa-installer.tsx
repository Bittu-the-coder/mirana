'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'mirana_pwa_prompt_dismissed';

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  const canInstall = useMemo(() => Boolean(deferredPrompt) && !hidden, [deferredPrompt, hidden]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === '1';
    if (wasDismissed) {
      setHidden(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    };

    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setHidden(false);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setHidden(true);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setHidden(true);
      localStorage.removeItem(DISMISS_KEY);
    }

    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setHidden(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!canInstall) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-[70] md:bottom-6',
        'w-[320px] rounded-xl border border-border bg-card p-4 shadow-xl',
      )}
    >
      <button
        type="button"
        onClick={dismissPrompt}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-semibold">Install Mirana</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add the app to your home screen for faster access and offline support.
      </p>
      <Button onClick={installApp} size="sm" className="mt-3 w-full">
        <Download className="mr-2 h-4 w-4" /> Install App
      </Button>
    </div>
  );
}
