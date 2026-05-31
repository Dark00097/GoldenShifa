import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        amberGold: '#C48A2C',
        deepHoney: '#7A4616',
        cream: '#FFF7E8',
        pollen: '#F4C95D',
        leaf: '#476447',
        ink: '#24180F'
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 20px 60px rgba(122, 70, 22, 0.14)'
      }
    }
  },
  plugins: []
};

export default config;
