/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#E44D26',
          'orange-light': '#F06637',
          'orange-dark': '#C43D18',
          cream: '#FFE6BD',
          'cream-light': '#FFF3E0',
          dark: '#1A1A1A',
          muted: '#6B6B6B',
          light: '#FAFAF8',
          border: '#E8E4DC',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(26,26,26,0.06)',
        'card-hover': '0 8px 32px rgba(26,26,26,0.12)',
        modal: '0 24px 64px rgba(26,26,26,0.18)',
      },
    },
  },
  plugins: [],
}

