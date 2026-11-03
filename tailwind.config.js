/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#F57C00',
          50: '#FFF3E0',
          100: '#FFE0B2',
          500: '#F57C00',
          600: '#EF6C00',
          700: '#E65100',
        },
        civicGreen: {
          DEFAULT: '#1B5E20',
          50: '#E8F5E9',
          100: '#C8E6C9',
          600: '#2E7D32',
          700: '#1B5E20',
        },
        surface: {
          bg: '#FAF8F5',
          card: '#FFFDF9',
          border: '#EADCC9',
        },
        ink: {
          DEFAULT: '#1E1E1E',
          muted: '#545454',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
