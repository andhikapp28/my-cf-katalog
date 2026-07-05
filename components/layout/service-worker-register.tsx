"use client";

import { useEffect } from "react";

/**
 * Registrasi service worker `/sw.js` setelah mount. Client component kecil
 * (bukan inline script) supaya konsisten dengan pola "no inline script tanpa
 * nonce" di CSP (lihat next.config.ts) dan supaya gagal-nya registrasi (mis.
 * browser lama tanpa dukungan service worker) tidak pernah melempar error
 * yang mengganggu render halaman.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Diam-diam gagal: PWA/offline cache adalah enhancement, bukan
      // requirement — kegagalan registrasi tidak boleh mengganggu pemakaian
      // normal aplikasi saat online.
    });
  }, []);

  return null;
}
