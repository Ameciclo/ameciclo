import { useEffect, useState } from 'react';
import { SERVERS } from '~/servers';

export function DebugPlanoDirector({ selectedPdc }: { selectedPdc: string[] }) {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const debug = async () => {
      const startTime = performance.now();
      console.log('🔍 DEBUG PLANO DIRETOR - Iniciando investigação...');
      
      // 1. Verificar URL da API
      console.log('1. URL da API:', SERVERS.EXECUCAO_CICLOVIARIA);
      
      // 2. Verificar filtros selecionados
      console.log('2. Filtros PDC selecionados:', selectedPdc);
      console.log('3. Inclui Plano Diretor?', selectedPdc.includes('Plano Diretor Cicloviário'));
      
      // 3. Testar API diretamente
      try {
        console.log('4. Testando API...');
        const fetchStart = performance.now();
        const response = await fetch(SERVERS.EXECUCAO_CICLOVIARIA);
        const fetchEnd = performance.now();
        const fetchTime = Math.round(fetchEnd - fetchStart);
        console.log('5. Status da resposta:', response.status, response.statusText);
        console.log('6. Tempo de resposta:', fetchTime + 'ms');
        
        if (response.ok) {
          const parseStart = performance.now();
          const data = await response.json();
          const parseEnd = performance.now();
          const parseTime = Math.round(parseEnd - parseStart);
          
          const cityData = data?.byCity?.['2611606'];
          const totalTime = Math.round(performance.now() - startTime);
          
          console.log('7. Tempo de parse JSON:', parseTime + 'ms');
          console.log('8. Tempo total:', totalTime + 'ms');
          console.log('9. Dados da cidade:', cityData);
          console.log('10. Número de features:', cityData?.features?.length || 0);
          
          setDebugInfo({
            apiUrl: SERVERS.EXECUCAO_CICLOVIARIA,
            selectedPdc,
            includesPlanoDirector: selectedPdc.includes('Plano Diretor Cicloviário'),
            apiStatus: response.status,
            dataType: cityData?.type,
            featuresCount: cityData?.features?.length || 0,
            firstFeature: cityData?.features?.[0],
            rawData: data,
            fetchTime,
            parseTime,
            totalTime,
            success: true
          });
        } else {
          setDebugInfo({
            apiUrl: SERVERS.EXECUCAO_CICLOVIARIA,
            selectedPdc,
            apiStatus: response.status,
            error: `${response.status}: ${response.statusText}`,
            success: false
          });
        }
      } catch (error) {
        console.error('9. Erro na API:', error);
        setDebugInfo({
          apiUrl: SERVERS.EXECUCAO_CICLOVIARIA,
          selectedPdc,
          error: error.message,
          success: false
        });
      }
    };
    
    debug();
  }, [selectedPdc]);

  return (
    <div className="fixed top-20 right-4 z-[80] bg-black text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 DEBUG PLANO DIRETOR</h3>
      <div className="space-y-1">
        <div>URL: {debugInfo.apiUrl}</div>
        <div>Filtros: {JSON.stringify(debugInfo.selectedPdc)}</div>
        <div>Inclui PD: {debugInfo.includesPlanoDirector ? '✅' : '❌'}</div>
        <div>API Status: {debugInfo.apiStatus}</div>
        {debugInfo.success ? (
          <>
            <div>Tipo: {debugInfo.dataType}</div>
            <div>Features: {debugInfo.featuresCount}</div>
            {debugInfo.fetchTime && (
              <>
                <div>Fetch: {debugInfo.fetchTime}ms</div>
                <div>Parse: {debugInfo.parseTime}ms</div>
                <div>Total: {debugInfo.totalTime}ms</div>
                {debugInfo.totalTime > 3000 && (
                  <div className="text-red-400">⚠️ Muito lento!</div>
                )}
                {debugInfo.totalTime > 1000 && debugInfo.totalTime <= 3000 && (
                  <div className="text-yellow-400">⚠️ Lento</div>
                )}
              </>
            )}
            {debugInfo.featuresCount === 0 && (
              <div className="text-yellow-400">⚠️ API vazia - sem dados</div>
            )}
            <div className="text-green-400">✅ API OK</div>
            {debugInfo.rawData && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-400">Ver dados brutos</summary>
                <pre className="text-xs mt-1 max-h-32 overflow-auto">
                  {JSON.stringify(debugInfo.rawData, null, 2)}
                </pre>
              </details>
            )}
          </>
        ) : (
          <div className="text-red-400">❌ {debugInfo.error}</div>
        )}
      </div>
    </div>
  );
}