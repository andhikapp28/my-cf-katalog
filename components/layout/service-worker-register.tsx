"use client";

import { useEffect } from "react";

/**
 * Registrasi service worker `/sw.js` setelah mount.
 * Dilengkapi proteksi:
 * 1. Di lingkungan dev/localhost: unregister service worker & bersihkan cache
 *    agar chunk HMR dan build baru tidak pernah tertimpa cache lama.
 * 2. Error recovery otomatis saat ChunkLoadError terdeteksi (reload mulus ke build terbaru).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // 1. Error boundary auto-recovery jika chunk lawas gagal dimuat (ChunkLoadError)
    const handleChunkLoadError = (e: PromiseRejectionEvent | ErrorEvent) => {
      const message =
        "reason" in e
          ? e.reason?.message || String(e.reason)
          : e.message || "";

      if (
        message &&
        (message.includes("ChunkLoadError") ||
          message.includes("Loading chunk") ||
          message.includes("is not a supported stylesheet MIME type"))
      ) {
        const reloadKey = `chunk_reload_${window.location.pathname}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "1");
          if ("caches" in window) {
            caches
              .keys()
              .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
              .finally(() => {
                location.reload();
              });
          } else {
            location.reload();
          }
        }
      }
    };

    window.addEventListener("unhandledrejection", handleChunkLoadError);
    window.addEventListener("error", handleChunkLoadError);

    // 2. Registrasi / Deregistrasi Service Worker
    if ("serviceWorker" in navigator) {
      if (isLocalhost) {
        // Pada localhost dev: unregister service worker dan hapus cache
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        // Pada production: daftarkan service worker
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleChunkLoadError);
      window.removeEventListener("error", handleChunkLoadError);
    };
  }, []);

  return null;
}
