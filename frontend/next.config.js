const withTM = require("next-transpile-modules")([
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/list",
  "@fullcalendar/react",
]);

module.exports = withTM({
  images: {
    domains: ["res.cloudinary.com"],
  },
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: false,
  },
});
