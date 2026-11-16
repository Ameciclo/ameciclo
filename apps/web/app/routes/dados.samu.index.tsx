import { createFileRoute, redirect } from "@tanstack/react-router";

// The page used to live at /dados/samu: keep old links (and their ?cidade=&de=&ate=) working.
export const Route = createFileRoute("/dados/samu/")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/dados/chamados-de-sinistros${location.searchStr}${location.hash ? `#${location.hash}` : ""}`, statusCode: 301 });
  },
});
