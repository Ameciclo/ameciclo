export function PerfilCards() {
  return (
    <div className="px-3 pb-3">
      <div className="flex gap-3">
        <div className="flex-1 bg-blue-100 rounded-lg p-4" style={{ height: '150px' }}>
          <h3 className="font-medium text-gray-800 mb-2">Perfil Ciclista 1</h3>
          <div className="text-sm text-gray-600">
            <p>Dados do perfil</p>
          </div>
        </div>
        
        <div className="flex-1 bg-blue-100 rounded-lg p-4" style={{ height: '150px' }}>
          <h3 className="font-medium text-gray-800 mb-2">Perfil Ciclista 2</h3>
          <div className="text-sm text-gray-600">
            <p>Dados do perfil</p>
          </div>
        </div>
      </div>
    </div>
  );
}