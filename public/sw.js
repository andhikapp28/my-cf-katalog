/**
 * Service worker hand-rolled (tanpa Workbox/next-pwa) untuk ComiPocket.
 *
 * next-pwa TIDAK dipakai: proyek ini pakai Next 15 App Router, dan next-pwa
 * (dibangun di atas workbox-webpack-plugin) punya riwayat kompatibilitas yang
 * kurang baik dengan App Router (banyak isu terbuka soal precache manifest
 * yang tidak sinkron dengan RSC streaming/route groups App Router, dan
 * proyeknya sendiri jarang di-update). Kebutuhan caching di sini juga cukup
 * sederhana (cache-first utk asset statis, stale-while-revalidate utk
 * beberapa halaman publik + gambar) sehingga implementasi manual ~100 baris
 * ini lebih mudah dipahami/dirawat daripada menambah dependency besar.
 *
 * Strategi:
 * - Cache-first untuk asset statis Next (`/_next/static/*`, termasuk JS/CSS/
 *   font — semua sudah content-hashed di nama file sehingga aman di-cache
 *   permanen, tidak akan pernah "basi").
 * - Stale-while-revalidate untuk gambar (produk/floor map/banner event) —
 *   baik yang same-origin maupun cross-origin (banner/produk dari URL bebas
 *   yang diketik user), supaya visual tetap muncul walau sinyal jelek saat
 *   event, tapi tetap ter-refresh di background saat online.
 * - Stale-while-revalidate untuk halaman PUBLIK yang relevan dipakai offline
 *   saat event: "/", "/events", "/events/:slug", "/products", "/products/:id",
 *   "/circles", "/circles/:id", "/maps", "/maps/:id", "/wishlist", "/docs".
 */

const CACHE_VERSION = "v4";
const STATIC_CACHE = `comipocket-static-${CACHE_VERSION}`;
const PAGES_CACHE = `comipocket-pages-${CACHE_VERSION}`;
const IMAGE_CACHE = `comipocket-images-${CACHE_VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE];

const PUBLIC_PAGE_PATTERNS = [
  /^\/$/,
  /^\/events(\/.*)?$/,
  /^\/products(\/.*)?$/,
  /^\/circles(\/.*)?$/,
  /^\/maps(\/.*)?$/,
  /^\/wishlist\/?$/,
  /^\/docs\/?$/
];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.status === 200) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
      .then((response) => {
        // Response `opaque` (cross-origin tanpa CORS, umum untuk banner/produk
        // image dari domain bebas) tidak bisa dicek `.ok`, tapi tetap aman
        // disimpan — browser sendiri yang membatasi ukuran/isi cache lintas asal.
        if (response && (response.ok || response.type === "opaque")) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => undefined);

    if (cached) {
      // Refresh di background, tapi langsung balas dari cache supaya instan.
      return cached;
    }

    const network = await networkFetch;
    if (network) {
      return network;
    }
  } catch {
    // Ignore cache error and fallback to direct fetch
  }

  return fetch(request).catch(() => Response.error());
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  if (isSameOrigin && PUBLIC_PAGE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
  }
});
