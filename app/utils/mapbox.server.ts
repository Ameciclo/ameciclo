import { env } from "./env.server";

export function getMapboxToken() {
  return env.MAPBOX_ACCESS_TOKEN;
}
