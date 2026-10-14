/**
 * Service worker hand-rolled (tanpa Workbox/next-pwa) untuk ComiPocket.
 *
 * Strategi:
 * - Cache-first untuk asset statis Next (`/_next/static/*`, JS/CSS/font)
 *   dengan proteksi hanya menyimpan status 200 yang valid.
 * - Stale-while-revalidate untuk gambar (produk/floor map/banner event).
 * - Network-first untuk halaman HTML publik ("/", "/events", "/circles", "/wishlist"):
 *   Saat ONLINE: selalu menarik HTML mutakhir yang sinkron dengan chunk hashes server.
 *   Saat OFFLINE (di venue hall ICE BSD tanpa sinyal): otomatis menyajikan halaman dari cache.
 */

const CACHE_VERSION = "v10";
const STATIC_CACHE = `comipocket-static-${CACHE_VERSION}`;
const PAGES_CACHE = `comipocket-pages-${CACHE_VERSION}`;
const IMAGE_CACHE = `comipocket-images-${CACHE_VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE];

const PUBLIC_PAGE_PATTERNS = [
  /^\/$/,
  /^\/events(\/.*)?$/,
  /^\/circles(\/.*)?$/,
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
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !KNOWN_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
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
    // Hindari menyimpan respons fallback teks/404 ke dalam static chunk cache
    const contentType = response.headers.get("content-type") || "";
    if (
      request.url.endsWith(".js") &&
      !contentType.includes("javascript") &&
      !contentType.includes("octet-stream")
    ) {
      return response;
    }
    if (request.url.endsWith(".css") && !contentType.includes("css")) {
      return response;
    }
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch {
    // Jaringan gagal (offline / sinyal blackout di dalam hall) -> gunakan cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === "opaque")) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => undefined);

    if (cached) {
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

  // 1. Static Next.js Chunks (JS/CSS)
  if (isSameOrigin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. Images (stale-while-revalidate for fast rendering)
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // 3. HTML Pages (Network-First with Offline Cache Fallback)
  if (isSameOrigin && PUBLIC_PAGE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request, PAGES_CACHE));
  }
});
