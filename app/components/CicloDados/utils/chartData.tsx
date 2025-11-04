import { useState, useEffect } from 'react';

const MiniContagensChart = () => {
  const [Chart, setChart] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const loadChart = async () => {
      const [Highcharts, HighchartsReact] = await Promise.all([
        import('highcharts'),
        import('highcharts-react-official')
      ]);
      
      const ChartComponent = () => (
        <HighchartsReact.default 
          highcharts={Highcharts.default} 
          options={{
            chart: { type: 'areaspline', height: 64, backgroundColor: 'transparent', margin: [5, 5, 5, 5] },
            title: { text: null },
            legend: { enabled: false },
            credits: { enabled: false },
            xAxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], visible: false },
            yAxis: { visible: false, min: 0 },
            plotOptions: {
              areaspline: {
                fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(59, 130, 246, 0.3)'], [1, 'rgba(59, 130, 246, 0.1)']] },
                lineColor: '#3b82f6',
                lineWidth: 2,
                marker: { enabled: false }
              }
            },
            series: [{ name: 'Ciclistas', data: [2400, 2650, 2846, 2720, 2580, 2390], showInLegend: false }],
            tooltip: { enabled: false }
          }} 
        />
      );
      
      setChart(() => ChartComponent);
    };
    
    loadChart();
  }, [isClient]);

  if (!isClient || !Chart) return <div className="w-full h-16 bg-blue-100 rounded animate-pulse"></div>;
  return <Chart />;
};

const MiniSinistrosChart = () => {
  const [Chart, setChart] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const loadChart = async () => {
      const [Highcharts, HighchartsReact] = await Promise.all([
        import('highcharts'),
        import('highcharts-react-official')
      ]);
      
      const ChartComponent = () => (
        <HighchartsReact.default 
          highcharts={Highcharts.default} 
          options={{
            chart: { type: 'column', height: 64, backgroundColor: 'transparent', margin: [5, 5, 5, 5] },
            title: { text: null },
            legend: { enabled: false },
            credits: { enabled: false },
            xAxis: { categories: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'], visible: false },
            yAxis: { visible: false, min: 0 },
            plotOptions: { column: { color: '#ef4444', borderWidth: 0, pointPadding: 0.1 } },
            series: [{ name: 'Vítimas Fatais', data: [28, 32, 38, 45, 52, 58, 65, 72, 78], showInLegend: false }],
            tooltip: { enabled: false }
          }} 
        />
      );
      
      setChart(() => ChartComponent);
    };
    
    loadChart();
  }, [isClient]);

  if (!isClient || !Chart) return <div className="w-full h-16 bg-blue-100 rounded animate-pulse"></div>;
  return <Chart />;
};

const MiniInfraChart = ({ onPercentageChange }: { onPercentageChange: (value: number) => void }) => {
  const [currentPercentage, setCurrentPercentage] = useState(100);
  const targetPercentage = 18;
  
  const getColor = (value: number) => {
    if (value <= 20) return '#ef4444'; // red
    if (value <= 50) return '#f97316'; // orange
    if (value <= 80) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentPercentage(prev => {
          const newValue = prev <= targetPercentage ? targetPercentage : prev - 1;
          onPercentageChange(newValue);
          if (prev <= targetPercentage) {
            clearInterval(interval);
          }
          return newValue;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onPercentageChange]);

  return (
    <div className="w-full h-16 flex items-center">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-colors duration-200"
          style={{ 
            width: `${currentPercentage}%`, 
            backgroundColor: getColor(currentPercentage) 
          }}
        />
      </div>
    </div>
  );
};

export { MiniContagensChart, MiniSinistrosChart, MiniInfraChart };