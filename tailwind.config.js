/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.html",
    "./src/components/**/*.{html,js}",
    "./src/js/**/*.js",
    // Nếu dùng root: 'src/pages', cần thêm path tương đối
    "./**/*.html",
    "../components/**/*.{html,js}",
    "../js/**/*.js",
  ],
  theme: {
    extend: {
       colors: {
        'primary': {
          white: '#FFFFFF',
          yellow: '#F9B200',
          'dark-blue': '#153898',
        },
        'secondary': {
          green: '#75C7A3',
          yellow: '#FFE293',
          'yellow-light': '#FEF9E3',
          blue: '#8ED8F8',
          'blue-light': '#E3F6FDFF',
        },
        'danger': {
          DEFAULT: '#DD2F2C',
          light: '#FFEBEEFF',
        },
      },
    },
  },
  plugins: [],
}
