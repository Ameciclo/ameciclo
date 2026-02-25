import { AlertTriangle, Info, Mail } from 'lucide-react';
import { Link, useLocation } from '@remix-run/react';

export const MapboxKeyWarning = () => {
    const location = useLocation();
    const currentPage = location.pathname;
    const errorMessage = encodeURIComponent(`Erro no mapa da página: ${currentPage}\n\nDescrição: A chave de acesso do serviço de mapas não está configurada.`);
    const subject = encodeURIComponent('Erro Técnico - Mapa não carrega');
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Problemas Técnicos com o Mapa
                        </h3>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Não foi possível carregar o mapa interativo no momento devido a problemas de configuração técnica.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-blue-900">
                                    Mais informações
                                </p>
                                <p className="text-sm text-blue-800">
                                    A chave de acesso do serviço de mapas não está configurada. 
                                    Entre em contato com o administrador do sistema.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Link 
                        to={`/contato?subject=${subject}&message=${errorMessage}`}
                        className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        Entrar em Contato
                    </Link>
                    
                    <div className="pt-2">
                        <p className="text-sm text-gray-500 text-center">
                            Pedimos desculpas pelo inconveniente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
