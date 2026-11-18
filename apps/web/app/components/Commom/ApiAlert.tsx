import { useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ameciclo/ui/components/dialog';
import { useApiStatus } from '~/contexts/ApiStatusContext';

export function ApiAlert() {
  const { isApiDown, apiErrors } = useApiStatus();
  const location = useRouterState({ select: (s) => s.location });
  const [showDetails, setShowDetails] = useState(false);
  // O aviso fechado volta na página seguinte: guardamos em qual página ele foi fechado.
  const [dismissedOn, setDismissedOn] = useState<string | null>(null);

  const generateErrorReport = () => {
    const errorDetails = `RELATÓRIO DE ERRO AUTOMÁTICO\n\nPágina: ${location.pathname}\nHorário: ${new Date().toLocaleString('pt-BR')}\n\nAPIs com falha:\n${apiErrors.map(error => `- ${error.url}\n  Erro: ${error.error}\n  Página: ${error.page}\n  Horário: ${error.timestamp}`).join('\n\n')}\n\nEmail (obrigatório):\n\nTelefone (opcional):\n\nInformações adicionais (opcional):`;
    return encodeURIComponent(errorDetails);
  };

  if (!isApiDown || dismissedOn === location.pathname) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-90">
        <div className="pointer-events-auto fixed left-1/2 top-16 flex w-fit -translate-x-1/2 items-center gap-3 rounded-lg bg-orange-500 px-6 py-2 text-center text-white shadow-lg">
          <p className="text-sm">
            Esta página está sofrendo instabilidade agora.{' '}
            <button type="button" onClick={() => setShowDetails(true)} className="underline hover:no-underline">
              Ver detalhes do erro
            </button>
          </p>
          <button
            type="button"
            onClick={() => setDismissedOn(location.pathname)}
            className="text-lg leading-none opacity-70 transition-opacity hover:opacity-100"
            aria-label="Fechar aviso"
            title="Fechar aviso"
          >
            ×
          </button>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl overflow-y-auto">
          <DialogTitle className="pr-8 text-lg font-semibold text-gray-900">Detalhes do Erro</DialogTitle>
          <DialogDescription className="sr-only">Quais serviços falharam nesta página e como avisar a equipe</DialogDescription>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p><strong>Página atual:</strong> {location.pathname}</p>
              <p><strong>Horário:</strong> {new Date().toLocaleString('pt-BR')}</p>
            </div>

            {apiErrors.length > 0 ? (
              <div>
                <h4 className="mb-2 font-semibold">APIs com falha:</h4>
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {apiErrors.map((error) => (
                    <div key={`${error.url}-${error.timestamp}`} className="border-l-4 border-red-400 bg-red-50 py-2 pl-3">
                      <p><strong>API:</strong> {error.url}</p>
                      <p><strong>Erro:</strong> {error.error}</p>
                      <p><strong>Página:</strong> {error.page}</p>
                      <p><strong>Horário:</strong> {error.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Nenhum erro específico registrado.</p>
            )}
          </div>
          <div className="flex justify-end">
            <a
              href={`/contato?message=${generateErrorReport()}&subject=${encodeURIComponent('Aviso de erro via página de contato - Ver detalhes do Erro')}`}
              className="rounded-sm font-bold text-blue-600 underline hover:text-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              Avisar desenvolvedores
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
