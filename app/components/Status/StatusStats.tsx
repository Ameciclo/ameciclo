import { ServiceStatus } from "~/routes/status._index";
import { TestIcon, TroubleshootIcon, ConfigIcon, ApiIcon, DeployIcon, RefreshIcon } from "~/components/Commom/Icones/DocumentationIcons";

interface StatusStatsProps {
  services: ServiceStatus[];
  darkMode: boolean;
  lastUpdate: Date;
  onFilterByStatus?: (status: string) => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  onRefreshOffline?: () => void;
  loadingProgress?: number;
}

export default function StatusStats({ services, darkMode, lastUpdate, onFilterByStatus, onClearFilters, onRefresh, onRefreshOffline, loadingProgress = 100 }: StatusStatsProps) {
  const totalServices = services.length;
  const onlineServices = services.filter(s => s.status === "OK").length;
  const offlineServices = services.filter(s => s.status === "OFF").length;
  const uptime = totalServices > 0 ? ((onlineServices / totalServices) * 100).toFixed(1) : "0";
  
  const onlineServicesWithTime = services.filter(s => s.responseTime && s.status === "OK");
  const avgResponseTime = onlineServicesWithTime.length > 0 
    ? onlineServicesWithTime.reduce((acc, s) => acc + (s.responseTime || 0), 0) / onlineServicesWithTime.length
    : 0;

  const formatResponseTime = (time: number) => {
    if (isNaN(time)) return "N/A";
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  const getUptimeColor = (uptime: string) => {
    const uptimeNum = parseFloat(uptime);
    if (uptimeNum >= 95) return "text-green-500"; // Ótimo
    if (uptimeNum >= 85) return "text-yellow-500"; // Bom
    if (uptimeNum >= 70) return "text-orange-500"; // Ruim
    return "text-red-500"; // Péssimo
  };

  const getResponseTimeColor = (time: number) => {
    if (isNaN(time)) return "text-gray-400";
    if (time < 500) return "text-green-500"; // Ótimo
    if (time < 1500) return "text-yellow-500"; // Bom
    if (time < 3000) return "text-orange-500"; // Ruim
    return "text-red-500"; // Péssimo
  };

  const stats = [
    {
      label: "Total de Serviços",
      value: totalServices,
      color: "text-blue-400",
      icon: ConfigIcon
    },
    {
      label: "Online",
      value: onlineServices,
      color: "text-green-500",
      icon: TestIcon
    },
    {
      label: "Offline",
      value: offlineServices,
      color: "text-red-500",
      icon: TroubleshootIcon
    },
    {
      label: "Disponibilidade",
      value: `${uptime}%`,
      color: getUptimeColor(uptime),
      icon: DeployIcon
    },
    {
      label: "Tempo Médio",
      value: formatResponseTime(avgResponseTime),
      color: getResponseTimeColor(avgResponseTime),
      icon: ApiIcon
    },
    {
      label: loadingProgress < 100 ? "Carregando" : "Última Verificação",
      value: loadingProgress < 100 ? `${Math.round(loadingProgress)}%` : lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      color: loadingProgress < 100 ? "text-blue-400" : "text-gray-400",
      icon: RefreshIcon
    }
  ];

  const tooltips = {
    "Total de Serviços": "Número total de serviços monitorados - clique para limpar filtros",
    "Online": "Serviços funcionando corretamente - clique para filtrar",
    "Offline": "Serviços com problemas ou indisponíveis - clique para filtrar",
    "Carregando": "Progresso do carregamento - clique para recarregar",
    "Disponibilidade": "Percentual de serviços online em relação ao total",
    "Tempo Médio": "Tempo médio de resposta dos serviços online",
    "Última Verificação": "Horário da última verificação de status"
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4">
        {stats.map((stat, index) => {
          const isClickable = stat.label === "Online" || stat.label === "Offline" || stat.label === "Última Verificação" || stat.label === "Carregando" || stat.label === "Total de Serviços";
          return (
            <div 
              key={index}
              className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md relative group min-w-0 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              } ${isClickable ? "cursor-pointer hover:scale-105" : ""}`}
              onClick={() => {
                if (stat.label === "Total de Serviços" && onClearFilters) {
                  onClearFilters();
                } else if ((stat.label === "Última Verificação" || stat.label === "Carregando") && onRefresh) {
                  onRefresh();
                } else if (isClickable && onFilterByStatus && (stat.label === "Online" || stat.label === "Offline")) {
                  onFilterByStatus(stat.label === "Online" ? "OK" : "OFF");
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 opacity-75 flex-shrink-0" />
                <div className={`text-lg sm:text-2xl font-bold ${stat.color} truncate ml-1`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-xs sm:text-sm opacity-75 font-medium truncate">
                {stat.label}
              </div>
              
              {/* Tooltip - apenas em telas maiores */}
              <div className={`hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap ${
                darkMode ? "bg-gray-700 text-white border border-gray-600" : "bg-gray-900 text-white"
              }`}>
                {tooltips[stat.label as keyof typeof tooltips]}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                  darkMode ? "border-t-gray-700" : "border-t-gray-900"
                }`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}