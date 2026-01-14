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
    extend: {},
  },
  plugins: [],
}
