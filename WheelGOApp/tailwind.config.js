/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // <--- ADICIONE ISSO: Permite controlar o tema manualmente
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};