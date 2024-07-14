module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  media: false,
  theme: {
    extend: {
      colors: {
        ameciclo: "#008080",
        amecicloTransparent: "rgba(0,128,128, .5)",
        ameciclo25: "rgba(0,128,128, .25)",
        ameciclo10: "rgba(0,128,128, .1)",
        gray100Transparent: "rgba(247, 250, 252, .85)",
      },
      gridTemplateColumns: {
        fill: "200px repeat(auto-fill, 1fr) 300px",
      },
      gridTemplateRows: {
        fill: "minmax(100px, auto)",
      },
      screens: {
        'xl': '1900px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
