import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { Toaster } from "sonner";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap"
});

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "ComiPocket · Comifuro Event Companion & Catalog",
  description: "Community catalog, floor map route, wishlist, and cash-prepared spending tracker for Comic Frontier (Comifuro).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ComiPocket · Comifuro"
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

// `themeColor` (dan viewport lainnya) wajib lewat export `viewport` terpisah
// di Next 15 App Router: menaruhnya di `metadata` sudah deprecated/diabaikan.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d46a3a"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-[var(--font-sans)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-[#111215] focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:font-bold focus:uppercase focus:text-white focus:outline-none focus:ring-2 focus:ring-[#D6F834] focus:shadow-2xl"
        >
          Menuju ke konten utama
        </a>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Toaster richColors position="top-right" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
