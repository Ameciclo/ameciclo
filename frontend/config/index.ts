const dev = process.env.NODE_ENV !== "production";
export const server = dev
  ? "https://cms.ameciclo.org"
  : "http://localhost:1337";