import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

const DEFAULT_CACHE_CONTROL =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=600";

export default createStartHandler({
  handler: async (ctx) => {
    const response = await defaultStreamHandler(ctx);

    const pathname = new URL(ctx.request.url).pathname;
    const isAsset = /\.[a-z0-9]+$/i.test(pathname);
    const status = response.status;
    const isRedirect = status >= 300 && status < 400;
    const isError = status >= 400;

    if (!response.headers.has("Cache-Control")) {
      if (isError) {
        response.headers.set("Cache-Control", "no-store");
      } else if (!isAsset && !isRedirect) {
        response.headers.set("Cache-Control", DEFAULT_CACHE_CONTROL);
      }
    }

    return response;
  },
});
