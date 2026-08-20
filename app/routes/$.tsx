import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  loader: ({ params }) => {
    const path = params["_splat"] || "";
    if (path.startsWith(".well-known/")) {
      throw new Error("Not Found");
    }
    throw new Error("Not Found");
  },
});
