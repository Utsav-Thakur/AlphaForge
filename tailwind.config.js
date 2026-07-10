/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg':          '#0c0c0f',   // Near black
        'bg-2':        '#111116',   // Slightly lighter
        'card':        '#16161d',   // Card background
        'card-2':      '#1c1c26',   // Elevated card
        'card-hover':  '#20202c',   // Hover state

        'teal':        '#00d4c8',   // Primary accent — electric teal
        'teal-2':      '#00b3a8',   // Darker teal
        'teal-glow':   '#00d4c820', // Teal with 12% opacity for glows
        'silver':      '#e8eaf0',   // Platinum silver — primary text
        'silver-2':    '#a8aab8',   // Secondary text
        'silver-3':    '#606270',   // Muted text
        'gold':        '#f0b429',   // Gold accent for highlights
        'gold-2':      '#d4991f',   // Deeper gold

        'profit':      '#00d084',   // Green profit
        'loss':        '#ff4560',   // Red loss
        'warning':     '#f0b429',   // Amber warning
        'info':        '#3b8cff',   // Blue info

        'border':      '#22222e',   // Subtle border
        'border-2':    '#2a2a3a',   // Stronger border
        'border-teal': '#00d4c830', // Teal border
      }
    },
  },
  plugins: [],
}
