import { API_CONFIG } from '~/config/api';

export interface CicloDadosFilters {
  lat: number;
  lng: number;
  radius: number;
  street?: string;
  genero?: string;
  raca?: string;
  socio?: string;
  dias?: string;
  contagem_filters?: string[];
  infra_filters?: string[];
  pdc_filters?: string[];
  infracao_filters?: string[];
  sinistro_filters?: string[];
  estacionamento_filters?: string[];
}

export interface DataAvailability {
  available: {
    contagens: boolean;
    sinistros: boolean;
    infraestrutura: boolean;
    sinistrosTotais: boolean;
    velocidade: boolean;
    fluxo: boolean;
    genero: boolean;
    participacaoFeminina: boolean;
    tempoTrajeto: boolean;
    infracoes: boolean;
    estacionamentos: boolean;
  };
  street?: string;
  hasStreetData: boolean;
}

export class CicloDadosService {
  private baseUrl = `${API_CONFIG.GARFO_API_BASE_URL}/ciclodados`;

  async checkDataAvailability(coords: {lat: number, lng: number, radius: number, street?: string}): Promise<DataAvailability> {
    const params = new URLSearchParams({
      lat: coords.lat.toString(),
      lng: coords.lng.toString(),
      radius: coords.radius.toString()
    });
    if (coords.street) params.append('street', coords.street);
    
    try {
      const response = await fetch(`${this.baseUrl}/data-availability?${params}`);
      if (!response.ok) throw new Error('Failed to check data availability');
      return await response.json();
    } catch (error) {
      // Fallback mock data for development
      return {
        available: {
          contagens: true,
          sinistros: true,
          infraestrutura: true,
          sinistrosTotais: true,
          velocidade: true,
          fluxo: true,
          genero: true,
          participacaoFeminina: false,
          tempoTrajeto: true,
          infracoes: true,
          estacionamentos: false
        },
        street: coords.street,
        hasStreetData: !!coords.street
      };
    }
  }

  async searchStreets(query: string, city = 'Recife') {
    const params = new URLSearchParams({ q: query, city });
    const response = await fetch(`${this.baseUrl}/streets/search?${params}`);
    return response.json();
  }

  // Existing cards
  async getContagens(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/contagens?${params}`);
    return response.json();
  }

  async getSinistros(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/sinistros?${params}`);
    return response.json();
  }

  async getInfraestrutura(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/infraestrutura?${params}`);
    return response.json();
  }

  // New cards based on mural
  async getSinistrosTotais(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/sinistros/totais?${params}`);
    return response.json();
  }

  async getVelocidade(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/velocidade?${params}`);
    return response.json();
  }

  async getFluxo(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/fluxo?${params}`);
    return response.json();
  }

  async getGenero(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/genero?${params}`);
    return response.json();
  }

  async getParticipacaoFeminina(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/participacao-feminina?${params}`);
    return response.json();
  }

  async getTempoTrajeto(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/tempo-trajeto?${params}`);
    return response.json();
  }

  async getInfracoesResumo(filters: CicloDadosFilters) {
    const params = this.buildParams(filters);
    const response = await fetch(`${this.baseUrl}/infracoes/resumo?${params}`);
    return response.json();
  }

  // Generic method to fetch any card data
  async getCardData(cardId: string, filters: CicloDadosFilters) {
    const endpoints = {
      'contagens': () => this.getContagens(filters),
      'sinistros': () => this.getSinistros(filters),
      'infraestrutura': () => this.getInfraestrutura(filters),
      'sinistrosTotais': () => this.getSinistrosTotais(filters),
      'velocidade': () => this.getVelocidade(filters),
      'fluxo': () => this.getFluxo(filters),
      'genero': () => this.getGenero(filters),
      'participacaoFeminina': () => this.getParticipacaoFeminina(filters),
      'tempoTrajeto': () => this.getTempoTrajeto(filters),
      'infracoes': () => this.getInfracoesResumo(filters)
    };
    
    const endpoint = endpoints[cardId as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Card endpoint not found: ${cardId}`);
    }
    
    return endpoint();
  }

  // Method to fetch multiple cards at once
  async getMultipleCards(cardIds: string[], filters: CicloDadosFilters) {
    const promises = cardIds.map(cardId => 
      this.getCardData(cardId, filters)
        .then(data => ({ cardId, data, success: true }))
        .catch(error => ({ cardId, error, success: false }))
    );
    
    const results = await Promise.allSettled(promises);
    
    return results.reduce((acc, result, index) => {
      const cardId = cardIds[index];
      if (result.status === 'fulfilled' && result.value.success) {
        acc[cardId] = result.value.data;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  private buildParams(filters: CicloDadosFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    // Add basic parameters
    params.append('lat', filters.lat.toString());
    params.append('lng', filters.lng.toString());
    params.append('radius', filters.radius.toString());
    
    // Add optional filters
    if (filters.street) params.append('street', filters.street);
    if (filters.genero) params.append('genero', filters.genero);
    if (filters.raca) params.append('raca', filters.raca);
    if (filters.socio) params.append('socio', filters.socio);
    if (filters.dias) params.append('dias', filters.dias);
    
    // Add filter arrays
    filters.contagem_filters?.forEach(f => params.append('contagem_filters[]', f));
    filters.infra_filters?.forEach(f => params.append('infra_filters[]', f));
    filters.pdc_filters?.forEach(f => params.append('pdc_filters[]', f));
    filters.infracao_filters?.forEach(f => params.append('infracao_filters[]', f));
    filters.sinistro_filters?.forEach(f => params.append('sinistro_filters[]', f));
    filters.estacionamento_filters?.forEach(f => params.append('estacionamento_filters[]', f));
    
    return params;
  }
}

// Export singleton instance
export const cicloDadosService = new CicloDadosService();