interface ProfileData {
  label: string;
  value: string;
  total: number;
  color: string;
}

interface PerfilSocioeconomicoSectionProps {
  genderData: ProfileData[];
  ageData: ProfileData[];
  categoryData: ProfileData[];
}

export function PerfilSocioeconomicoSection({
  genderData,
  ageData,
  categoryData,
}: PerfilSocioeconomicoSectionProps) {
  const renderProfileCard = (title: string, data: ProfileData[]) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h4 className="text-lg font-bold mb-4">{title}</h4>
      
      {data.length > 0 && (
        <div className="flex h-8 mb-3 rounded-md overflow-hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className="h-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                width: `${item.value}%`,
                backgroundColor: item.color,
                minWidth: parseFloat(item.value) > 3 ? "auto" : "0",
              }}
              title={`${item.label}: ${item.total.toLocaleString()} (${item.value}%)`}
            >
              {parseFloat(item.value) > 10 ? `${Math.round(parseFloat(item.value))}%` : ""}
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="font-bold">
                {item.total.toLocaleString()} ({item.value}%)
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Perfil dos Sinistros
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderProfileCard("Perfil de Sexo (%)", genderData)}
        {renderProfileCard("Perfil de Idade (%)", ageData)}
        {renderProfileCard("Tipo de Sinistro (%)", categoryData)}
      </div>
    </section>
  );
}
