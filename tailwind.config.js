/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: '#1E7F4F',
        'primary-hover': '#16633D',
        'primary-dark': '#16623F',
        'primary-light': '#13ec80',
        accent: '#2FA36B',

        // Base
        secondary: '#0F1F2D',
        info: '#1F3A5F',
        warning: '#F2C94C',
        danger: '#D64545',
        critical: '#D64545',

        // Background / surface
        'background-light': '#F6F8F7',
        'background-dark': '#102219',
        'surface-light': '#FFFFFF',
        'surface-dark': '#1A2C24',

        // Text / borders
        'text-main': '#111814',
        'text-secondary': '#4C9A73',
        'text-muted': '#618975',
        'neutral-border': '#E5E7EB',
        'neutral-gray': '#6b7280',

        // Se quiser manter aliases usados nas telas legadas:
        'alert-error': '#D64545',
        'alert-warning': '#F2C94C',
        'alert-yellow': '#F2C94C',
        'alert-bg': '#FFFBE6',
        'alert-text': '#B29400',
        'primary-green': '#1E7F4F',
        'dark-blue': '#0F1F2D',
        'white-bg': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
