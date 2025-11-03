export const chartData = [
  {
    id: 1,
    title: "Av. Gov. Agamenon Magalhães",
    value: "2.846",
    description: "contagens de ciclistas (Jan/2024)",
    chart: (
      <svg className="w-full h-16" viewBox="0 0 200 60">
        <path d="M0,60 Q10,50 20,45 Q30,30 40,35 Q50,40 60,25 Q70,20 80,30 Q90,35 100,20 Q110,15 120,22 Q130,25 140,18 Q150,10 160,25 Q170,30 180,22 Q190,20 200,25 L200,60 Z" 
          fill="#1d4ed8" fillOpacity="0.3" stroke="#1d4ed8" strokeWidth="2"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Sinistros com vítima",
    value: "1.323",
    chart: (
      <svg className="w-full h-16" viewBox="0 0 200 60">
        <rect x="20" y="40" width="15" height="20" fill="#1d4ed8"/>
        <rect x="45" y="30" width="15" height="30" fill="#1d4ed8"/>
        <rect x="70" y="35" width="15" height="25" fill="#1d4ed8"/>
        <rect x="95" y="25" width="15" height="35" fill="#1d4ed8"/>
        <rect x="120" y="45" width="15" height="15" fill="#1d4ed8"/>
        <rect x="145" y="20" width="15" height="40" fill="#1d4ed8"/>
        <rect x="170" y="38" width="15" height="22" fill="#1d4ed8"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "Infra. cicloviária executada",
    value: "78%",
    chart: (
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-blue-700 h-4 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
      </div>
    )
  }
];