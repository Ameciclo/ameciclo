import { ErrorComponentProps } from "@tanstack/react-router";

/**
 * Shared skeleton shown while a route's loader is pending on client-side
 * navigation (not SSR — SSR always renders the full page). Use with
 * `pendingMs: 500` and `pendingMinMs: 800` to avoid flicker on fast loads.
 */
export function RouteLoading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-32 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
        <div className="h-64 rounded bg-gray-200" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Per-route error boundary. Keeps the navbar/footer and shows an inline
 * error with a retry button that re-runs just this route's loader.
 */
export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-semibold text-red-900">
          Não foi possível carregar esta página
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {message || "Um erro inesperado ocorreu."}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-ameciclo px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-ameciclo focus:ring-offset-2"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}
