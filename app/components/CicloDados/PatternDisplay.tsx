interface PatternDisplayProps {
  pattern: string;
  color: string;
  name: string;
  isPdc?: boolean;
}

export function PatternDisplay({ pattern, color, name, isPdc = false }: PatternDisplayProps) {
  if (isPdc) {
    return getPdcPatternSvg(pattern, color);
  }
  
  return getInfraPatternSvg(pattern, color, name);
}

function getInfraPatternSvg(pattern: string, color: string, name: string) {
  switch (pattern) {
    case "solid":
      return <div className="w-full h-3" style={{ backgroundColor: color }} />;
    case "bordered":
      return (
        <div className="w-full h-3 border border-red-500" style={{ backgroundColor: color }} />
      );
    case "arrows":
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <rect width="100" height="12" fill="#9CA3AF" />
          <rect x="10" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="20" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="30" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="40" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="50" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="60" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="70" y="0" width="2" height="12" fill="#EF4444" />
          <rect x="80" y="0" width="2" height="12" fill="#EF4444" />
        </svg>
      );
    case "area":
      const isZona30 = name === "Zonas 30";
      const bgColor = isZona30 ? "#FEF3C7" : "#DBEAFE";
      const borderColor = isZona30 ? "#F59E0B" : "#3B82F6";
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <rect width="100" height="12" fill={bgColor} stroke={borderColor} strokeWidth="1" strokeDasharray="4,2" />
        </svg>
      );
    default:
      return <div className="w-full h-3" style={{ backgroundColor: color }} />;
  }
}

function getPdcPatternSvg(pattern: string, color: string) {
  switch (pattern) {
    case "parallel":
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" />
          <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" />
        </svg>
      );
    case "parallel-dashed":
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
          <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
        </svg>
      );
    case "parallel-orange-dashed":
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
          <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
        </svg>
      );
    case "striped":
      return (
        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" strokeDasharray="1,3" />
          <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" strokeDasharray="1,3" />
        </svg>
      );
    default:
      return <div className="w-full h-3" style={{ backgroundColor: color }} />;
  }
}