/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mona Sans', 'Hanken Grotesk', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Mona Sans', 'Hanken Grotesk', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Semantic tokens from the Dribbble spec.
        ink: '#0d0c22', // primary text / dark surfaces
        muted: '#524b63', // secondary text
        mist: '#ecebf0', // raised / alternate surface
      },
      borderRadius: {
        pill: '50px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(13 12 34 / 0.04), 0 10px 30px -12px rgb(13 12 34 / 0.12)',
        card: '0 2px 4px rgb(13 12 34 / 0.04), 0 18px 40px -16px rgb(13 12 34 / 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
