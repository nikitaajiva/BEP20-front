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
        primary: '#FFB800',    /* Logo Flame Gold  */
        secondary: '#FF6200',  /* Logo Fire Orange */
        ember: '#CC4400',      /* Deep Flame       */
        track: '#00e676',      /* Racing Green     */
      }
    },
  },
  plugins: [],
}
