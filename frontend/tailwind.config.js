// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',  // Custom primary color
        secondary: '#E0F2FF', // Custom secondary color
      },
      spacing: {
        '12': '3rem',  // Custom spacing size
        '18': '4.5rem', // Another custom spacing size
      },
    },
  },
  plugins: [],
};
