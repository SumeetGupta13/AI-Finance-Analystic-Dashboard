module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stockiq: {
          900: '#0A0A0A',
          800: '#111111',
          indigo: '#5B46FF',
          emerald: '#00E396'
        }
      }
    }
  },
  plugins: [],
};
