import { useState } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { FilterSection } from './FilterSection';
import { PerfilSection } from './PerfilSection';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  infraOptions: Array<{ name: string; color: string; pattern: string }>;
  selectedInfra: string[];
  onInfraToggle: (option: string) => void;
  onInfraToggleAll?: (options: string[], selectAll: boolean) => void;
  contagemOptions: string[];
  selectedContagem: string[];
  onContagemToggle: (option: string) => void;
  onContagemToggleAll?: (options: string[], selectAll: boolean) => void;
  pdcOptions: Array<{ name: string; color: string; pattern: string }>;
  selectedPdc: string[];
  onPdcToggle: (option: string) => void;
  onPdcToggleAll?: (options: string[], selectAll: boolean) => void;
  infracaoOptions: string[];
  selectedInfracao: string[];
  onInfracaoToggle: (option: string) => void;
  onInfracaoToggleAll?: (options: string[], selectAll: boolean) => void;
  sinistroOptions: string[];
  selectedSinistro: string[];
  onSinistroToggle: (option: string) => void;
  onSinistroToggleAll?: (options: string[], selectAll: boolean) => void;
  estacionamentoOptions: string[];
  selectedEstacionamento: string[];
  onEstacionamentoToggle: (option: string) => void;
  onEstacionamentoToggleAll?: (options: string[], selectAll: boolean) => void;
  perfilOptions: string[];
  selectedPerfil: string[];
  onPerfilToggle: (option: string) => void;
  onPerfilToggleAll?: (options: string[], selectAll: boolean) => void;
  selectedGenero: string;
  onGeneroChange: (value: string) => void;
  selectedRaca: string;
  onRacaChange: (value: string) => void;
  selectedSocio: string;
  onSocioChange: (value: string) => void;
  selectedDias: string;
  onDiasChange: (value: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  onReloadMapData?: () => void;
  onReloadGeneralData?: () => void;
  loadingStates?: {
    infra: boolean;
    pdc: boolean;
    sinistros: boolean;
    estacionamento: boolean;
  };
}

