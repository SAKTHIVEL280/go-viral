import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DEDBC8",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", '"Instrument Serif"', "serif"],
      },
      fontSize: {
        'xs':   ['13px', { lineHeight: '1.5' }],
        'sm':   ['15px', { lineHeight: '1.6' }],
        'base': ['17px', { lineHeight: '1.6' }],
        'lg':   ['19px', { lineHeight: '1.5' }],
        'xl':   ['21px', { lineHeight: '1.4' }],
        '2xl':  ['24px', { lineHeight: '1.3' }],
        '3xl':  ['30px', { lineHeight: '1.2' }],
        '4xl':  ['36px', { lineHeight: '1.1' }],
        '5xl':  ['48px', { lineHeight: '1.05' }],
        '6xl':  ['60px', { lineHeight: '1.0' }],
        '7xl':  ['72px', { lineHeight: '0.95' }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
