import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  onClearAll: () => void;
  onSelectAll: () => void;
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
  onDiasChange,
  onClearAll,
  onSelectAll
}: LeftSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
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
    setCollapsedSections(new Set(['infraestrutura', 'contagem', 'pdc', 'infracao', 'sinistro', 'estacionamento', 'perfil']));
  };
  
  const expandAll = () => {
    setCollapsedSections(new Set());
  };
  
  const allCollapsed = collapsedSections.size > 0;
  
  // Check if any options are selected across all sections
  const anyOptionsSelected = 
    selectedInfra.length > 0 ||
    selectedContagem.length > 0 ||
    selectedPdc.length > 0 ||
    selectedInfracao.length > 0 ||
    selectedSinistro.length > 0 ||
    selectedEstacionamento.length > 0;
  
  const toggleAllOptions = () => {
    if (anyOptionsSelected) {
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
              title={anyOptionsSelected ? "Ocultar todas as camadas" : "Mostrar todas as camadas"}
            >
              {anyOptionsSelected ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-teal-600" />}
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
                hasPattern={true}
                isCollapsed={collapsedSections.has('infraestrutura')}
                onToggleCollapse={() => toggleSection('infraestrutura')}
              />
              
              <FilterSection
                title="Contagem de ciclistas"
                options={contagemOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedContagem}
                onToggle={onContagemToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('contagem')}
                onToggleCollapse={() => toggleSection('contagem')}
              />
              
              <FilterSection
                title="Plano Diretor Cicloviário"
                options={pdcOptions}
                selectedOptions={selectedPdc}
                onToggle={onPdcToggle}
                hasPattern={true}
                isPdc={true}
                isCollapsed={collapsedSections.has('pdc')}
                onToggleCollapse={() => toggleSection('pdc')}
              />
              
              <FilterSection
                title="Infrações de Trânsito"
                options={infracaoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedInfracao}
                onToggle={onInfracaoToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('infracao')}
                onToggleCollapse={() => toggleSection('infracao')}
              />
              
              <FilterSection
                title="Sinistro com vítima"
                options={sinistroOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedSinistro}
                onToggle={onSinistroToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('sinistro')}
                onToggleCollapse={() => toggleSection('sinistro')}
              />
              
              <FilterSection
                title="Estacionamento e compartilhamento"
                options={estacionamentoOptions.map(opt => ({ name: opt }))}
                selectedOptions={selectedEstacionamento}
                onToggle={onEstacionamentoToggle}
                hasPattern={false}
                isCollapsed={collapsedSections.has('estacionamento')}
                onToggleCollapse={() => toggleSection('estacionamento')}
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