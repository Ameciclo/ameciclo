const dev = process.env.NODE_ENV !== "production";
export const server = dev
//  ? "http://localhost:1337"
//  : "https://cms.ameciclo.org";
  ? "https://cms.ameciclo.org"
  : "http://localhost:1337";