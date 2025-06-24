import { ServiceStatus } from "~/routes/status._index";
import { TestIcon, TroubleshootIcon } from "~/components/Commom/Icones/DocumentationIcons";

interface ServiceCardProps {
  service: ServiceStatus;
  fontSize: number;
  darkMode: boolean;
}

export default function ServiceCard({ service, fontSize, darkMode }: ServiceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "OFF":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return "text-gray-500";
    if (responseTime < 500) return "text-green-500";
    if (responseTime < 2000) return "text-yellow-500";
    return "text-red-500";
  };

  const formatResponseTime = (responseTime?: number) => {
    if (!responseTime) return "";
    if (responseTime < 1000) return `${responseTime}ms`;
    return `${(responseTime / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-650" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
              {service.status === "OK" ? (
                <TestIcon className="w-3 h-3 mr-1" />
              ) : (
                <TroubleshootIcon className="w-3 h-3 mr-1" />
              )}
              {service.status}
            </span>
            <h3 className="font-semibold truncate" style={{ fontSize }}>
              {service.name}
            </h3>
            {service.responseTime && (
              <span className={`text-xs font-mono ${getResponseTimeColor(service.responseTime)}`}>
                {formatResponseTime(service.responseTime)}
              </span>
            )}
          </div>
          
          {service.description && (
            <p className="text-sm opacity-75 mb-2 line-clamp-2" style={{ fontSize: fontSize - 2 }}>
              {service.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <a 
              href={service.url} 
              target={service.url.startsWith('http') ? '_blank' : '_self'}
              rel={service.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`text-sm underline hover:no-underline transition-colors break-all ${
                service.status === "OK" 
                  ? "text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300" 
                  : "text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
              }`}
              style={{ fontSize: fontSize - 2 }}
            >
              {service.url.startsWith('http') ? service.url : `https://ameciclo.org${service.url}`}
            </a>
            {service.url.startsWith('http') && (
              <span className="text-xs opacity-50">↗</span>
            )}
          </div>
        </div>
        
        {service.status === "OFF" && (
          <div className="lg:text-right lg:max-w-xs">
            {service.httpStatus && (
              <div className="text-sm font-medium text-red-500 mb-1">
                HTTP {service.httpStatus}
              </div>
            )}
            {service.errorMessage && (
              <div className="text-xs text-red-400 break-words">
                {service.errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}