export function LeftSidebar({
  isOpen,
  onToggle,
  infraOptions,
  selectedInfra,
  onInfraToggle,
  onInfraToggleAll,
  contagemOptions,
  selectedContagem,
  onContagemToggle,
  onContagemToggleAll,
  pdcOptions,
  selectedPdc,
  onPdcToggle,
  onPdcToggleAll,
  infracaoOptions,
  selectedInfracao,
  onInfracaoToggle,
  onInfracaoToggleAll,
  sinistroOptions,
  selectedSinistro,
  onSinistroToggle,
  onSinistroToggleAll,
  estacionamentoOptions,
  selectedEstacionamento,
  onEstacionamentoToggle,
  onEstacionamentoToggleAll,
  perfilOptions,
  selectedPerfil,
  onPerfilToggle,
  onPerfilToggleAll,
  selectedGenero,
  onGeneroChange,
  selectedRaca,
  onRacaChange,
  selectedSocio,
  onSocioChange,
  selectedDias,
  onDiasChange,
  onClearAll,
  onSelectAll,
  onReloadMapData,
  onReloadGeneralData,
  loadingStates = { infra: false, pdc: false, sinistros: false, estacionamento: false }
}: LeftSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['infraestrutura', 'contagem', 'pdc', 'infracao', 'sinistro', 'estacionamento', 'perfil', 'perfil-pontos', 'rota', 'ideciclo']));
  
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  const collapseAll = () => {
    setCollapsedSections(new Set(['infraestrutura', 'contagem', 'pdc', 'infracao', 'sinistro', 'estacionamento', 'perfil', 'perfil-pontos', 'rota', 'ideciclo']));
  };
  
  const expandAll = () => {
    setCollapsedSections(new Set());
  };
  
  const allCollapsed = collapsedSections.size > 2; // Don't count infracao and sinistro as they start collapsed
  
  // Check if ALL options are selected across all sections
  const allOptionsSelected = 
    selectedInfra.length === infraOptions.length &&
    selectedContagem.length === contagemOptions.length &&
    selectedPdc.length === pdcOptions.length &&
    selectedInfracao.length === infracaoOptions.length &&
    selectedSinistro.length === sinistroOptions.length &&
    selectedEstacionamento.length === estacionamentoOptions.length &&
    selectedPerfil.length === perfilOptions.length;
  
  const toggleAllOptions = () => {
    if (allOptionsSelected) {
      onClearAll();
    } else {
      onSelectAll();
    }
  };
  return (
    <aside className={`bg-gray-50 border-r transition-all duration-300 flex-shrink-0 overflow-hidden flex flex-col ${
      isOpen ? 'w-72' : 'w-0'
    }`} style={{height: '100%'}}>
      {/* Fixed header */}
      <div className={`items-center justify-between p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0 ${
        isOpen ? 'flex' : 'hidden md:flex flex-col gap-2'
      }`}>
        <div className="flex items-center gap-2">
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
          {isOpen && <h2 className="font-semibold text-gray-800">Camadas de dados</h2>}
        </div>
        {isOpen && (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleAllOptions}
              className="hover:bg-gray-200 rounded transition-colors p-1"
              title={allOptionsSelected ? "Ocultar todas as camadas" : "Mostrar todas as camadas"}
            >
              {allOptionsSelected ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-teal-600" />}
            </button>
            <button
              onClick={allCollapsed ? expandAll : collapseAll}
              className="hover:bg-gray-200 rounded transition-colors p-1"
              title={allCollapsed ? 'Expandir todos' : 'Recolher todos'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {allCollapsed ? (
                  // Expand icon - chevrons pointing down
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3l6 6 6-6" />
                  </>
                ) : (
                  // Collapse icon - chevrons pointing up
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-6-6-6 6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 21l-6-6-6 6" />
                  </>
                )}
              </svg>
            </button>
          </div>
        )}
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
                onToggleAll={onInfraToggleAll}
                hasPattern={true}
                isCollapsed={collapsedSections.has('infraestrutura')}
                onToggleCollapse={() => toggleSection('infraestrutura')}
                loadingOptions={loadingStates?.infra ? infraOptions.map(opt => opt.name) : []}
              />
              
              <FilterSection
                title="Contagem de ciclistas"
                options={contagemOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedContagem}
                onToggle={onContagemToggle}
                onToggleAll={onContagemToggleAll}
                hasPattern={false}
                isCollapsed={collapsedSections.has('contagem')}
                onToggleCollapse={() => toggleSection('contagem')}
              />
              
              <FilterSection
                title="Plano Diretor Cicloviário"
                options={pdcOptions}
                selectedOptions={selectedPdc}
                onToggle={onPdcToggle}
                onToggleAll={onPdcToggleAll}
                hasPattern={true}
                isPdc={true}
                isCollapsed={collapsedSections.has('pdc')}
                onToggleCollapse={() => toggleSection('pdc')}
                loadingOptions={loadingStates?.pdc ? pdcOptions.map(opt => opt.name) : []}
              />
              
              <div className="bg-white rounded border">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEstacionamentoToggleAll?.(estacionamentoOptions, selectedEstacionamento.length === 0)}
                        className="hover:bg-gray-50 rounded p-1 transition-colors"
                      >
                        {selectedEstacionamento.length > 0 ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <span className="font-medium">Estacionamento e compartilhamento</span>
                    </div>
                    <button 
                      onClick={() => toggleSection('estacionamento')}
                      className="hover:bg-gray-50 rounded p-1 transition-colors"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${!collapsedSections.has('estacionamento') ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {!collapsedSections.has('estacionamento') && (
                  <div className="px-2 pb-2 space-y-2">
                    {estacionamentoOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <button
                          onClick={() => onEstacionamentoToggle(option)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          {selectedEstacionamento.includes(option) ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                        </button>
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-sm">{option}</span>
                          {option === 'Bicicletários' && (
                            <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                              <span className="text-white font-black text-[10px]" style={{textShadow: '0 0 1px white'}}>∩</span>
                            </div>
                          )}
                          {option === 'Estações de Bike PE' && (
                            <div className="bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm14 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-7-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm5.5 2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded border">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onPerfilToggle('Perfil de Ciclistas')}
                        className="hover:bg-gray-50 rounded p-1 transition-colors"
                      >
                        {selectedPerfil.includes('Perfil de Ciclistas') ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <span className="font-medium">Perfil de ciclistas</span>
                    </div>
                    <button 
                      onClick={() => toggleSection('perfil-pontos')}
                      className="hover:bg-gray-50 rounded p-1 transition-colors"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${!collapsedSections.has('perfil-pontos') ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {!collapsedSections.has('perfil-pontos') && selectedPerfil.length > 0 && (
                  <div className="px-2 pb-2 space-y-3">
                    {/* Edições (Anos) */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Edições</h4>
                      <div className="flex flex-wrap gap-1">
                        {["Todas", "2024", "2021", "2018", "2015"].map((option) => (
                          <button
                            key={option}
                            onClick={() => onGeneroChange(option)}
                            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                              selectedGenero === option
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {option === 'Todas' && (
                              selectedGenero === option ? <Eye size={12} /> : <EyeOff size={12} />
                            )}
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <FilterSection
                title="Infrações de Trânsito"
                options={infracaoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedInfracao}
                onToggle={onInfracaoToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('infracao')}
                onToggleCollapse={() => toggleSection('infracao')}
                comingSoon={true}
              />
              
              <FilterSection
                title="Sinistro com vítima"
                options={sinistroOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedSinistro}
                onToggle={onSinistroToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('sinistro')}
                onToggleCollapse={() => toggleSection('sinistro')}
                comingSoon={true}
              />
              
              <FilterSection
                title="Rota"
                options={[{ name: "Em breve" }]}
                selectedOptions={[]}
                onToggle={() => {}}
                hasPattern={false}
                isCollapsed={collapsedSections.has('rota')}
                onToggleCollapse={() => toggleSection('rota')}
                comingSoon={true}
              />
              
              <FilterSection
                title="IDECiclo"
                options={[{ name: "Em breve" }]}
                selectedOptions={[]}
                onToggle={() => {}}
                hasPattern={false}
                isCollapsed={collapsedSections.has('ideciclo')}
                onToggleCollapse={() => toggleSection('ideciclo')}
                comingSoon={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Floating toggle button when minimized - mais visível no mobile */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed top-1/2 -translate-y-1/2 left-2 md:left-4 z-[60] bg-blue-500 md:bg-white border-2 border-blue-500 rounded-full p-3 md:p-2 shadow-xl hover:bg-blue-600 md:hover:bg-gray-100 transition-colors"
          title="Expandir filtros"
        >
          <svg className="w-6 h-6 md:w-4 md:h-4 text-white md:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </aside>
  );
}