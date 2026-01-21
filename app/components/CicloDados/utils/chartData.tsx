import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

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
            accessibility: { enabled: false },
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
            accessibility: { enabled: false },
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
      const totalSteps = currentPercentage - targetPercentage;
      const stepDuration = 3000 / totalSteps;
      
      const interval = setInterval(() => {
        setCurrentPercentage(prev => {
          const newValue = prev <= targetPercentage ? targetPercentage : prev - 1;
          if (prev <= targetPercentage) {
            clearInterval(interval);
          }
          return newValue;
        });
      }, stepDuration);
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [targetPercentage]);

  useEffect(() => {
    onPercentageChange(currentPercentage);
  }, [currentPercentage, onPercentageChange]);

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

const MiniVelocidadeChart = () => {
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
            accessibility: { enabled: false },
            xAxis: { categories: ['6h', '12h', '18h'], visible: false },
            yAxis: { visible: false, min: 0 },
            plotOptions: {
              areaspline: {
                fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(59, 130, 246, 0.3)'], [1, 'rgba(59, 130, 246, 0.1)']] },
                lineColor: '#3b82f6',
                lineWidth: 2,
                marker: { enabled: false }
              }
            },
            series: [{ name: 'Velocidade', data: [15, 24, 28, 25, 20, 18], showInLegend: false }],
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

const MiniFluxoChart = () => {
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
            accessibility: { enabled: false },
            xAxis: { categories: ['6h', '12h', '18h'], visible: false },
            yAxis: { visible: false, min: 0 },
            plotOptions: { column: { color: '#10b981', borderWidth: 0, pointPadding: 0.1 } },
            series: [{ name: 'Ciclistas', data: [150, 320, 423, 380, 250, 180], showInLegend: false }],
            tooltip: { enabled: false }
          }} 
        />
      );
      
      setChart(() => ChartComponent);
    };
    
    loadChart();
  }, [isClient]);

  if (!isClient || !Chart) return <div className="w-full h-16 bg-green-100 rounded animate-pulse"></div>;
  return <Chart />;
};

const MiniGeneroChart = () => {
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
            accessibility: { enabled: false },
            xAxis: { categories: ['2019', '2020', '2021', '2022', '2023'], visible: false },
            yAxis: { visible: false, min: 0 },
            plotOptions: {
              areaspline: {
                fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(236, 72, 153, 0.3)'], [1, 'rgba(236, 72, 153, 0.1)']] },
                lineColor: '#ec4899',
                lineWidth: 2,
                marker: { enabled: false }
              }
            },
            series: [{ name: 'Mulheres', data: [8, 9, 10, 11, 12], showInLegend: false }],
            tooltip: { enabled: false }
          }} 
        />
      );
      
      setChart(() => ChartComponent);
    };
    
    loadChart();
  }, [isClient]);

  if (!isClient || !Chart) return <div className="w-full h-16 bg-pink-100 rounded animate-pulse"></div>;
  return <Chart />;
};

const MiniCaracteristicasChart = () => {
  const caracteristicas = [
    { label: 'Mulheres', value: 323, color: '#ec4899', Icon: LucideIcons.User },
    { label: 'Capacete', value: 234, color: '#3b82f6', Icon: LucideIcons.Shield },
    { label: 'Carona', value: 141, color: '#10b981', Icon: LucideIcons.Users },
    { label: 'Serviço', value: 783, color: '#f59e0b', Icon: LucideIcons.Wrench },
    { label: 'Contramão', value: 123, color: '#ef4444', Icon: LucideIcons.RotateCcw },
    { label: 'Cargueira', value: 452, color: '#8b5cf6', Icon: LucideIcons.Package }
  ];

  return (
    <div className="w-full h-20 grid grid-cols-2 gap-1">
      {caracteristicas.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
          <div className="flex items-center gap-1">
            <item.Icon className="w-3 h-3" style={{ color: item.color }} />
            <span className="font-medium truncate">{item.label}</span>
          </div>
          <span className="font-bold" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const MiniInfraestruturaChart = () => {
  const infraestrutura = [
    { label: 'Iluminação', value: 'Boa', color: '#10b981', Icon: LucideIcons.Lightbulb, tooltip: 'Qualidade da iluminação da via' },
    { label: 'Controle', value: 'Ruim', color: '#ef4444', Icon: LucideIcons.Car, tooltip: 'Controle de velocidade dos veículos' },
    { label: 'Proteção', value: 'Boa', color: '#10b981', Icon: LucideIcons.Shield, tooltip: 'Proteção contra invasão' },
    { label: 'Piso', value: 'Asfalto', color: '#6b7280', Icon: LucideIcons.MapPin, tooltip: 'Tipo de pavimento da via' },
    { label: 'Acesso', value: 'Bom', color: '#10b981', Icon: LucideIcons.LogIn, tooltip: 'Acesso à estrutura cicloviaria' },
    { label: 'Conforto', value: 'Bom', color: '#10b981', Icon: LucideIcons.Heart, tooltip: 'Conforto da estrutura para ciclistas' }
  ];

  return (
    <div className="w-full h-20 grid grid-cols-2 gap-1">
      {infraestrutura.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1 relative group">
          <div className="flex items-center gap-1">
            <item.Icon className="w-3 h-3" style={{ color: item.color }} />
            <span className="font-medium truncate">{item.label}</span>
          </div>
          <span className="font-bold text-xs" style={{ color: item.color }}>
            {item.value}
          </span>
          <div className="absolute top-0 left-0 transform -translate-y-full px-2 py-1 bg-white border border-gray-300 text-black text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-sm w-32 break-words">
            {item.tooltip}
          </div>
        </div>
      ))}
    </div>
  );
};

const MiniAcessibilidadeChart = () => {
  const viasInseguras = [
    { label: 'Rua A', value: '15', color: '#ef4444', Icon: LucideIcons.AlertTriangle },
    { label: 'Av. B', value: '12', color: '#f97316', Icon: LucideIcons.AlertTriangle },
    { label: 'Rua C', value: '9', color: '#eab308', Icon: LucideIcons.AlertTriangle },
    { label: 'Av. D', value: '7', color: '#84cc16', Icon: LucideIcons.AlertTriangle }
  ];

  return (
    <div className="w-full h-16 grid grid-cols-2 gap-1">
      {viasInseguras.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
          <div className="flex items-center gap-1">
            <item.Icon className="w-3 h-3" style={{ color: item.color }} />
            <span className="font-medium truncate">{item.label}</span>
          </div>
          <span className="font-bold text-xs" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export { MiniContagensChart, MiniSinistrosChart, MiniInfraChart, MiniVelocidadeChart, MiniFluxoChart, MiniGeneroChart, MiniCaracteristicasChart, MiniInfraestruturaChart, MiniAcessibilidadeChart };