/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          pink: {
            500: '#EC4899',
          },
          blue: {
            500: '#3B82F6',
            600: '#2563EB',
          },
          gray: {
            100: '#F9FAFB',
            200: '#E5E7EB',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2A44',
          },
        },
      },
    },
    plugins: [],
  }