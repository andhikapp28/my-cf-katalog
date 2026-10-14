"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, WifiOff, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check dismissal cooldown (7 days)
    const dismissedUntil = localStorage.getItem("comipocket_pwa_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Capture Chromium install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If on iOS and not standalone, show educational install guidance after a short delay
    let iosTimer: NodeJS.Timeout | null = null;
    if (isIosDevice && !isStandaloneMode) {
      iosTimer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Dismiss for 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("comipocket_pwa_dismissed_until", String(Date.now() + sevenDaysMs));
  };

  if (!showBanner || isStandalone) return null;

  return (
    <aside
      aria-label="Panduan Pasang Aplikasi PWA"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 rounded-2xl sm:rounded-3xl border border-[#D6F834]/40 bg-[#111215] p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#D6F834] text-[#111215] shrink-0 shadow-xs">
            <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D6F834]">
              <WifiOff className="h-3 w-3" />
              <span>OFFLINE READY · ICE BSD</span>
            </div>
            <h3 className="font-[var(--font-display)] text-base sm:text-lg font-black uppercase tracking-tight text-white leading-tight">
              PASANG COMIPOCKET KE HOME SCREEN
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Tutup rekomendasi install"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed font-normal">
        {isIos ? (
          <span>
            Buka menu <strong className="text-white">Bagikan</strong> (<Share2 className="inline h-3 w-3 mx-0.5" />) di Safari, lalu pilih <strong className="text-white">&ldquo;Tambahkan ke Layar Utama&rdquo;</strong> untuk akses denah &amp; wishlist tanpa sinyal.
          </span>
        ) : (
          "Simpan ke layar utama smartphone agar denah hall ICE BSD, nomor booth, dan katalog karya dapat dibuka mulus tanpa sinyal."
        )}
      </p>

      {!isIos && deferredPrompt && (
        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#D6F834] px-4 py-2.5 font-mono text-xs font-black uppercase text-[#111215] shadow-md transition hover:bg-[#cbf128] active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Pasang Sekarang</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl border border-white/15 px-3 py-2.5 font-mono text-xs font-bold uppercase text-zinc-300 hover:bg-white/10 transition"
          >
            Nanti
          </button>
        </div>
      )}
    </aside>
  );
}
