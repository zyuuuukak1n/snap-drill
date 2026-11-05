import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFDF7',
        primary: {
          DEFAULT: '#FF9800',
          hover: '#F57C00',
          light: '#FFE082',
          yellow: '#FFB020',
          dark: '#E65100',
        },
        hanamaru: '#FF5252',
        success: '#4CAF50',
        subject: {
          japanese: '#E53935',
          'japanese-bg': '#FFEBEE',
          math: '#1E88E5',
          'math-bg': '#E3F2FD',
          science: '#43A047',
          'science-bg': '#E8F5E9',
          social: '#FB8C00',
          'social-bg': '#FFF3E0',
          english: '#8E24AA',
          'english-bg': '#F3E5F5',
        },
      },
      fontFamily: {
        rounded: ['"Zen Maru Gothic"', '"M PLUS Rounded 1c"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'toy-sm': '0 3px 0 0 rgba(0,0,0,0.15)',
        'toy': '0 5px 0 0 rgba(0,0,0,0.18)',
        'toy-lg': '0 8px 0 0 rgba(0,0,0,0.2)',
      },
      animation: {
        'bounce-short': 'bounce-short 0.5s ease-in-out 1',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        'bounce-short': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

