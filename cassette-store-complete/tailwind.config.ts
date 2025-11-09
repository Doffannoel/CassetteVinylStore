import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#F7F4EE',      // Putih krem lembut
          DEFAULT: '#F7F4EE',
        },
        accent: {
          gold: '#B89C4D',    // Gold-mustard untuk buttons
          hover: '#D2C49C',   // Gold terang untuk hover
          DEFAULT: '#B89C4D',
        },
        text: {
          primary: '#1A1A1A', // Hitam pekat untuk headers
          body: '#3C3C3C',    // Abu tua untuk body text
          link: '#4B4B4B',    // Abu gelap untuk links
        },
        neutral: {
          card: '#E5E3DE',    // Abu muda-krem untuk cards
          divider: '#E5E3DE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
