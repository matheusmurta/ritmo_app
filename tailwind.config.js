const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        card: c('card'),
        ink: c('ink'),
        muted: c('muted'),
        line: c('line'),
        brand: c('brand'),
        deep: c('deep'),
        violet: c('violet'),
        lilac: c('lilac'),
        mint: c('mint'),
        amber: c('amber'),
        sky: c('sky'),
        rose: c('rose'),
        pink: c('pink'),
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '20px', xl2: '24px' },
      boxShadow: {
        card: '0 1px 2px rgb(23 35 59 / 0.04), 0 8px 24px -12px rgb(23 35 59 / 0.12)',
        pop: '0 20px 40px -16px rgb(59 91 255 / 0.45)',
      },
      maxWidth: { app: '1180px' },
    },
  },
  plugins: [],
}
