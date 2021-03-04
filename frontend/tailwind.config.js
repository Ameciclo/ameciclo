module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
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
    },
  },
  variants: {
    extend: {}
    },
  plugins: [],
};
