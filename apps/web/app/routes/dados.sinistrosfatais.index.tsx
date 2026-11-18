import { createFileRoute, redirect } from "@tanstack/react-router";

// O endereço antigo (sem hífen) continua valendo: leva para o atual.
export const Route = createFileRoute("/dados/sinistrosfatais/")({
  beforeLoad: () => {
    throw redirect({ to: "/dados/sinistros-fatais", statusCode: 301 });
  },
});
