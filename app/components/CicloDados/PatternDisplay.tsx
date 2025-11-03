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
          <rect width="100" height="12" fill={color} stroke="#EF4444" strokeWidth="1" />
          <path d="M25,3 L30,6 L25,9" stroke="#EF4444" strokeWidth="2" fill="none" />
          <path d="M40,3 L45,6 L40,9" stroke="#EF4444" strokeWidth="2" fill="none" />
          <path d="M55,3 L60,6 L55,9" stroke="#EF4444" strokeWidth="2" fill="none" />
          <path d="M70,3 L75,6 L70,9" stroke="#EF4444" strokeWidth="2" fill="none" />
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
          <defs>
            <pattern id="stripes" patternUnits="userSpaceOnUse" width="8" height="12">
              <rect width="4" height="12" fill="#EC4899" />
              <rect x="4" width="4" height="12" fill="#FED7AA" />
            </pattern>
          </defs>
          <rect width="100" height="12" fill="url(#stripes)" />
        </svg>
      );
    default:
      return <div className="w-full h-3" style={{ backgroundColor: color }} />;
  }
}