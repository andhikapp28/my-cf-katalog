import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy pragmatis untuk Next.js App Router + Tailwind.
 *
 * - `script-src`/`style-src` butuh `'unsafe-inline'` karena Next menyisipkan
 *   script bootstrap/hydration & style inline tanpa nonce. `'unsafe-eval'`
 *   hanya diaktifkan di dev (dibutuhkan React Refresh/HMR).
 * - `img-src https:` sengaja lebar: banner event & image produk memakai URL
 *   sembarang yang diketik user dan dirender langsung di browser (bukan proxy).
 * - `connect-src` menambahkan ws/wss di dev agar HMR tidak diblokir.
 * - `frame-ancestors 'none'` menggantikan/mendampingi X-Frame-Options.
 *
 * Batasan: karena tanpa nonce, `'unsafe-inline'` pada script tetap dibutuhkan
 * sehingga CSP ini "moderat", bukan strict. Peningkatan ke nonce-based CSP
 * memerlukan middleware dan di luar scope sprint ini.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  },
  // HSTS hanya berdampak di HTTPS (browser mengabaikannya di http/localhost),
  // jadi aman disertakan selalu dan aktif otomatis di produksi.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  }
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Selaras dengan limit upload blob 5MB di lib/blob.ts, plus overhead
      // encoding multipart/form-data (~sedikit di atas ukuran file).
      bodySizeLimit: "6mb"
    }
  },
  images: {
    // Image optimizer hanya boleh mem-proxy host tepercaya (Vercel Blob).
    // Gambar dari URL sembarang milik user (banner event, floor map seed,
    // image produk) dirender dengan prop `unoptimized`/`<img>` biasa sehingga
    // di-fetch langsung oleh browser, BUKAN oleh server — menutup celah
    // open image proxy / SSRF tanpa merusak tampilan.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
