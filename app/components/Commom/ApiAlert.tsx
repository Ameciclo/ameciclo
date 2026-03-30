import { useRouterState } from '@tanstack/react-router';
import { useApiStatus } from '~/contexts/ApiStatusContext';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

export function ApiAlert() {
  const { isApiDown, apiErrors, clearErrors } = useApiStatus();
  const location = useRouterState({ select: (s) => s.location });
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Limpar erros ao trocar de página
    setDismissed(false);
  }, [location.pathname]);

  const generateErrorReport = () => {
    const errorDetails = `RELATÓRIO DE ERRO AUTOMÁTICO\n\nPágina: ${location.pathname}\nHorário: ${new Date().toLocaleString('pt-BR')}\n\nAPIs com falha:\n${apiErrors.map(error => `- ${error.url}\n  Erro: ${error.error}\n  Página: ${error.page}\n  Horário: ${error.timestamp}`).join('\n\n')}\n\nEmail (obrigatório):\n\nTelefone (opcional):\n\nInformações adicionais (opcional):`;
    return encodeURIComponent(errorDetails);
  };

  if (!isApiDown || dismissed) return null;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[90]">
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-fit bg-orange-500 text-white px-6 py-2 text-center rounded-lg shadow-lg relative pointer-events-auto">
          <p className="text-sm">
            Esta página está sofrendo instabilidade agora.{' '}
            <button
              onClick={() => setShowDetails(true)}
              className="underline hover:no-underline pointer-events-auto"
            >
              Ver detalhes do erro
            </button>
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-1 right-2 text-sm opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
            title="Fechar aviso"
          >
            ×
          </button>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent
          onClose={() => setShowDetails(false)}
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Detalhes do Erro</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-700 space-y-4">
            <div>
              <p><strong>Página atual:</strong> {location.pathname}</p>
              <p><strong>Horário:</strong> {new Date().toLocaleString('pt-BR')}</p>
            </div>

            {apiErrors.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-2">APIs com falha:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {apiErrors.map((error, index) => (
                    <Alert key={index} variant="destructive" className="border-l-4 border-red-400">
                      <AlertDescription>
                        <p><strong>API:</strong> {error.url}</p>
                        <p><strong>Erro:</strong> {error.error}</p>
                        <p><strong>Página:</strong> {error.page}</p>
                        <p><strong>Horário:</strong> {error.timestamp}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            ) : (
              <p>Nenhum erro específico registrado.</p>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <a
              href={`/contato?message=${generateErrorReport()}&subject=${encodeURIComponent('Aviso de erro via página de contato - Ver detalhes do Erro')}`}
            >
              <Button variant="link" className="font-bold">
                Avisar desenvolvedores
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
