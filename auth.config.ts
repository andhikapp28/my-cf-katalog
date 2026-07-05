import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  // Auth.js v5 menolak request dengan header Host yang tidak dikenal ("UntrustedHost")
  // kecuali `AUTH_URL` di-set atau deployment terdeteksi berjalan di Vercel. Aplikasi ini
  // self-hosted (next start, bukan Vercel) tanpa `AUTH_URL` tetap di .env, jadi tanpa
  // `trustHost: true` login gagal total di production build (`next start`) — termuat
  // saat menulis smoke test e2e (Sprint 2) yang menjalankan build produksi sungguhan.
  trustHost: true,
  pages: {
    signIn: "/admin/login"
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      if (pathname.startsWith("/admin/login")) {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "ADMIN";
      }

      return session;
    }
  }
};

export default authConfig;
