import React from "react";

export const HourlyCyclistsChart = ({ series, hours }: { series: any[], hours: number[] }) => {
    if (!series.length || !hours.length) return null;
    
    const maxValue = Math.max(...series[0].data);
    
    return (
        <section className="container mx-auto my-10">
            <div className="bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Ciclistas por Hora</h2>
                <div className="flex items-end justify-between h-64 border-b border-l border-gray-300">
                    {hours.map((hour, index) => {
                        const value = series[0].data[index];
                        const height = (value / maxValue) * 200;
                        
                        return (
                            <div key={hour} className="flex flex-col items-center">
                                <div 
                                    className="bg-ameciclo rounded-t"
                                    style={{ 
                                        height: `${height}px`,
                                        width: '20px',
                                        minHeight: '2px'
                                    }}
                                    title={`${hour}h: ${value} ciclistas`}
                                />
                                <span className="text-xs mt-2 text-gray-600">{hour}h</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 text-center text-gray-600">
                    <p>Horário (24h)</p>
                </div>
            </div>
        </section>
    );
};