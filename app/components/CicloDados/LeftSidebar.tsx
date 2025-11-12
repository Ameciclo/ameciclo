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
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['infraestrutura', 'contagem', 'pdc', 'infracao', 'sinistro', 'estacionamento', 'perfil', 'rota', 'ideciclo']));
  
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
    setCollapsedSections(new Set(['infraestrutura', 'contagem', 'pdc', 'infracao', 'sinistro', 'estacionamento', 'perfil', 'rota', 'ideciclo']));
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
    selectedEstacionamento.length === estacionamentoOptions.length;
  
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
            {onReloadGeneralData && (
              <button
                onClick={onReloadGeneralData}
                className="hover:bg-gray-200 rounded transition-colors p-1"
                title="Recarregar informações gerais"
              >
                <RotateCcw className="w-4 h-4 text-green-600" />
              </button>
            )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                ) : (
                  <>
                    <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
                    <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
                    <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
                    <rect x="14" y="14" width="7" height="7" strokeWidth={2} />
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
                loadingOptions={loadingStates.infra ? infraOptions.map(opt => opt.name) : []}
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
                loadingOptions={loadingStates.pdc ? pdcOptions.map(opt => opt.name) : []}
              />
              
              <FilterSection
                title="Estacionamento e compartilhamento"
                options={estacionamentoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedEstacionamento}
                onToggle={onEstacionamentoToggle}
                onToggleAll={onEstacionamentoToggleAll}
                hasPattern={false}
                isCollapsed={collapsedSections.has('estacionamento')}
                onToggleCollapse={() => toggleSection('estacionamento')}
                loadingOptions={loadingStates.estacionamento ? estacionamentoOptions : []}
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
                isCollapsed={collapsedSections.has('perfil')}
                onToggleCollapse={() => toggleSection('perfil')}
              />
              
              {/* TODO: Descomentar quando implementar
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
              */}
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