// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['Retro', 'sans-serif'],
        singleday: ["Single Day", 'cursive'],
      },
      colors: {
        retroBg: '#BCD9D7',  // MEMORY X 텍스트 컬러
        baseBg: '#EBEBEB',   // 전체 배경 컬러
        outline: '#192E2F',  // MEMORY X 테두리 색
      },
      keyframes: {
        'fade-out': {
          '0%,70%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-out': 'fade-out 2s forwards ease-in',
        'fade-in': 'fade-in 0.8s forwards ease-out',
      },
    },
  },

  plugins: [],
};
