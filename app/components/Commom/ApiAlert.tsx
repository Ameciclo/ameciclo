import { useLocation } from '@remix-run/react';
import { useApiStatus } from '~/contexts/ApiStatusContext';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function ApiAlert() {
  const { isApiDown, apiErrors, clearErrors } = useApiStatus();
  const location = useLocation();
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Limpar erros ao trocar de página
    setDismissed(false);
  }, [location.pathname]);
  
  useEffect(() => {
    if (showDetails && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          setShowDetails(false);
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [showDetails]);
  

  
  const generateErrorReport = () => {
    const errorDetails = `RELATÓRIO DE ERRO AUTOMÁTICO\n\nPágina: ${location.pathname}\nHorário: ${new Date().toLocaleString('pt-BR')}\n\nAPIs com falha:\n${apiErrors.map(error => `- ${error.url}\n  Erro: ${error.error}\n  Página: ${error.page}\n  Horário: ${error.timestamp}`).join('\n\n')}\n\nEmail (obrigatório):\n\nTelefone (opcional):\n\nInformações adicionais (opcional):`;
    return encodeURIComponent(errorDetails);
  };
  
  // Não mostrar o alerta nas páginas de dados
  if (location.pathname.startsWith('/dados')) {
    return null;
  }

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
      
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowDetails(false)}
        >
          <div 
            ref={modalRef}
            className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="error-dialog-title"
          >
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            
            <h3 id="error-dialog-title" className="text-lg font-semibold mb-4 text-gray-900 pr-8">Detalhes do Erro</h3>
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
                      <div key={index} className="border-l-4 border-red-400 pl-3 py-2 bg-red-50">
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
            <div className="flex justify-end mt-6">
              <a 
                href={`/contato?message=${generateErrorReport()}&subject=${encodeURIComponent('Aviso de erro via página de contato - Ver detalhes do Erro')}`}
                className="font-bold text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Avisar desenvolvedores
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}