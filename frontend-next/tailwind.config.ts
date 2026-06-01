/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'lp-bg': 'var(--lp-bg)',
        'lp-text': 'var(--lp-text)',
        'lp-accent': 'var(--lp-accent)',
        'lp-accent-dark': 'var(--lp-accent-dark)',
        'lp-accent-light': 'var(--lp-accent-light)',
        'lp-accent-faint': 'var(--lp-accent-faint)',
        'lp-muted': 'var(--lp-muted)',
        'lp-surface': 'var(--lp-surface)',
        'lp-border': 'var(--lp-border)',
      }
    },
  },
  plugins: [],
};
