/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        deepSea: '#0F2B46',
        emerald: '#10B981',
        amber: '#F59E0B',
        coral: '#EF4444',
        slate: '#64748B',
        lightBlue: '#F1F5F9',
      },
      fontFamily: {
        sans: ['DM Sans', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
