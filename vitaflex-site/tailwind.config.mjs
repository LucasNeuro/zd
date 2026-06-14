import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        eteg: {
          DEFAULT: '#1A5FFF',
          dark: '#0047CC',
          muted: '#5A7D9A',
          light: '#E8F0FF',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'monospace'],
      },
    },
  },
  plugins: [typography],
};
