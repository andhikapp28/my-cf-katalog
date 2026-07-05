import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Konfigurasi Vitest minimal untuk unit test logika murni (validators, format,
 * utils). Alias `@/*` dipetakan manual ke root project agar tidak perlu
 * `vite-tsconfig-paths`. Plugin React dipakai HANYA untuk mentranspile JSX di
 * `lib/constants.tsx` (di-import tak langsung oleh `lib/validators.ts` lewat
 * `lib/constants`) — Vitest 4 memakai transformer oxc/rolldown yang tidak
 * menghormati opsi `esbuild.jsx` untuk file .tsx, jadi plugin resmi ini lebih
 * andal daripada mengandalkan opsi esbuild manual.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"]
  }
});
