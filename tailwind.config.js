/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        base: '#09090B',
        card: '#111113',
        input: '#18181B',
        accent: '#10B981',
        'accent-muted': 'rgba(16,185,129,0.15)',
        'accent-dim': 'rgba(16,185,129,0.08)',
        'index-blue': '#3B82F6',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted': '#52525B',
        border: '#27272A',
        'border-active': 'rgba(16,185,129,0.3)',
      },
    },
  },
  plugins: [],
};
