import type { ErrorComponentProps } from "@tanstack/react-router";

/**
 * Shown when no calendar could be loaded. It never prints the error: the real
 * cause is logged on the server (see `fetchAgenda`), and the message that
 * reaches the browser is deliberately generic.
 */
export function AgendaError({ reset }: ErrorComponentProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div role="alert" className="mx-auto max-w-xl rounded-lg border border-gray-200 p-6 text-center">
        <h2 className="text-xl font-semibold">Não conseguimos carregar a agenda agora</h2>
        <p className="mt-2 text-sm text-gray-600">
          Tente de novo em instantes. Se o problema continuar, avise a gente.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-ameciclo px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Tentar novamente
          </button>
          <a
            href="/contato"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Falar com a Ameciclo
          </a>
        </div>
      </div>
    </div>
  );
}
