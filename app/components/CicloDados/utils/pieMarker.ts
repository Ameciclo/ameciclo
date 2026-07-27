function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

const COLOR_MAP: Record<string, string> = {
  "É mais rápido e prático": "#F97316",
  "É mais barato": "#8B5CF6",
  "É mais saudável": "#3B82F6",
  "É ambientalmente correto": "#10B981",
  Outros: "#6B7280",

  "Falta de segurança no trânsito": "#EF4444",
  "Falta de infraestrutura adequada (ciclovias, bicicletários, etc)": "#F97316",
  "Falta de respeito dos condutores dos motorizados": "#EAB308",
  "Falta de segurança pública": "#8B5CF6",
  "Sem resposta": "#9CA3AF",
};

const FALLBACK_COLORS = [
  "#F97316", "#8B5CF6", "#3B82F6", "#10B981", "#EF4444",
  "#EAB308", "#EC4899", "#14B8A6", "#6366F1", "#6B7280",
];

function getColor(label: string, index: number): string {
  return COLOR_MAP[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function pieMarker(
  items: Array<{ label: string; value: number }>,
  radius = 12,
  size = 32,
  colors?: string[],
  ringColor?: string,
) {
  const total = items.reduce((a, b) => a + b.value, 0);
  if (total === 0) return '';

  const cx = size / 2;
  const cy = size / 2;
  let angle = 0;

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const topPct = Math.round((sorted[0].value / total) * 100);

  const paths = sorted
    .filter((item) => item.value > 0)
    .map((item, i) => {
      const sliceAngle = (item.value / total) * 360;
      const path = describeArc(cx, cy, radius, angle, angle + sliceAngle);
      angle += sliceAngle;
      const color = colors ? colors[i % colors.length] : getColor(item.label, i);
      return `<path d="${path}" fill="${color}" />`;
    })
    .join('');

  const sw = Math.round(size * 0.025);
  const fs = Math.round(size * 0.16);
  const bgR = Math.round(radius * 0.4);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${ringColor ?? 'white'}" stroke-width="${sw}" />
      <circle cx="${cx}" cy="${cy}" r="${bgR}" fill="white" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-size="${fs}" font-family="sans-serif" font-weight="bold" fill="#1f2937">${topPct}%</text>
    </svg>`;
}

export function singleDonut(value: number, color: string, radius = 12, size = 32) {
  const pct = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const cx = size / 2;
  const cy = size / 2;
  const sw = Math.max(3, Math.round(size * 0.07));
  const fs = Math.round(size * 0.16);
  const bgR = Math.round(radius * 0.4);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${pct}%">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="white" stroke="#d1d5db" stroke-width="${sw}" />
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})" />
      <circle cx="${cx}" cy="${cy}" r="${bgR}" fill="white" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-size="${fs}" font-family="sans-serif" font-weight="bold" fill="#374151">${pct}%</text>
    </svg>`;
}
