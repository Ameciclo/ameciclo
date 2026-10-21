
export const FlowContainer = ({ data }: { data: any }) => {
    const { directions, summary } = data;
    
    // Calcular fluxos por direção somando todas as sessões
    const calculateDirectionFlow = () => {
        const flows = {
            north: 0,
            south: 0,
            east: 0,
            west: 0
        };
        
        Object.values(data.sessions || {}).forEach((session: any) => {
            const { quantitative } = session;
            if (quantitative) {
                // Somar fluxos que saem de cada direção
                flows.north += (quantitative.north_south || 0) + (quantitative.north_east || 0) + (quantitative.north_west || 0);
                flows.south += (quantitative.south_north || 0) + (quantitative.south_east || 0) + (quantitative.south_west || 0);
                flows.east += (quantitative.east_north || 0) + (quantitative.east_south || 0) + (quantitative.east_west || 0);
                flows.west += (quantitative.west_north || 0) + (quantitative.west_south || 0) + (quantitative.west_east || 0);
            }
        });
        
        return flows;
    };
    
    const flows = calculateDirectionFlow();
    const maxFlow = Math.max(...Object.values(flows));
    
    return (
        <div className="bg-white rounded-lg shadow-xl p-6 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Fluxo por Direção</h3>
            
            <div className="space-y-4">
                {Object.entries(directions).map(([key, direction]) => {
                    const flow = flows[key as keyof typeof flows];
                    const percentage = maxFlow > 0 ? (flow / maxFlow) * 100 : 0;
                    
                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 capitalize">
                                    {direction as string}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {flow} ciclistas
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-ameciclo h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <span className="text-lg font-bold text-ameciclo">
                        {summary.total_cyclists}
                    </span>
                    <p className="text-sm text-gray-600">Total de Ciclistas</p>
                </div>
            </div>
        </div>
    );
};