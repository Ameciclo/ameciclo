import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateAssessmentSearch } from "~/lib/assessment-search";

// The original opened the form from here, reading the chosen structure from the
// session. The structure is in the URL now and the form has its own route
// (/avaliacao/formulario-ideciclo/$segmentId), so this goes where the choice is made.
export const Route = createFileRoute("/avaliacao/avaliar-estrutura")({
  validateSearch: validateAssessmentSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/avaliacao/escolher-estrutura", search, replace: true });
  },
});
