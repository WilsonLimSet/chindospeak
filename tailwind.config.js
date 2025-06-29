/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './language-configs/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chinese theme colors
        'cs-red': '#ef4444',
        'cs-salmon': '#ffa500',
        'cs-gray': '#f5f5f5',
        'cs-yellow': {
          'DEFAULT': '#f59e0b',
          'light': '#fbbf24'
        },
        // Indonesian theme colors
        'id-blue': '#3b82f6',
        'id-cyan': '#06b6d4',
        'id-emerald': '#10b981',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}