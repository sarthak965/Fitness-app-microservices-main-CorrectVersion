/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213d',
        cloud: '#f4f7fb',
        mist: '#d7e4ff',
        cyan: '#4bc8ff',
        peach: '#ffb48a',
        mint: '#73e2c5',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 24px 80px rgba(52, 91, 255, 0.16)',
        card: '0 18px 50px rgba(17, 24, 39, 0.08)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(20, 33, 61, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 33, 61, 0.06) 1px, transparent 1px)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
