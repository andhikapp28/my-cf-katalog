import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./actions/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        line: "hsl(var(--line))",
        brand: {
          50: "#fff8f1",
          100: "#ffedd4",
          500: "#d46a3a",
          600: "#b8562d",
          700: "#8f4424"
        },
        ink: {
          900: "#201815",
          700: "#4a3c36",
          500: "#79655c"
        }
      },
      boxShadow: {
        soft: "0 18px 40px -20px rgba(62, 38, 28, 0.32)"
      }
    }
  },
  plugins: []
};

export default config;


