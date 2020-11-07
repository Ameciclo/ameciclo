// for transpiling all ESM @fullcalendar/* packages
// also, for piping fullcalendar thru babel (to learn why, see babel.config.js)
const withTM = require("next-transpile-modules")(["@fullcalendar"]);
const withPlugins = require("next-compose-plugins");
const optimizedImages = require("next-optimized-images");

module.exports = withPlugins([withTM, optimizedImages], {
  target: "serverless",
  images: {
    domains: ["cms.ameciclo.org"],
  },
});
