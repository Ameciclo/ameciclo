import { useState } from "react";

interface InsightsPanelProps {
  summaryData: any;
  topViasData: any;
  historyData: any;
}

export default function InsightsPanel({ summaryData, topViasData, historyData }: InsightsPanelProps) {
  const [activeInsight, setActiveInsight] = useState<'concentration' | 'trends' | 'recommendations'>('concentration');

  // Calcular insights baseados nos dados
  const calculateInsights = () => {
    const insights = {
      concentration: {
        top10Percentage: topViasData.dados?.slice(0, 10).reduce((sum: number, via: any) => sum + via.percentual_total, 0) || 0,
        top5Percentage: topViasData.dados?.slice(0, 5).reduce((sum: number, via: any) => sum + via.percentual_total, 0) || 0,
        averageDensity: topViasData.dados?.reduce((sum: number, via: any) => sum + via.sinistros_por_km, 0) / (topViasData.dados?.length || 1) || 0,
        criticalVias: topViasData.dados?.filter((via: any) => via.sinistros_por_km >= 20).length || 0,
      },
      trends: {
        peakYear: historyData.evolucao?.reduce((max: any, year: any) => year.sinistros > (max?.sinistros || 0) ? year : max, null),
        averageGrowth: calculateYearlyGrowth(),
        seasonalPattern: calculateSeasonalPattern(),
        weekdayPattern: calculateWeekdayPattern(),
      }
    };

    return insights;
  };

  const calculateYearlyGrowth = () => {
    if (!historyData.evolucao || historyData.evolucao.length < 2) return 0;
    
    const years = historyData.evolucao.sort((a: any, b: any) => a.ano - b.ano);
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    
    if (firstYear.sinistros === 0) return 0;
    
    const totalGrowth = ((lastYear.sinistros - firstYear.sinistros) / firstYear.sinistros) * 100;
    const yearsDiff = lastYear.ano - firstYear.ano;
    
    return yearsDiff > 0 ? totalGrowth / yearsDiff : 0;
  };

  const calculateSeasonalPattern = () => {
    if (!historyData.evolucao || historyData.evolucao.length === 0) return null;
    
    const monthlyTotals = Array(12).fill(0);
    
    historyData.evolucao.forEach((year: any) => {
      if (year.meses) {
        Object.entries(year.meses).forEach(([month, count]) => {
          monthlyTotals[parseInt(month) - 1] += count as number;
        });
      }
    });
    
    const maxMonth = monthlyTotals.indexOf(Math.max(...monthlyTotals));
    const minMonth = monthlyTotals.indexOf(Math.min(...monthlyTotals));
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return {
      peak: monthNames[maxMonth],
      low: monthNames[minMonth],
      variation: ((Math.max(...monthlyTotals) - Math.min(...monthlyTotals)) / Math.max(...monthlyTotals)) * 100
    };
  };

  const calculateWeekdayPattern = () => {
    if (!historyData.evolucao || historyData.evolucao.length === 0) return null;
    
    const weekdayTotals = Array(7).fill(0);
    
    historyData.evolucao.forEach((year: any) => {
      if (year.dias_semana) {
        Object.entries(year.dias_semana).forEach(([day, count]) => {
          weekdayTotals[parseInt(day)] += count as number;
        });
      }
    });
    
    const maxDay = weekdayTotals.indexOf(Math.max(...weekdayTotals));
    const minDay = weekdayTotals.indexOf(Math.min(...weekdayTotals));
    
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return {
      peak: dayNames[maxDay],
      low: dayNames[minDay],
      weekdayAvg: weekdayTotals.slice(1, 6).reduce((sum, val) => sum + val, 0) / 5,
      weekendAvg: (weekdayTotals[0] + weekdayTotals[6]) / 2
    };
  };

  const insights = calculateInsights();

  const getRecommendations = () => {
    const recommendations = [];

    // Recomendações baseadas na concentração
    if (insights.concentration.top10Percentage > 50) {
      recommendations.push({
        type: 'priority',
        title: 'Foco nas Vias Críticas',
        description: `As 10 vias mais perigosas concentram ${insights.concentration.top10Percentage.toFixed(1)}% dos sinistros. Priorize intervenções nestas vias para máximo impacto.`,
        actions: ['Implementar lombadas eletrônicas', 'Aumentar fiscalização', 'Melhorar sinalização']
      });
    }

    // Recomendações baseadas na densidade
    if (insights.concentration.criticalVias > 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Vias com Densidade Crítica',
        description: `${insights.concentration.criticalVias} vias têm densidade crítica (≥20 sinistros/km). Necessitam intervenção imediata.`,
        actions: ['Reduzir velocidade máxima', 'Instalar radares', 'Revisar projeto viário']
      });
    }

    // Recomendações baseadas em tendências
    if (insights.trends.averageGrowth > 5) {
      recommendations.push({
        type: 'warning',
        title: 'Tendência de Crescimento',
        description: `Crescimento médio de ${insights.trends.averageGrowth.toFixed(1)}% ao ano indica necessidade de ação preventiva.`,
        actions: ['Campanhas educativas', 'Melhorar infraestrutura', 'Aumentar policiamento']
      });
    }

    // Recomendações sazonais
    if (insights.trends.seasonalPattern) {
      recommendations.push({
        type: 'seasonal',
        title: 'Padrão Sazonal',
        description: `Pico em ${insights.trends.seasonalPattern.peak}. Planeje ações preventivas específicas para este período.`,
        actions: ['Campanhas sazonais', 'Reforço operacional', 'Manutenção preventiva']
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Insights e Recomendações</h3>

      {/* Navegação dos insights */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'concentration', label: 'Concentração', icon: '📊' },
          { id: 'trends', label: 'Tendências', icon: '📈' },
          { id: 'recommendations', label: 'Recomendações', icon: '💡' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveInsight(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeInsight === tab.id
                ? 'bg-ameciclo text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo dos insights */}
      <div className="space-y-6">
        {activeInsight === 'concentration' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Análise de Concentração</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">🎯</span>
                  <span className="font-medium text-red-800">Top 5 Vias</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {insights.concentration.top5Percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-red-600">dos sinistros totais</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600">📍</span>
                  <span className="font-medium text-orange-800">Top 10 Vias</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {insights.concentration.top10Percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600">dos sinistros totais</div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-800">Vias Críticas</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {insights.concentration.criticalVias}
                </div>
                <div className="text-sm text-yellow-600">com densidade ≥20/km</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">📏</span>
                  <span className="font-medium text-blue-800">Densidade Média</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {insights.concentration.averageDensity.toFixed(1)}
                </div>
                <div className="text-sm text-blue-600">sinistros por km</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Interpretação:</strong> A alta concentração de sinistros em poucas vias indica 
                oportunidades de intervenção focada. Investimentos direcionados nas vias mais críticas 
                podem gerar impacto significativo na redução geral de sinistros.
              </p>
            </div>
          </div>
        )}

        {activeInsight === 'trends' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Análise de Tendências</h4>

            {insights.trends.peakYear && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">📊</span>
                  <span className="font-medium text-red-800">Ano Crítico</span>
                </div>
                <div className="text-lg">
                  <span className="font-bold text-red-700">{insights.trends.peakYear.ano}</span> registrou 
                  <span className="font-bold text-red-700"> {insights.trends.peakYear.sinistros.toLocaleString()}</span> sinistros
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">📈</span>
                  <span className="font-medium text-blue-800">Crescimento Anual</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {insights.trends.averageGrowth > 0 ? '+' : ''}{insights.trends.averageGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">média por ano</div>
              </div>

              {insights.trends.seasonalPattern && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">🗓️</span>
                    <span className="font-medium text-green-800">Sazonalidade</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <div><strong>Pico:</strong> {insights.trends.seasonalPattern.peak}</div>
                    <div><strong>Menor:</strong> {insights.trends.seasonalPattern.low}</div>
                    <div><strong>Variação:</strong> {insights.trends.seasonalPattern.variation.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>

            {insights.trends.weekdayPattern && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-600">📅</span>
                  <span className="font-medium text-purple-800">Padrão Semanal</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-purple-700">
                  <div>
                    <div><strong>Dia crítico:</strong> {insights.trends.weekdayPattern.peak}</div>
                    <div><strong>Dia menor:</strong> {insights.trends.weekdayPattern.low}</div>
                  </div>
                  <div>
                    <div><strong>Média dias úteis:</strong> {insights.trends.weekdayPattern.weekdayAvg.toFixed(0)}</div>
                    <div><strong>Média fins de semana:</strong> {insights.trends.weekdayPattern.weekendAvg.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeInsight === 'recommendations' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Recomendações Estratégicas</h4>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      rec.type === 'urgent' ? 'bg-red-50 border-red-200' :
                      rec.type === 'priority' ? 'bg-orange-50 border-orange-200' :
                      rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        rec.type === 'urgent' ? 'bg-red-100 text-red-600' :
                        rec.type === 'priority' ? 'bg-orange-100 text-orange-600' :
                        rec.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {rec.type === 'urgent' ? '🚨' :
                         rec.type === 'priority' ? '⚡' :
                         rec.type === 'warning' ? '⚠️' : '💡'}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-semibold mb-2 ${
                          rec.type === 'urgent' ? 'text-red-800' :
                          rec.type === 'priority' ? 'text-orange-800' :
                          rec.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {rec.title}
                        </h5>
                        <p className={`text-sm mb-3 ${
                          rec.type === 'urgent' ? 'text-red-700' :
                          rec.type === 'priority' ? 'text-orange-700' :
                          rec.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {rec.description}
                        </p>
                        <div className="space-y-1">
                          <div className={`text-xs font-medium ${
                            rec.type === 'urgent' ? 'text-red-800' :
                            rec.type === 'priority' ? 'text-orange-800' :
                            rec.type === 'warning' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            Ações sugeridas:
                          </div>
                          <ul className={`text-xs space-y-1 ${
                            rec.type === 'urgent' ? 'text-red-600' :
                            rec.type === 'priority' ? 'text-orange-600' :
                            rec.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {rec.actions.map((action, actionIndex) => (
                              <li key={actionIndex}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p>Nenhuma recomendação específica disponível no momento.</p>
                <p className="text-sm mt-2">As recomendações são geradas com base na análise dos dados disponíveis.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}