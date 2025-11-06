import { FilterSection } from './FilterSection';
import { PerfilSection } from './PerfilSection';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  infraOptions: Array<{ name: string; color: string; pattern: string }>;
  selectedInfra: string[];
  onInfraToggle: (option: string) => void;
  contagemOptions: string[];
  selectedContagem: string[];
  onContagemToggle: (option: string) => void;
  pdcOptions: Array<{ name: string; color: string; pattern: string }>;
  selectedPdc: string[];
  onPdcToggle: (option: string) => void;
  infracaoOptions: string[];
  selectedInfracao: string[];
  onInfracaoToggle: (option: string) => void;
  sinistroOptions: string[];
  selectedSinistro: string[];
  onSinistroToggle: (option: string) => void;
  estacionamentoOptions: string[];
  selectedEstacionamento: string[];
  onEstacionamentoToggle: (option: string) => void;
  selectedGenero: string;
  onGeneroChange: (value: string) => void;
  selectedRaca: string;
  onRacaChange: (value: string) => void;
  selectedSocio: string;
  onSocioChange: (value: string) => void;
  selectedDias: string;
  onDiasChange: (value: string) => void;
}

export function LeftSidebar({
  isOpen,
  onToggle,
  infraOptions,
  selectedInfra,
  onInfraToggle,
  contagemOptions,
  selectedContagem,
  onContagemToggle,
  pdcOptions,
  selectedPdc,
  onPdcToggle,
  infracaoOptions,
  selectedInfracao,
  onInfracaoToggle,
  sinistroOptions,
  selectedSinistro,
  onSinistroToggle,
  estacionamentoOptions,
  selectedEstacionamento,
  onEstacionamentoToggle,
  selectedGenero,
  onGeneroChange,
  selectedRaca,
  onRacaChange,
  selectedSocio,
  onSocioChange,
  selectedDias,
  onDiasChange
}: LeftSidebarProps) {
  return (
    <aside className={`bg-gray-50 border-r transition-all duration-300 flex-shrink-0 overflow-hidden flex flex-col ${
      isOpen ? 'w-72' : 'w-0'
    }`} style={{height: '100%'}}>
      {/* Fixed header */}
      <div className={`items-center justify-between p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0 ${
        isOpen ? 'flex' : 'hidden md:flex flex-col gap-2'
      }`}>
        {isOpen && <h2 className="font-semibold text-gray-800">Camadas de dados</h2>}
        <button 
          onClick={onToggle}
          className={`hover:bg-gray-200 rounded transition-colors ${
            isOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
          }`}
          title={isOpen ? 'Minimizar' : 'Expandir'}
        >
          <svg className={`w-4 h-4 transition-transform ${
            isOpen ? '' : 'rotate-180'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      {/* Scrollable content */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-3">
            <div className="space-y-2">
              <FilterSection
                title="Infraestrutura cicloviária"
                options={infraOptions}
                selectedOptions={selectedInfra}
                onToggle={onInfraToggle}
                hasPattern={true}
              />
              
              <FilterSection
                title="Contagem de ciclistas"
                options={contagemOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedContagem}
                onToggle={onContagemToggle}
                hasPattern={false}
              />
              
              <FilterSection
                title="Plano Diretor Cicloviário"
                options={pdcOptions}
                selectedOptions={selectedPdc}
                onToggle={onPdcToggle}
                hasPattern={true}
                isPdc={true}
              />
              
              <FilterSection
                title="Infrações de Trânsito"
                options={infracaoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedInfracao}
                onToggle={onInfracaoToggle}
                hasPattern={false}
              />
              
              <FilterSection
                title="Sinistro com vítima"
                options={sinistroOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedSinistro}
                onToggle={onSinistroToggle}
                hasPattern={false}
              />
              
              <FilterSection
                title="Estacionamento e compartilhamento"
                options={estacionamentoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedEstacionamento}
                onToggle={onEstacionamentoToggle}
                hasPattern={false}
              />
              
              <PerfilSection
                selectedGenero={selectedGenero}
                onGeneroChange={onGeneroChange}
                selectedRaca={selectedRaca}
                onRacaChange={onRacaChange}
                selectedSocio={selectedSocio}
                onSocioChange={onSocioChange}
                selectedDias={selectedDias}
                onDiasChange={onDiasChange}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Floating toggle button when minimized */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed top-1/2 -translate-y-1/2 left-4 z-[60] bg-white border rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          title="Expandir filtros"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </aside>
  );
}